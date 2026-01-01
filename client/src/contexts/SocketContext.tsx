import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSessionStore } from '../stores/sessionStore';
import {
  CLIENT_EVENTS,
  SERVER_EVENTS,
  SessionCreatedPayload,
  SessionJoinedPayload,
  ParticipantJoinedPayload,
  ParticipantLeftPayload,
  ParticipantReconnectedPayload,
  StoryAddedPayload,
  StoryRemovedPayload,
  StoriesReorderedPayload,
  VotingStartedPayload,
  VoteReceivedPayload,
  VotesRevealedPayload,
  StoryFinalizedPayload,
  TimerUpdatedPayload,
  SessionEndedPayload,
  ErrorPayload,
} from '@shared/types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Socket initialization

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      console.log('[Socket] Connected');
      setIsConnected(true);
      useSessionStore.getState().setIsConnecting(false);

      // Try to reconnect to existing session
      const { lastSessionId, participantId } = useSessionStore.getState();
      if (lastSessionId && participantId) {
        console.log('[Socket] Attempting reconnection to session:', lastSessionId);
        newSocket.emit(CLIENT_EVENTS.RECONNECT, {
          sessionId: lastSessionId,
          participantId,
        });
      }
    });

    newSocket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
      setIsConnected(false);
      useSessionStore.getState().setIsConnecting(true);
    });

    newSocket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error);
      useSessionStore.getState().setError('Unable to connect to server. Please try again.');
      useSessionStore.getState().setIsConnecting(false);
    });

    // Session events
    newSocket.on(SERVER_EVENTS.SESSION_CREATED, (payload: SessionCreatedPayload) => {
      console.log('[Socket] Session created:', payload.session.code);
      useSessionStore.getState().setSession(payload.session);
      useSessionStore.getState().setParticipantId(payload.participantId);
    });

    newSocket.on(SERVER_EVENTS.SESSION_JOINED, (payload: SessionJoinedPayload) => {
      console.log('[Socket] Joined session:', payload.session.code);
      useSessionStore.getState().setSession(payload.session);
      useSessionStore.getState().setParticipantId(payload.participantId);
    });

    newSocket.on(SERVER_EVENTS.PARTICIPANT_JOINED, (payload: ParticipantJoinedPayload) => {
      useSessionStore.getState().addParticipant(payload.participant);
    });

    newSocket.on(SERVER_EVENTS.PARTICIPANT_LEFT, (payload: ParticipantLeftPayload) => {
      useSessionStore.getState().removeParticipant(payload.participantId);
    });

    newSocket.on(SERVER_EVENTS.PARTICIPANT_RECONNECTED, (payload: ParticipantReconnectedPayload) => {
      useSessionStore.getState().setParticipantConnected(payload.participantId, true);
    });

    // Story events
    newSocket.on(SERVER_EVENTS.STORY_ADDED, (payload: StoryAddedPayload) => {
      useSessionStore.getState().addStory(payload.story);
    });

    newSocket.on(SERVER_EVENTS.STORY_REMOVED, (payload: StoryRemovedPayload) => {
      useSessionStore.getState().removeStory(payload.storyId);
    });

    newSocket.on(SERVER_EVENTS.STORIES_REORDERED, (payload: StoriesReorderedPayload) => {
      useSessionStore.getState().reorderStories(payload.storyIds);
    });

    // Voting events
    newSocket.on(SERVER_EVENTS.VOTING_STARTED, (payload: VotingStartedPayload) => {
      useSessionStore.getState().setActiveStory(payload.storyId);
      if (payload.timerEndTime) {
        const session = useSessionStore.getState().session;
        if (session) {
          useSessionStore.getState().setTimer(session.timerDuration, payload.timerEndTime);
        }
      }
    });

    newSocket.on(SERVER_EVENTS.VOTE_RECEIVED, (payload: VoteReceivedPayload) => {
      useSessionStore.getState().recordVote(payload.storyId, payload.participantId);
    });

    newSocket.on(SERVER_EVENTS.VOTES_REVEALED, (payload: VotesRevealedPayload) => {
      useSessionStore.getState().revealVotes(payload.storyId, payload.votes);
    });

    newSocket.on(SERVER_EVENTS.STORY_FINALIZED, (payload: StoryFinalizedPayload) => {
      useSessionStore.getState().setStoryFinalPoints(payload.storyId, payload.points);
    });

    // Timer events
    newSocket.on(SERVER_EVENTS.TIMER_UPDATED, (payload: TimerUpdatedPayload) => {
      useSessionStore.getState().setTimer(payload.timerDuration, payload.timerEndTime);
    });

    // Session end
    newSocket.on(SERVER_EVENTS.SESSION_ENDED, (payload: SessionEndedPayload) => {
      useSessionStore.getState().setSummary(payload.summary);
    });

    // Error handling
    newSocket.on(SERVER_EVENTS.ERROR, (payload: ErrorPayload) => {
      console.error('[Socket] Error:', payload.message);
      
      // If session not found during reconnection, clear stale data
      if (payload.code === 'SESSION_NOT_FOUND' || payload.code === 'PARTICIPANT_NOT_FOUND') {
        console.log('[Socket] Clearing stale session data');
        useSessionStore.getState().reset();
      } else {
        // Only show error if it's not a stale reconnection issue
        useSessionStore.getState().setError(payload.message);
      }
    });

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  return useContext(SocketContext);
}
