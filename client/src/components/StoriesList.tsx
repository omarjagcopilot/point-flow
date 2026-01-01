import type { Story } from '@shared/types';

interface StoriesListProps {
  stories: Story[];
  activeStoryId: string | null;
  isScrumMaster: boolean;
  onStartVoting: (storyId: string) => void;
}

export function StoriesList({ 
  stories, 
  activeStoryId, 
  isScrumMaster, 
  onStartVoting 
}: StoriesListProps) {
  if (stories.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-3xl mb-2">📝</div>
        <p className="text-sm">No stories yet</p>
      </div>
    );
  }

  const getStatusBadge = (story: Story) => {
    if (story.status === 'final' && story.finalPoints) {
      return (
        <span className="status-final">
          {story.finalPoints} pts
        </span>
      );
    }
    if (story.status === 'voting') {
      return <span className="status-voting">Voting</span>;
    }
    if (story.status === 'revealed') {
      return <span className="status-revealed">Revealed</span>;
    }
    return <span className="status-pending">Pending</span>;
  };

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {stories.map((story, index) => {
        const isActive = story.id === activeStoryId;
        const canStartVoting = isScrumMaster && story.status !== 'final' && !isActive;

        return (
          <div
            key={story.id}
            className={`p-3 rounded-lg border-2 transition-all ${
              isActive
                ? 'border-primary-500 bg-primary-50'
                : story.status === 'final'
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {story.status === 'final' ? (
                    <span className="text-green-500">✓</span>
                  ) : isActive ? (
                    <span className="text-primary-500">●</span>
                  ) : (
                    <span className="text-gray-400">○</span>
                  )}
                  <span className={`font-medium truncate ${
                    story.status === 'final' ? 'text-gray-600' : 'text-gray-900'
                  }`}>
                    {index + 1}. {story.title}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                {getStatusBadge(story)}
                
                {canStartVoting && (
                  <button
                    onClick={() => onStartVoting(story.id)}
                    className="text-xs bg-primary-600 text-white px-2 py-1 rounded hover:bg-primary-700 transition-colors"
                  >
                    Vote
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
