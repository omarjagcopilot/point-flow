import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session, Participant, Story, Vote, SessionSummary } from '@shared/types';

interface SessionState {
  // Session data
  session: Session | null;
  participantId: string | null;
  lastSessionId: string | null;  // For reconnection
  summary: SessionSummary | null;

  // UI state
  error: string | null;
  isConnecting: boolean;

  // Actions
  setSession: (session: Session | null) => void;
  setParticipantId: (id: string | null) => void;
  setSummary: (summary: SessionSummary | null) => void;
  setError: (error: string | null) => void;
  setIsConnecting: (isConnecting: boolean) => void;

  // Participant updates
  addParticipant: (participant: Participant) => void;
  removeParticipant: (participantId: string) => void;
  setParticipantConnected: (participantId: string, isConnected: boolean) => void;

  // Story updates
  addStory: (story: Story) => void;
  removeStory: (storyId: string) => void;
  reorderStories: (storyIds: string[]) => void;
  setActiveStory: (storyId: string | null) => void;
  setStoryStatus: (storyId: string, status: Story['status']) => void;
  setStoryFinalPoints: (storyId: string, points: string) => void;

  // Vote updates
  recordVote: (storyId: string, participantId: string) => void;
  revealVotes: (storyId: string, votes: Vote[]) => void;

  // Timer updates
  setTimer: (duration: number | null, endTime: string | null) => void;

  // Computed helpers
  getCurrentStory: () => Story | null;
  isScrumMaster: () => boolean;
  getMyVote: () => Vote | null;
  hasEveryoneVoted: () => boolean;

  // Reset
  reset: () => void;
}

const initialState = {
  session: null,
  participantId: null,
  lastSessionId: null,
  summary: null,
  error: null,
  isConnecting: false,
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSession: (session) => set({ 
        session, 
        error: null,
        lastSessionId: session?.id || get().lastSessionId,
      }),
      setParticipantId: (participantId) => set({ participantId }),
      setSummary: (summary) => set({ summary }),
      setError: (error) => set({ error }),
      setIsConnecting: (isConnecting) => set({ isConnecting }),

      addParticipant: (participant) =>
        set((state) => {
          if (!state.session) return state;
          // Check if participant already exists
          const exists = state.session.participants.some(p => p.id === participant.id);
          if (exists) return state;
          return {
            session: {
              ...state.session,
              participants: [...state.session.participants, participant],
            },
          };
        }),

      removeParticipant: (participantId) =>
        set((state) => {
          if (!state.session) return state;
          return {
            session: {
              ...state.session,
              participants: state.session.participants.map((p) =>
                p.id === participantId ? { ...p, isConnected: false } : p
              ),
            },
          };
        }),

      setParticipantConnected: (participantId, isConnected) =>
        set((state) => {
          if (!state.session) return state;
          return {
            session: {
              ...state.session,
              participants: state.session.participants.map((p) =>
                p.id === participantId ? { ...p, isConnected } : p
              ),
            },
          };
        }),

      addStory: (story) =>
        set((state) => {
          if (!state.session) return state;
          return {
            session: {
              ...state.session,
              stories: [...state.session.stories, story],
            },
          };
        }),

      removeStory: (storyId) =>
        set((state) => {
          if (!state.session) return state;
          return {
            session: {
              ...state.session,
              stories: state.session.stories.filter((s) => s.id !== storyId),
              activeStoryId:
                state.session.activeStoryId === storyId
                  ? null
                  : state.session.activeStoryId,
            },
          };
        }),

      reorderStories: (storyIds) =>
        set((state) => {
          if (!state.session) return state;
          const storyMap = new Map(state.session.stories.map((s) => [s.id, s]));
          const reordered = storyIds
            .map((id, index) => {
              const story = storyMap.get(id);
              return story ? { ...story, order: index } : null;
            })
            .filter((s): s is Story => s !== null);
          return {
            session: {
              ...state.session,
              stories: reordered,
            },
          };
        }),

      setActiveStory: (storyId) =>
        set((state) => {
          if (!state.session) return state;
          return {
            session: {
              ...state.session,
              activeStoryId: storyId,
              stories: state.session.stories.map((s) => {
                if (s.id === storyId) {
                  return { ...s, status: 'voting' as const, votes: [] };
                }
                if (s.status === 'voting') {
                  return { ...s, status: 'pending' as const, votes: [] };
                }
                return s;
              }),
            },
          };
        }),

      setStoryStatus: (storyId, status) =>
        set((state) => {
          if (!state.session) return state;
          return {
            session: {
              ...state.session,
              stories: state.session.stories.map((s) =>
                s.id === storyId ? { ...s, status } : s
              ),
            },
          };
        }),

      setStoryFinalPoints: (storyId, points) =>
        set((state) => {
          if (!state.session) return state;
          return {
            session: {
              ...state.session,
              stories: state.session.stories.map((s) =>
                s.id === storyId
                  ? { ...s, finalPoints: points, status: 'final' as const }
                  : s
              ),
              activeStoryId: null,
            },
          };
        }),

      recordVote: (storyId, participantId) =>
        set((state) => {
          if (!state.session) return state;
          // Just track that a vote was received (value hidden until reveal)
          return {
            session: {
              ...state.session,
              stories: state.session.stories.map((s) => {
                if (s.id !== storyId) return s;
                const existingVote = s.votes.find(
                  (v) => v.participantId === participantId
                );
                if (existingVote) return s;
                return {
                  ...s,
                  votes: [
                    ...s.votes,
                    {
                      participantId,
                      value: '?', // Hidden until reveal
                      timestamp: new Date().toISOString(),
                    },
                  ],
                };
              }),
            },
          };
        }),

      revealVotes: (storyId, votes) =>
        set((state) => {
          if (!state.session) return state;
          return {
            session: {
              ...state.session,
              stories: state.session.stories.map((s) =>
                s.id === storyId
                  ? { ...s, status: 'revealed' as const, votes }
                  : s
              ),
              timerEndTime: null,
            },
          };
        }),

      setTimer: (duration, endTime) =>
        set((state) => {
          if (!state.session) return state;
          return {
            session: {
              ...state.session,
              timerDuration: duration,
              timerEndTime: endTime,
            },
          };
        }),

      getCurrentStory: () => {
        const { session } = get();
        if (!session || !session.activeStoryId) return null;
        return session.stories.find((s) => s.id === session.activeStoryId) || null;
      },

      isScrumMaster: () => {
        const { session, participantId } = get();
        return session?.scrumMasterId === participantId;
      },

      getMyVote: () => {
        const { session, participantId } = get();
        if (!session || !session.activeStoryId || !participantId) return null;
        const story = session.stories.find((s) => s.id === session.activeStoryId);
        return story?.votes.find((v) => v.participantId === participantId) || null;
      },

      hasEveryoneVoted: () => {
        const { session } = get();
        if (!session || !session.activeStoryId) return false;
        const story = session.stories.find((s) => s.id === session.activeStoryId);
        if (!story) return false;
        const connectedParticipants = session.participants.filter(
          (p) => p.isConnected
        );
        return story.votes.length >= connectedParticipants.length;
      },

      reset: () => {
        console.log('[SessionStore] Resetting store');
        return set(initialState);
      },
    }),
    {
      name: 'point-flow-session',
      partialize: (state) => ({
        participantId: state.participantId,
        lastSessionId: state.lastSessionId,
      }),
    }
  )
);
