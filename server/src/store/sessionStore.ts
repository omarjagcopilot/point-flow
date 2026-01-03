import {
  Session,
  Story,
  Participant,
  Vote,
  PointScale,
  SessionType,
  SessionSummary,
} from '../shared/types.js';
import { nanoid } from 'nanoid';

// In-memory session store
const sessions = new Map<string, Session>();
const codeToSessionId = new Map<string, string>();

// Session expiry: 24 hours
const SESSION_TTL = 24 * 60 * 60 * 1000;

// Generate a unique 6-character session code
function generateSessionCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing chars (0/O, 1/I)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Ensure uniqueness
  if (codeToSessionId.has(code)) {
    return generateSessionCode();
  }
  return code;
}

// Clean up expired sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (new Date(session.expiresAt).getTime() < now) {
      codeToSessionId.delete(session.code);
      sessions.delete(id);
      console.log(`[SessionStore] Cleaned up expired session: ${session.code}`);
    }
  }
}, 60 * 1000); // Check every minute

export const SessionStore = {
  // Create a new session
  createSession(
    sessionName: string,
    scrumMasterName: string,
    pointScale: PointScale,
    sessionType: SessionType
  ): { session: Session; participantId: string } {
    const sessionId = nanoid();
    const participantId = nanoid();
    const code = generateSessionCode();
    const now = new Date().toISOString();

    const scrumMaster: Participant = {
      id: participantId,
      name: scrumMasterName,
      role: 'scrum_master',
      isConnected: true,
      joinedAt: now,
    };

    const session: Session = {
      id: sessionId,
      code,
      name: sessionName,
      scrumMasterId: participantId,
      type: sessionType,
      status: sessionType === 'quick' ? 'active' : 'lobby',
      pointScale,
      stories: [],
      activeStoryId: null,
      participants: [scrumMaster],
      timerDuration: null,
      timerEndTime: null,
      createdAt: now,
      expiresAt: new Date(Date.now() + SESSION_TTL).toISOString(),
    };

    // For quick sessions, create a default story
    if (sessionType === 'quick') {
      const defaultStory: Story = {
        id: nanoid(),
        title: 'Story 1',
        status: 'voting',
        votes: [],
        finalPoints: null,
        order: 0,
      };
      session.stories.push(defaultStory);
      session.activeStoryId = defaultStory.id;
    }

    sessions.set(sessionId, session);
    codeToSessionId.set(code, sessionId);

    console.log(`[SessionStore] Created session: ${code} (${sessionName})`);
    return { session, participantId };
  },

  // Get session by code
  getSessionByCode(code: string): Session | null {
    const sessionId = codeToSessionId.get(code.toUpperCase());
    if (!sessionId) return null;
    return sessions.get(sessionId) || null;
  },

  // Get session by ID
  getSession(sessionId: string): Session | null {
    return sessions.get(sessionId) || null;
  },

  // Add participant to session
  addParticipant(
    sessionId: string,
    name: string
  ): { session: Session; participantId: string } | null {
    const session = sessions.get(sessionId);
    if (!session) return null;

    const participantId = nanoid();
    const participant: Participant = {
      id: participantId,
      name,
      role: 'developer',
      isConnected: true,
      joinedAt: new Date().toISOString(),
    };

    session.participants.push(participant);
    console.log(`[SessionStore] ${name} joined session ${session.code}`);
    return { session, participantId };
  },

  // Update participant connection status
  setParticipantConnected(
    sessionId: string,
    participantId: string,
    isConnected: boolean
  ): boolean {
    const session = sessions.get(sessionId);
    if (!session) return false;

    const participant = session.participants.find((p) => p.id === participantId);
    if (!participant) return false;

    participant.isConnected = isConnected;
    return true;
  },

  // Get participant by ID
  getParticipant(sessionId: string, participantId: string): Participant | null {
    const session = sessions.get(sessionId);
    if (!session) return null;
    return session.participants.find((p) => p.id === participantId) || null;
  },

  // Remove participant from session (scrum master only)
  removeParticipant(sessionId: string, participantId: string): boolean {
    const session = sessions.get(sessionId);
    if (!session) return false;

    // Can't remove the scrum master
    if (participantId === session.scrumMasterId) return false;

    const index = session.participants.findIndex((p) => p.id === participantId);
    if (index === -1) return false;

    const participant = session.participants[index];
    session.participants.splice(index, 1);

    // Remove their votes from all stories
    session.stories.forEach((story) => {
      story.votes = story.votes.filter((v) => v.participantId !== participantId);
    });

    console.log(`[SessionStore] Removed ${participant.name} from session ${session.code}`);
    return true;
  },

  // Update story details
  updateStory(sessionId: string, storyId: string, updates: { title?: string; description?: string }): Story | null {
    const session = sessions.get(sessionId);
    if (!session) return null;

    const story = session.stories.find((s) => s.id === storyId);
    if (!story) return null;

    if (updates.title !== undefined) story.title = updates.title;
    if (updates.description !== undefined) story.description = updates.description;

    return story;
  },

  // Add story to session
  addStory(sessionId: string, title: string, description?: string): Story | null {
    const session = sessions.get(sessionId);
    if (!session) return null;

    const story: Story = {
      id: nanoid(),
      title,
      description,
      status: 'pending',
      votes: [],
      finalPoints: null,
      order: session.stories.length,
    };

    session.stories.push(story);
    console.log(`[SessionStore] Added story "${title}" to session ${session.code}`);
    return story;
  },

  // Remove story from session
  removeStory(sessionId: string, storyId: string): boolean {
    const session = sessions.get(sessionId);
    if (!session) return false;

    const index = session.stories.findIndex((s) => s.id === storyId);
    if (index === -1) return false;

    session.stories.splice(index, 1);
    // Update order for remaining stories
    session.stories.forEach((s, i) => (s.order = i));

    if (session.activeStoryId === storyId) {
      session.activeStoryId = null;
    }

    return true;
  },

  // Reorder stories
  reorderStories(sessionId: string, storyIds: string[]): boolean {
    const session = sessions.get(sessionId);
    if (!session) return false;

    const reorderedStories: Story[] = [];
    for (const id of storyIds) {
      const story = session.stories.find((s) => s.id === id);
      if (story) {
        story.order = reorderedStories.length;
        reorderedStories.push(story);
      }
    }

    session.stories = reorderedStories;
    return true;
  },

  // Start voting on a story
  startVoting(sessionId: string, storyId: string): boolean {
    const session = sessions.get(sessionId);
    if (!session) return false;

    const story = session.stories.find((s) => s.id === storyId);
    if (!story) return false;

    // Reset any previously voting story
    session.stories.forEach((s) => {
      if (s.status === 'voting') {
        s.status = 'pending';
        s.votes = [];
      }
    });

    story.status = 'voting';
    story.votes = [];
    session.activeStoryId = storyId;
    session.status = 'active';

    // Set timer if configured
    if (session.timerDuration) {
      session.timerEndTime = new Date(
        Date.now() + session.timerDuration * 1000
      ).toISOString();
    }

    console.log(`[SessionStore] Started voting on "${story.title}" in session ${session.code}`);
    return true;
  },

  // Submit a vote
  submitVote(
    sessionId: string,
    storyId: string,
    participantId: string,
    value: string
  ): boolean {
    const session = sessions.get(sessionId);
    if (!session) return false;

    const story = session.stories.find((s) => s.id === storyId);
    if (!story || story.status !== 'voting') return false;

    // Remove existing vote from this participant
    story.votes = story.votes.filter((v) => v.participantId !== participantId);

    // Add new vote
    const vote: Vote = {
      participantId,
      value,
      timestamp: new Date().toISOString(),
    };
    story.votes.push(vote);

    const participant = session.participants.find((p) => p.id === participantId);
    console.log(`[SessionStore] ${participant?.name} voted on "${story.title}"`);
    return true;
  },

  // Reveal votes for a story
  revealVotes(sessionId: string, storyId: string): Vote[] | null {
    const session = sessions.get(sessionId);
    if (!session) return null;

    const story = session.stories.find((s) => s.id === storyId);
    if (!story) return null;

    story.status = 'revealed';
    session.timerEndTime = null;

    console.log(`[SessionStore] Revealed votes for "${story.title}" in session ${session.code}`);
    return story.votes;
  },

  // Set final points for a story
  setFinalPoints(sessionId: string, storyId: string, points: string): boolean {
    const session = sessions.get(sessionId);
    if (!session) return false;

    const story = session.stories.find((s) => s.id === storyId);
    if (!story) return false;

    story.finalPoints = points;
    story.status = 'final';
    session.activeStoryId = null;

    console.log(`[SessionStore] Set final points for "${story.title}": ${points}`);
    return true;
  },

  // Set timer duration
  setTimer(sessionId: string, duration: number | null): boolean {
    const session = sessions.get(sessionId);
    if (!session) return false;

    session.timerDuration = duration;
    
    // If currently voting, update the timer end time
    if (session.activeStoryId && duration) {
      session.timerEndTime = new Date(Date.now() + duration * 1000).toISOString();
    } else if (!duration) {
      session.timerEndTime = null;
    }

    return true;
  },

  // End session and generate summary
  endSession(sessionId: string): SessionSummary | null {
    const session = sessions.get(sessionId);
    if (!session) return null;

    session.status = 'completed';

    const summary: SessionSummary = {
      sessionName: session.name,
      sessionCode: session.code,
      completedAt: new Date().toISOString(),
      participants: session.participants.map((p) => p.name),
      stories: session.stories.map((story) => ({
        title: story.title,
        finalPoints: story.finalPoints,
        votes: story.votes.map((v) => ({
          participant: session.participants.find((p) => p.id === v.participantId)?.name || 'Unknown',
          value: v.value,
        })),
      })),
      totalPoints: session.stories.reduce((sum, s) => {
        const points = parseFloat(s.finalPoints || '0');
        return sum + (isNaN(points) ? 0 : points);
      }, 0),
    };

    console.log(`[SessionStore] Ended session ${session.code}`);
    return summary;
  },

  // Activate session (move from lobby to active)
  activateSession(sessionId: string): boolean {
    const session = sessions.get(sessionId);
    if (!session || session.status !== 'lobby') return false;

    session.status = 'active';
    return true;
  },
};
