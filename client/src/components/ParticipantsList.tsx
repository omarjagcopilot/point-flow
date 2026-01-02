import type { Participant, Vote } from '@shared/types';

interface ParticipantsListProps {
  participants: Participant[];
  votes: Vote[];
  isRevealed: boolean;
  currentUserId: string;
  isScrumMaster?: boolean;
  onRemoveParticipant?: (participantId: string) => void;
}

export function ParticipantsList({ 
  participants, 
  votes, 
  isRevealed, 
  currentUserId,
  isScrumMaster = false,
  onRemoveParticipant,
}: ParticipantsListProps) {
  const connectedParticipants = participants.filter(p => p.isConnected);

  return (
    <div className="flex flex-wrap gap-3">
      {connectedParticipants.map((participant) => {
        const vote = votes.find(v => v.participantId === participant.id);
        const hasVoted = !!vote;
        const canRemove = isScrumMaster && 
                          participant.id !== currentUserId && 
                          participant.role !== 'scrum_master';

        return (
          <div
            key={participant.id}
            className="participant-card min-w-[80px] relative group"
          >
            {/* Remove Button */}
            {canRemove && onRemoveParticipant && (
              <button
                onClick={() => onRemoveParticipant(participant.id)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full 
                           flex items-center justify-center text-xs font-bold opacity-0 
                           group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title={`Remove ${participant.name}`}
              >
                ×
              </button>
            )}

            {/* Vote Display */}
            <div className={`w-12 h-16 rounded-lg flex items-center justify-center text-lg font-bold mb-2 transition-all ${
              isRevealed && hasVoted
                ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 border-2 border-primary-300 dark:border-primary-700'
                : hasVoted
                ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-2 border-green-300 dark:border-green-700'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-2 border-gray-200 dark:border-gray-700'
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
            <div className="text-xs text-gray-600 dark:text-gray-400 text-center truncate max-w-[80px]">
              {participant.name}
              {participant.id === currentUserId && (
                <span className="text-gray-400 dark:text-gray-500"> (you)</span>
              )}
            </div>
            
            {/* Role Badge */}
            {participant.role === 'scrum_master' && (
              <div className="text-xs bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-300 px-1 rounded mt-1">
                SM
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
