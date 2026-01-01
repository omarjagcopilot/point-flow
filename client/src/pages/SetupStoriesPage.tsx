import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { useSessionStore } from '../stores/sessionStore';
import { Logo } from '../components/Logo';
import { CopyButton } from '../components/CopyButton';

export function SetupStoriesPage() {
  const navigate = useNavigate();
  const { addStory, removeStory } = useSocket();
  const { session } = useSessionStore();

  const [newStoryTitle, setNewStoryTitle] = useState('');

  if (!session) {
    navigate('/');
    return null;
  }

  const handleAddStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoryTitle.trim()) return;

    addStory(newStoryTitle.trim());
    setNewStoryTitle('');
  };

  const handleRemoveStory = (storyId: string) => {
    removeStory(storyId);
  };

  const handleStartSession = () => {
    navigate(`/session/${session.code}`);
  };

  const inviteLink = `${window.location.origin}/join/${session.code}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="card">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Logo size="sm" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">{session.name}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="font-mono font-bold">{session.code}</span>
                  <CopyButton text={session.code} label="code" />
                </div>
              </div>
            </div>
          </div>

          {/* Add Stories Form */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Add Stories to Point</h2>
            <form onSubmit={handleAddStory} className="flex gap-2">
              <input
                type="text"
                value={newStoryTitle}
                onChange={(e) => setNewStoryTitle(e.target.value)}
                placeholder="Enter story title..."
                className="input flex-1"
              />
              <button
                type="submit"
                disabled={!newStoryTitle.trim()}
                className="btn-primary"
              >
                Add
              </button>
            </form>
          </div>

          {/* Stories List */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Stories ({session.stories.length})
            </h3>
            {session.stories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📝</div>
                <p>No stories yet. Add some stories above!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {session.stories.map((story, index) => (
                  <div key={story.id} className="story-item">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 text-sm">≡</span>
                      <span className="font-medium">
                        {index + 1}. {story.title}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveStory(story.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invite Link */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-2">Share invite link</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="input flex-1 text-sm bg-white"
              />
              <CopyButton text={inviteLink} label="link" variant="button" />
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStartSession}
            className="w-full btn-primary py-3 text-lg"
          >
            Start Session & Invite Team →
          </button>
        </div>
      </div>
    </div>
  );
}
