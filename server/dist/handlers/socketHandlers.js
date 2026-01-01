"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketHandlers = setupSocketHandlers;
const sessionStore_js_1 = require("../store/sessionStore.js");
const types_js_1 = require("../../../shared/types.js");
const socketMeta = new Map();
function setupSocketHandlers(io) {
    io.on('connection', (socket) => {
        console.log(`[Socket] Client connected: ${socket.id}`);
        // ========================================
        // CREATE SESSION
        // ========================================
        socket.on(types_js_1.CLIENT_EVENTS.CREATE_SESSION, (payload) => {
            try {
                const { sessionName, scrumMasterName, pointScale, sessionType } = payload;
                const { session, participantId } = sessionStore_js_1.SessionStore.createSession(sessionName, scrumMasterName, pointScale, sessionType);
                // Track socket -> session mapping
                socketMeta.set(socket.id, { sessionId: session.id, participantId });
                // Join socket room
                socket.join(session.id);
                // Send session details back to creator
                socket.emit(types_js_1.SERVER_EVENTS.SESSION_CREATED, { session, participantId });
                console.log(`[Socket] Session created: ${session.code} by ${scrumMasterName}`);
            }
            catch (error) {
                console.error('[Socket] Error creating session:', error);
                socket.emit(types_js_1.SERVER_EVENTS.ERROR, { message: 'Failed to create session' });
            }
        });
        // ========================================
        // JOIN SESSION
        // ========================================
        socket.on(types_js_1.CLIENT_EVENTS.JOIN_SESSION, (payload) => {
            try {
                const { sessionCode, participantName } = payload;
                const session = sessionStore_js_1.SessionStore.getSessionByCode(sessionCode);
                if (!session) {
                    socket.emit(types_js_1.SERVER_EVENTS.ERROR, {
                        message: 'Session not found. Please check the code and try again.',
                        code: 'SESSION_NOT_FOUND'
                    });
                    return;
                }
                if (session.status === 'completed') {
                    socket.emit(types_js_1.SERVER_EVENTS.ERROR, {
                        message: 'This session has ended.',
                        code: 'SESSION_ENDED'
                    });
                    return;
                }
                const result = sessionStore_js_1.SessionStore.addParticipant(session.id, participantName);
                if (!result) {
                    socket.emit(types_js_1.SERVER_EVENTS.ERROR, { message: 'Failed to join session' });
                    return;
                }
                // Track socket -> session mapping
                socketMeta.set(socket.id, { sessionId: session.id, participantId: result.participantId });
                // Join socket room
                socket.join(session.id);
                // Send session details to the joining participant
                socket.emit(types_js_1.SERVER_EVENTS.SESSION_JOINED, {
                    session: result.session,
                    participantId: result.participantId,
                });
                // Notify others in the room
                const newParticipant = result.session.participants.find((p) => p.id === result.participantId);
                socket.to(session.id).emit(types_js_1.SERVER_EVENTS.PARTICIPANT_JOINED, {
                    participant: newParticipant,
                });
                console.log(`[Socket] ${participantName} joined session ${sessionCode}`);
            }
            catch (error) {
                console.error('[Socket] Error joining session:', error);
                socket.emit(types_js_1.SERVER_EVENTS.ERROR, { message: 'Failed to join session' });
            }
        });
        // ========================================
        // RECONNECT (for page refresh scenarios)
        // ========================================
        socket.on(types_js_1.CLIENT_EVENTS.RECONNECT, (payload) => {
            try {
                const { sessionId, participantId } = payload;
                const session = sessionStore_js_1.SessionStore.getSession(sessionId);
                if (!session) {
                    socket.emit(types_js_1.SERVER_EVENTS.ERROR, {
                        message: 'Session no longer exists',
                        code: 'SESSION_NOT_FOUND'
                    });
                    return;
                }
                const participant = sessionStore_js_1.SessionStore.getParticipant(sessionId, participantId);
                if (!participant) {
                    socket.emit(types_js_1.SERVER_EVENTS.ERROR, {
                        message: 'Participant not found in session',
                        code: 'PARTICIPANT_NOT_FOUND'
                    });
                    return;
                }
                // Update connection status
                sessionStore_js_1.SessionStore.setParticipantConnected(sessionId, participantId, true);
                // Track socket
                socketMeta.set(socket.id, { sessionId, participantId });
                socket.join(sessionId);
                // Send current session state
                socket.emit(types_js_1.SERVER_EVENTS.SESSION_JOINED, { session, participantId });
                // Notify others
                socket.to(sessionId).emit(types_js_1.SERVER_EVENTS.PARTICIPANT_RECONNECTED, { participantId });
                console.log(`[Socket] ${participant.name} reconnected to session ${session.code}`);
            }
            catch (error) {
                console.error('[Socket] Error reconnecting:', error);
                socket.emit(types_js_1.SERVER_EVENTS.ERROR, { message: 'Failed to reconnect' });
            }
        });
        // ========================================
        // ADD STORY
        // ========================================
        socket.on(types_js_1.CLIENT_EVENTS.ADD_STORY, (payload) => {
            const meta = socketMeta.get(socket.id);
            if (!meta)
                return;
            const { title, description } = payload;
            const story = sessionStore_js_1.SessionStore.addStory(meta.sessionId, title, description);
            if (story) {
                io.to(meta.sessionId).emit(types_js_1.SERVER_EVENTS.STORY_ADDED, { story });
            }
        });
        // ========================================
        // REMOVE STORY
        // ========================================
        socket.on(types_js_1.CLIENT_EVENTS.REMOVE_STORY, (payload) => {
            const meta = socketMeta.get(socket.id);
            if (!meta)
                return;
            // Only Scrum Master can remove stories
            const session = sessionStore_js_1.SessionStore.getSession(meta.sessionId);
            if (!session || session.scrumMasterId !== meta.participantId)
                return;
            if (sessionStore_js_1.SessionStore.removeStory(meta.sessionId, payload.storyId)) {
                io.to(meta.sessionId).emit(types_js_1.SERVER_EVENTS.STORY_REMOVED, { storyId: payload.storyId });
            }
        });
        // ========================================
        // REORDER STORIES
        // ========================================
        socket.on(types_js_1.CLIENT_EVENTS.REORDER_STORIES, (payload) => {
            const meta = socketMeta.get(socket.id);
            if (!meta)
                return;
            // Only Scrum Master can reorder
            const session = sessionStore_js_1.SessionStore.getSession(meta.sessionId);
            if (!session || session.scrumMasterId !== meta.participantId)
                return;
            if (sessionStore_js_1.SessionStore.reorderStories(meta.sessionId, payload.storyIds)) {
                io.to(meta.sessionId).emit(types_js_1.SERVER_EVENTS.STORIES_REORDERED, { storyIds: payload.storyIds });
            }
        });
        // ========================================
        // START VOTING
        // ========================================
        socket.on(types_js_1.CLIENT_EVENTS.START_VOTING, (payload) => {
            const meta = socketMeta.get(socket.id);
            if (!meta)
                return;
            // Only Scrum Master can start voting
            const session = sessionStore_js_1.SessionStore.getSession(meta.sessionId);
            if (!session || session.scrumMasterId !== meta.participantId)
                return;
            if (sessionStore_js_1.SessionStore.startVoting(meta.sessionId, payload.storyId)) {
                const updatedSession = sessionStore_js_1.SessionStore.getSession(meta.sessionId);
                io.to(meta.sessionId).emit(types_js_1.SERVER_EVENTS.VOTING_STARTED, {
                    storyId: payload.storyId,
                    timerEndTime: updatedSession?.timerEndTime || null,
                });
            }
        });
        // ========================================
        // SUBMIT VOTE
        // ========================================
        socket.on(types_js_1.CLIENT_EVENTS.SUBMIT_VOTE, (payload) => {
            const meta = socketMeta.get(socket.id);
            if (!meta)
                return;
            const { storyId, value } = payload;
            if (sessionStore_js_1.SessionStore.submitVote(meta.sessionId, storyId, meta.participantId, value)) {
                io.to(meta.sessionId).emit(types_js_1.SERVER_EVENTS.VOTE_RECEIVED, {
                    participantId: meta.participantId,
                    storyId,
                });
            }
        });
        // ========================================
        // REVEAL VOTES
        // ========================================
        socket.on(types_js_1.CLIENT_EVENTS.REVEAL_VOTES, (payload) => {
            const meta = socketMeta.get(socket.id);
            if (!meta)
                return;
            // Only Scrum Master can reveal
            const session = sessionStore_js_1.SessionStore.getSession(meta.sessionId);
            if (!session || session.scrumMasterId !== meta.participantId)
                return;
            const votes = sessionStore_js_1.SessionStore.revealVotes(meta.sessionId, payload.storyId);
            if (votes) {
                io.to(meta.sessionId).emit(types_js_1.SERVER_EVENTS.VOTES_REVEALED, {
                    storyId: payload.storyId,
                    votes,
                });
            }
        });
        // ========================================
        // SET FINAL POINTS
        // ========================================
        socket.on(types_js_1.CLIENT_EVENTS.SET_FINAL_POINTS, (payload) => {
            const meta = socketMeta.get(socket.id);
            if (!meta)
                return;
            // Only Scrum Master can set final points
            const session = sessionStore_js_1.SessionStore.getSession(meta.sessionId);
            if (!session || session.scrumMasterId !== meta.participantId)
                return;
            if (sessionStore_js_1.SessionStore.setFinalPoints(meta.sessionId, payload.storyId, payload.points)) {
                io.to(meta.sessionId).emit(types_js_1.SERVER_EVENTS.STORY_FINALIZED, {
                    storyId: payload.storyId,
                    points: payload.points,
                });
            }
        });
        // ========================================
        // SET TIMER
        // ========================================
        socket.on(types_js_1.CLIENT_EVENTS.SET_TIMER, (payload) => {
            const meta = socketMeta.get(socket.id);
            if (!meta)
                return;
            // Only Scrum Master can set timer
            const session = sessionStore_js_1.SessionStore.getSession(meta.sessionId);
            if (!session || session.scrumMasterId !== meta.participantId)
                return;
            if (sessionStore_js_1.SessionStore.setTimer(meta.sessionId, payload.duration)) {
                const updatedSession = sessionStore_js_1.SessionStore.getSession(meta.sessionId);
                io.to(meta.sessionId).emit(types_js_1.SERVER_EVENTS.TIMER_UPDATED, {
                    timerDuration: updatedSession?.timerDuration || null,
                    timerEndTime: updatedSession?.timerEndTime || null,
                });
            }
        });
        // ========================================
        // END SESSION
        // ========================================
        socket.on(types_js_1.CLIENT_EVENTS.END_SESSION, () => {
            const meta = socketMeta.get(socket.id);
            if (!meta)
                return;
            // Only Scrum Master can end session
            const session = sessionStore_js_1.SessionStore.getSession(meta.sessionId);
            if (!session || session.scrumMasterId !== meta.participantId)
                return;
            const summary = sessionStore_js_1.SessionStore.endSession(meta.sessionId);
            if (summary) {
                io.to(meta.sessionId).emit(types_js_1.SERVER_EVENTS.SESSION_ENDED, { summary });
            }
        });
        // ========================================
        // DISCONNECT
        // ========================================
        socket.on('disconnect', () => {
            const meta = socketMeta.get(socket.id);
            if (meta) {
                sessionStore_js_1.SessionStore.setParticipantConnected(meta.sessionId, meta.participantId, false);
                socket.to(meta.sessionId).emit(types_js_1.SERVER_EVENTS.PARTICIPANT_LEFT, {
                    participantId: meta.participantId,
                });
                socketMeta.delete(socket.id);
                console.log(`[Socket] Client disconnected: ${socket.id}`);
            }
        });
    });
}
//# sourceMappingURL=socketHandlers.js.map