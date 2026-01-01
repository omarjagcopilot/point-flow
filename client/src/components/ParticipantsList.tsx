import type { Participant, Vote } from '@shared/types';

interface ParticipantsListProps {
  participants: Participant[];
  votes: Vote[];
  isRevealed: boolean;
  currentUserId: string;
}

export function ParticipantsList({ 
  participants, 
  votes, 
  isRevealed, 
  currentUserId 
}: ParticipantsListProps) {
  const connectedParticipants = participants.filter(p => p.isConnected);

  return (
    <div className="flex flex-wrap gap-3">
      {connectedParticipants.map((participant) => {
        const vote = votes.find(v => v.participantId === participant.id);
        const hasVoted = !!vote;

        return (
          <div
            key={participant.id}
            className="participant-card min-w-[80px]"
          >
            {/* Vote Display */}
            <div className={`w-12 h-16 rounded-lg flex items-center justify-center text-lg font-bold mb-2 transition-all ${
              isRevealed && hasVoted
                ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                : hasVoted
                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
            }`}>
              {isRevealed && hasVoted ? (
                <span className="animate-fade-in">{vote.value}</span>
              ) : hasVoted ? (
                <span>✓</span>
              ) : (
                <span className="animate-pulse-soft">...</span>
              )}
            </div>
            
            {/* Name */}
            <div className="text-xs text-gray-600 text-center truncate max-w-[80px]">
              {participant.name}
              {participant.id === currentUserId && (
                <span className="text-gray-400"> (you)</span>
              )}
            </div>
            
            {/* Role Badge */}
            {participant.role === 'scrum_master' && (
              <div className="text-xs bg-primary-100 text-primary-600 px-1 rounded mt-1">
                SM
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
