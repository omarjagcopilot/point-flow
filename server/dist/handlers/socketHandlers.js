import { SessionStore } from '../store/sessionStore.js';
import { CLIENT_EVENTS, SERVER_EVENTS, } from '../shared/types.js';
const socketMeta = new Map();
export function setupSocketHandlers(io) {
    io.on('connection', (socket) => {
        console.log(`[Socket] Client connected: ${socket.id}`);
        // ========================================
        // CREATE SESSION
        // ========================================
        socket.on(CLIENT_EVENTS.CREATE_SESSION, (payload) => {
            try {
                const { sessionName, scrumMasterName, pointScale, sessionType } = payload;
                const { session, participantId } = SessionStore.createSession(sessionName, scrumMasterName, pointScale, sessionType);
                // Track socket -> session mapping
                socketMeta.set(socket.id, { sessionId: session.id, participantId });
                // Join socket room
                socket.join(session.id);
                // Send session details back to creator
                socket.emit(SERVER_EVENTS.SESSION_CREATED, { session, participantId });
                console.log(`[Socket] Session created: ${session.code} by ${scrumMasterName}`);
            }
            catch (error) {
                console.error('[Socket] Error creating session:', error);
                socket.emit(SERVER_EVENTS.ERROR, { message: 'Failed to create session' });
            }
        });
        // ========================================
        // JOIN SESSION
        // ========================================
        socket.on(CLIENT_EVENTS.JOIN_SESSION, (payload) => {
            try {
                const { sessionCode, participantName } = payload;
                const session = SessionStore.getSessionByCode(sessionCode);
                if (!session) {
                    socket.emit(SERVER_EVENTS.ERROR, {
                        message: 'Session not found. Please check the code and try again.',
                        code: 'SESSION_NOT_FOUND'
                    });
                    return;
                }
                if (session.status === 'completed') {
                    socket.emit(SERVER_EVENTS.ERROR, {
                        message: 'This session has ended.',
                        code: 'SESSION_ENDED'
                    });
                    return;
                }
                const result = SessionStore.addParticipant(session.id, participantName);
                if (!result) {
                    socket.emit(SERVER_EVENTS.ERROR, { message: 'Failed to join session' });
                    return;
                }
                // Track socket -> session mapping
                socketMeta.set(socket.id, { sessionId: session.id, participantId: result.participantId });
                // Join socket room
                socket.join(session.id);
                // Send session details to the joining participant
                socket.emit(SERVER_EVENTS.SESSION_JOINED, {
                    session: result.session,
                    participantId: result.participantId,
                });
                // Notify others in the room
                const newParticipant = result.session.participants.find((p) => p.id === result.participantId);
                socket.to(session.id).emit(SERVER_EVENTS.PARTICIPANT_JOINED, {
                    participant: newParticipant,
                });
                console.log(`[Socket] ${participantName} joined session ${sessionCode}`);
            }
            catch (error) {
                console.error('[Socket] Error joining session:', error);
                socket.emit(SERVER_EVENTS.ERROR, { message: 'Failed to join session' });
            }
        });
        // ========================================
        // RECONNECT (for page refresh scenarios)
        // ========================================
        socket.on(CLIENT_EVENTS.RECONNECT, (payload) => {
            try {
                const { sessionId, participantId } = payload;
                const session = SessionStore.getSession(sessionId);
                if (!session) {
                    socket.emit(SERVER_EVENTS.ERROR, {
                        message: 'Session no longer exists',
                        code: 'SESSION_NOT_FOUND'
                    });
                    return;
                }
                const participant = SessionStore.getParticipant(sessionId, participantId);
                if (!participant) {
                    socket.emit(SERVER_EVENTS.ERROR, {
                        message: 'Participant not found in session',
                        code: 'PARTICIPANT_NOT_FOUND'
                    });
                    return;
                }
                // Update connection status
                SessionStore.setParticipantConnected(sessionId, participantId, true);
                // Track socket
                socketMeta.set(socket.id, { sessionId, participantId });
                socket.join(sessionId);
                // Send current session state
                socket.emit(SERVER_EVENTS.SESSION_JOINED, { session, participantId });
                // Notify others
                socket.to(sessionId).emit(SERVER_EVENTS.PARTICIPANT_RECONNECTED, { participantId });
                console.log(`[Socket] ${participant.name} reconnected to session ${session.code}`);
            }
            catch (error) {
                console.error('[Socket] Error reconnecting:', error);
                socket.emit(SERVER_EVENTS.ERROR, { message: 'Failed to reconnect' });
            }
        });
        // ========================================
        // ADD STORY
        // ========================================
        socket.on(CLIENT_EVENTS.ADD_STORY, (payload) => {
            const meta = socketMeta.get(socket.id);
            if (!meta)
                return;
            const { title, description } = payload;
            const story = SessionStore.addStory(meta.sessionId, title, description);
            if (story) {
                io.to(meta.sessionId).emit(SERVER_EVENTS.STORY_ADDED, { story });
            }
        });
        // ========================================
        // UPDATE STORY
        // ========================================
        socket.on(CLIENT_EVENTS.UPDATE_STORY, (payload) => {
            const meta = socketMeta.get(socket.id);
            if (!meta)
                return;
            // Only Scrum Master can update stories
            const session = SessionStore.getSession(meta.sessionId);
            if (!session || session.scrumMasterId !== meta.participantId)
                return;
            const { storyId, title, description } = payload;
            const story = SessionStore.updateStory(meta.sessionId, storyId, { title, description });
            if (story) {
                io.to(meta.sessionId).emit(SERVER_EVENTS.STORY_UPDATED, { story });
            }
        });
        // ========================================
        // REMOVE STORY
        // ========================================
        socket.on(CLIENT_EVENTS.REMOVE_STORY, (payload) => {
            const meta = socketMeta.get(socket.id);
            if (!meta)
                return;
            // Only Scrum Master can remove stories
            const session = SessionStore.getSession(meta.sessionId);
            if (!session || session.scrumMasterId !== meta.participantId)
                return;
            if (SessionStore.removeStory(meta.sessionId, payload.storyId)) {
                io.to(meta.sessionId).emit(SERVER_EVENTS.STORY_REMOVED, { storyId: payload.storyId });
            }
        });
        // ========================================
        // REMOVE PARTICIPANT
        // ========================================
        socket.on(CLIENT_EVENTS.REMOVE_PARTICIPANT, (payload) => {
            const meta = socketMeta.get(socket.id);
            if (!meta)
                return;
            // Only Scrum Master can remove participants
            const session = SessionStore.getSession(meta.sessionId);
            if (!session || session.scrumMasterId !== meta.participantId)
                return;
            const participant = SessionStore.getParticipant(meta.sessionId, payload.participantId);
            if (!participant)
                return;
            if (SessionStore.removeParticipant(meta.sessionId, payload.participantId)) {
                io.to(meta.sessionId).emit(SERVER_EVENTS.PARTICIPANT_REMOVED, {
                    participantId: payload.participantId,
                    removedBy: meta.participantId,
                });
                console.log(`[Socket] Scrum master removed ${participant.name} from session ${session.code}`);
            }
        });
        // ========================================
        // REORDER STORIES
        // ========================================
        socket.on(CLIENT_EVENTS.REORDER_STORIES, (payload) => {
            const meta = socketMeta.get(socket.id);
            if (!meta)
                return;
            // Only Scrum Master can reorder
            const session = SessionStore.getSession(meta.sessionId);
            if (!session || session.scrumMasterId !== meta.participantId)
                return;
            if (SessionStore.reorderStories(meta.sessionId, payload.storyIds)) {
                io.to(meta.sessionId).emit(SERVER_EVENTS.STORIES_REORDERED, { storyIds: payload.storyIds });
            }
        });
        // ========================================
        // START VOTING
        // ========================================
        socket.on(CLIENT_EVENTS.START_VOTING, (payload) => {
            const meta = socketMeta.get(socket.id);
            if (!meta)
                return;
            // Only Scrum Master can start voting
            const session = SessionStore.getSession(meta.sessionId);
            if (!session || session.scrumMasterId !== meta.participantId)
                return;
            if (SessionStore.startVoting(meta.sessionId, payload.storyId)) {
                const updatedSession = SessionStore.getSession(meta.sessionId);
                io.to(meta.sessionId).emit(SERVER_EVENTS.VOTING_STARTED, {
                    storyId: payload.storyId,
                    timerEndTime: updatedSession?.timerEndTime || null,
                });
            }
        });
        // ========================================
        // SUBMIT VOTE
        // ========================================
        socket.on(CLIENT_EVENTS.SUBMIT_VOTE, (payload) => {
            const meta = socketMeta.get(socket.id);
            if (!meta)
                return;
            const { storyId, value } = payload;
            if (SessionStore.submitVote(meta.sessionId, storyId, meta.participantId, value)) {
                io.to(meta.sessionId).emit(SERVER_EVENTS.VOTE_RECEIVED, {
                    participantId: meta.participantId,
                    storyId,
                });
            }
        });
        // ========================================
        // REVEAL VOTES
        // ========================================
        socket.on(CLIENT_EVENTS.REVEAL_VOTES, (payload) => {
            const meta = socketMeta.get(socket.id);
            if (!meta)
                return;
            // Only Scrum Master can reveal
            const session = SessionStore.getSession(meta.sessionId);
            if (!session || session.scrumMasterId !== meta.participantId)
                return;
            const votes = SessionStore.revealVotes(meta.sessionId, payload.storyId);
            if (votes) {
                io.to(meta.sessionId).emit(SERVER_EVENTS.VOTES_REVEALED, {
                    storyId: payload.storyId,
                    votes,
                });
            }
        });
        // ========================================
        // SET FINAL POINTS
        // ========================================
        socket.on(CLIENT_EVENTS.SET_FINAL_POINTS, (payload) => {
            const meta = socketMeta.get(socket.id);
            if (!meta)
                return;
            // Only Scrum Master can set final points
            const session = SessionStore.getSession(meta.sessionId);
            if (!session || session.scrumMasterId !== meta.participantId)
                return;
            if (SessionStore.setFinalPoints(meta.sessionId, payload.storyId, payload.points)) {
                io.to(meta.sessionId).emit(SERVER_EVENTS.STORY_FINALIZED, {
                    storyId: payload.storyId,
                    points: payload.points,
                });
            }
        });
        // ========================================
        // SET TIMER
        // ========================================
        socket.on(CLIENT_EVENTS.SET_TIMER, (payload) => {
            const meta = socketMeta.get(socket.id);
            if (!meta)
                return;
            // Only Scrum Master can set timer
            const session = SessionStore.getSession(meta.sessionId);
            if (!session || session.scrumMasterId !== meta.participantId)
                return;
            if (SessionStore.setTimer(meta.sessionId, payload.duration)) {
                const updatedSession = SessionStore.getSession(meta.sessionId);
                io.to(meta.sessionId).emit(SERVER_EVENTS.TIMER_UPDATED, {
                    timerDuration: updatedSession?.timerDuration || null,
                    timerEndTime: updatedSession?.timerEndTime || null,
                });
            }
        });
        // ========================================
        // END SESSION
        // ========================================
        socket.on(CLIENT_EVENTS.END_SESSION, () => {
            const meta = socketMeta.get(socket.id);
            if (!meta)
                return;
            // Only Scrum Master can end session
            const session = SessionStore.getSession(meta.sessionId);
            if (!session || session.scrumMasterId !== meta.participantId)
                return;
            const summary = SessionStore.endSession(meta.sessionId);
            if (summary) {
                io.to(meta.sessionId).emit(SERVER_EVENTS.SESSION_ENDED, { summary });
            }
        });
        // ========================================
        // DISCONNECT
        // ========================================
        socket.on('disconnect', () => {
            const meta = socketMeta.get(socket.id);
            if (meta) {
                SessionStore.setParticipantConnected(meta.sessionId, meta.participantId, false);
                socket.to(meta.sessionId).emit(SERVER_EVENTS.PARTICIPANT_LEFT, {
                    participantId: meta.participantId,
                });
                socketMeta.delete(socket.id);
                console.log(`[Socket] Client disconnected: ${socket.id}`);
            }
        });
    });
}
//# sourceMappingURL=socketHandlers.js.map