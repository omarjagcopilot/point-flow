// ============================================
// POINT FLOW - Shared TypeScript Types
// ============================================

// Point scale options
export type PointScale = 'fibonacci' | 'tshirt' | 'powers';

export const POINT_SCALES: Record<PointScale, string[]> = {
  fibonacci: ['0', '1', '2', '3', '5', '8', '13', '21', '?', '☕'],
  tshirt: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?', '☕'],
  powers: ['0', '1', '2', '4', '8', '16', '32', '?', '☕'],
};

// Session types
export type SessionType = 'planned' | 'quick';
export type SessionStatus = 'lobby' | 'active' | 'completed';
export type StoryStatus = 'pending' | 'voting' | 'revealed' | 'final';
export type ParticipantRole = 'scrum_master' | 'developer';

// Core data models
export interface Participant {
  id: string;
  name: string;
  role: ParticipantRole;
  isConnected: boolean;
  joinedAt: string;
}

export interface Vote {
  participantId: string;
  value: string;
  timestamp: string;
}

export interface Story {
  id: string;
  title: string;
  description?: string;
  status: StoryStatus;
  votes: Vote[];
  finalPoints: string | null;
  order: number;
}

export interface Session {
  id: string;
  code: string;
  name: string;
  scrumMasterId: string;
  type: SessionType;
  status: SessionStatus;
  pointScale: PointScale;
  stories: Story[];
  activeStoryId: string | null;
  participants: Participant[];
  timerDuration: number | null;
  timerEndTime: string | null;
  createdAt: string;
  expiresAt: string;
}

// ============================================
// Socket Event Payloads
// ============================================

// Client -> Server Events
export interface CreateSessionPayload {
  sessionName: string;
  scrumMasterName: string;
  pointScale: PointScale;
  sessionType: SessionType;
}

export interface JoinSessionPayload {
  sessionCode: string;
  participantName: string;
}

export interface AddStoryPayload {
  title: string;
  description?: string;
}

export interface StartVotingPayload {
  storyId: string;
}

export interface SubmitVotePayload {
  storyId: string;
  value: string;
}

export interface RevealVotesPayload {
  storyId: string;
}

export interface SetFinalPointsPayload {
  storyId: string;
  points: string;
}

export interface SetTimerPayload {
  duration: number | null; // seconds, null to disable
}

export interface RemoveStoryPayload {
  storyId: string;
}

export interface ReorderStoriesPayload {
  storyIds: string[];
}

export interface RemoveParticipantPayload {
  participantId: string;
}

export interface UpdateStoryPayload {
  storyId: string;
  title?: string;
  description?: string;
}

// Server -> Client Events
export interface SessionCreatedPayload {
  session: Session;
  participantId: string;
}

export interface SessionJoinedPayload {
  session: Session;
  participantId: string;
}

export interface ParticipantJoinedPayload {
  participant: Participant;
}

export interface ParticipantLeftPayload {
  participantId: string;
}

export interface ParticipantRemovedPayload {
  participantId: string;
  removedBy: string;
}

export interface StoryUpdatedPayload {
  story: Story;
}

export interface ParticipantReconnectedPayload {
  participantId: string;
}

export interface StoryAddedPayload {
  story: Story;
}

export interface StoryRemovedPayload {
  storyId: string;
}

export interface StoriesReorderedPayload {
  storyIds: string[];
}

export interface VotingStartedPayload {
  storyId: string;
  timerEndTime: string | null;
}

export interface VoteReceivedPayload {
  participantId: string;
  storyId: string;
}

export interface VotesRevealedPayload {
  storyId: string;
  votes: Vote[];
}

export interface StoryFinalizedPayload {
  storyId: string;
  points: string;
}

export interface TimerUpdatedPayload {
  timerDuration: number | null;
  timerEndTime: string | null;
}

export interface SessionEndedPayload {
  summary: SessionSummary;
}

export interface ErrorPayload {
  message: string;
  code?: string;
}

// Session Summary for export
export interface SessionSummary {
  sessionName: string;
  sessionCode: string;
  completedAt: string;
  participants: string[];
  stories: {
    title: string;
    finalPoints: string | null;
    votes: { participant: string; value: string }[];
  }[];
  totalPoints: number;
}

// ============================================
// Socket Event Names
// ============================================

export const CLIENT_EVENTS = {
  CREATE_SESSION: 'create_session',
  JOIN_SESSION: 'join_session',
  ADD_STORY: 'add_story',
  REMOVE_STORY: 'remove_story',
  UPDATE_STORY: 'update_story',
  REORDER_STORIES: 'reorder_stories',
  START_VOTING: 'start_voting',
  SUBMIT_VOTE: 'submit_vote',
  REVEAL_VOTES: 'reveal_votes',
  SET_FINAL_POINTS: 'set_final_points',
  SET_TIMER: 'set_timer',
  END_SESSION: 'end_session',
  RECONNECT: 'reconnect',
  REMOVE_PARTICIPANT: 'remove_participant',
} as const;

export const SERVER_EVENTS = {
  SESSION_CREATED: 'session_created',
  SESSION_JOINED: 'session_joined',
  PARTICIPANT_JOINED: 'participant_joined',
  PARTICIPANT_LEFT: 'participant_left',
  PARTICIPANT_RECONNECTED: 'participant_reconnected',
  PARTICIPANT_REMOVED: 'participant_removed',
  STORY_ADDED: 'story_added',
  STORY_REMOVED: 'story_removed',
  STORY_UPDATED: 'story_updated',
  STORIES_REORDERED: 'stories_reordered',
  VOTING_STARTED: 'voting_started',
  VOTE_RECEIVED: 'vote_received',
  VOTES_REVEALED: 'votes_revealed',
  STORY_FINALIZED: 'story_finalized',
  TIMER_UPDATED: 'timer_updated',
  SESSION_ENDED: 'session_ended',
  ERROR: 'error',
} as const;
