import { useCallback } from 'react';
import { useSocketContext } from '../contexts/SocketContext';
import { useSessionStore } from '../stores/sessionStore';
import {
  CLIENT_EVENTS,
  PointScale,
  SessionType,
} from '@shared/types';

export function useSocket() {
  const { socket, isConnected } = useSocketContext();
  const { session } = useSessionStore();

  const createSession = useCallback((
    sessionName: string,
    scrumMasterName: string,
    pointScale: PointScale,
    sessionType: SessionType
  ) => {
    if (!socket) {
      console.error('[useSocket] Cannot create session: socket not connected');
      return;
    }
    socket.emit(CLIENT_EVENTS.CREATE_SESSION, {
      sessionName,
      scrumMasterName,
      pointScale,
      sessionType,
    });
  }, [socket]);

  const joinSession = useCallback((sessionCode: string, participantName: string) => {
    if (!socket) {
      console.error('[useSocket] Cannot join session: socket not connected');
      return;
    }
    socket.emit(CLIENT_EVENTS.JOIN_SESSION, {
      sessionCode: sessionCode.toUpperCase(),
      participantName,
    });
  }, [socket]);

  const addStory = useCallback((title: string, description?: string) => {
    if (!socket || !session) {
      console.error('[useSocket] Cannot add story: socket not connected or no session');
      return;
    }
    socket.emit(CLIENT_EVENTS.ADD_STORY, {
      sessionId: session.id,
      title,
      description,
    });
  }, [socket, session]);

  const removeStory = useCallback((storyId: string) => {
    if (!socket || !session) {
      console.error('[useSocket] Cannot remove story: socket not connected or no session');
      return;
    }
    socket.emit(CLIENT_EVENTS.REMOVE_STORY, {
      sessionId: session.id,
      storyId,
    });
  }, [socket, session]);

  const reorderStories = useCallback((storyIds: string[]) => {
    if (!socket || !session) {
      console.error('[useSocket] Cannot reorder stories: socket not connected or no session');
      return;
    }
    socket.emit(CLIENT_EVENTS.REORDER_STORIES, {
      sessionId: session.id,
      storyIds,
    });
  }, [socket, session]);

  const startVoting = useCallback((storyId: string) => {
    if (!socket || !session) {
      console.error('[useSocket] Cannot start voting: socket not connected or no session');
      return;
    }
    socket.emit(CLIENT_EVENTS.START_VOTING, {
      sessionId: session.id,
      storyId,
    });
  }, [socket, session]);

  const submitVote = useCallback((storyId: string, value: string) => {
    if (!socket || !session) {
      console.error('[useSocket] Cannot submit vote: socket not connected or no session');
      return;
    }
    socket.emit(CLIENT_EVENTS.SUBMIT_VOTE, {
      sessionId: session.id,
      storyId,
      value,
    });
  }, [socket, session]);

  const revealVotes = useCallback((storyId: string) => {
    if (!socket || !session) {
      console.error('[useSocket] Cannot reveal votes: socket not connected or no session');
      return;
    }
    socket.emit(CLIENT_EVENTS.REVEAL_VOTES, {
      sessionId: session.id,
      storyId,
    });
  }, [socket, session]);

  const setFinalPoints = useCallback((storyId: string, points: string) => {
    if (!socket || !session) {
      console.error('[useSocket] Cannot set final points: socket not connected or no session');
      return;
    }
    socket.emit(CLIENT_EVENTS.SET_FINAL_POINTS, {
      sessionId: session.id,
      storyId,
      points,
    });
  }, [socket, session]);

  const setTimer = useCallback((duration: number | null) => {
    if (!socket || !session) {
      console.error('[useSocket] Cannot set timer: socket not connected or no session');
      return;
    }
    socket.emit(CLIENT_EVENTS.SET_TIMER, {
      sessionId: session.id,
      duration,
    });
  }, [socket, session]);

  const endSession = useCallback(() => {
    if (!socket || !session) {
      console.error('[useSocket] Cannot end session: socket not connected or no session');
      return;
    }
    socket.emit(CLIENT_EVENTS.END_SESSION, {
      sessionId: session.id,
    });
  }, [socket, session]);

  return {
    socket,
    isConnected,
    createSession,
    joinSession,
    addStory,
    removeStory,
    reorderStories,
    startVoting,
    submitVote,
    revealVotes,
    setFinalPoints,
    setTimer,
    endSession,
  };
}
