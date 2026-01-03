// ============================================
// POINT FLOW - Shared TypeScript Types
// ============================================
export const POINT_SCALES = {
    fibonacci: ['0', '1', '2', '3', '5', '8', '13', '21', '?', '☕'],
    tshirt: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?', '☕'],
    powers: ['0', '1', '2', '4', '8', '16', '32', '?', '☕'],
};
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
};
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
};
//# sourceMappingURL=types.js.map