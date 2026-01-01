import { Session, Story, Participant, Vote, PointScale, SessionType, SessionSummary } from '../../../shared/types.js';
export declare const SessionStore: {
    createSession(sessionName: string, scrumMasterName: string, pointScale: PointScale, sessionType: SessionType): {
        session: Session;
        participantId: string;
    };
    getSessionByCode(code: string): Session | null;
    getSession(sessionId: string): Session | null;
    addParticipant(sessionId: string, name: string): {
        session: Session;
        participantId: string;
    } | null;
    setParticipantConnected(sessionId: string, participantId: string, isConnected: boolean): boolean;
    getParticipant(sessionId: string, participantId: string): Participant | null;
    addStory(sessionId: string, title: string, description?: string): Story | null;
    removeStory(sessionId: string, storyId: string): boolean;
    reorderStories(sessionId: string, storyIds: string[]): boolean;
    startVoting(sessionId: string, storyId: string): boolean;
    submitVote(sessionId: string, storyId: string, participantId: string, value: string): boolean;
    revealVotes(sessionId: string, storyId: string): Vote[] | null;
    setFinalPoints(sessionId: string, storyId: string, points: string): boolean;
    setTimer(sessionId: string, duration: number | null): boolean;
    endSession(sessionId: string): SessionSummary | null;
    activateSession(sessionId: string): boolean;
};
//# sourceMappingURL=sessionStore.d.ts.map