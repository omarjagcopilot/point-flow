import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { useSessionStore } from '../stores/sessionStore';
import { Logo } from '../components/Logo';
import { CopyButton } from '../components/CopyButton';
import { VotingCards } from '../components/VotingCards';
import { ParticipantsList } from '../components/ParticipantsList';
import { StoriesList } from '../components/StoriesList';
import { VotingTimer } from '../components/VotingTimer';
import { TimerSettings } from '../components/TimerSettings';
import { POINT_SCALES } from '@shared/types';

export function SessionRoomPage() {
  const navigate = useNavigate();
  const { code } = useParams<{ code: string }>();
  const { 
    startVoting, 
    submitVote, 
    revealVotes, 
    setFinalPoints, 
    addStory,
    setTimer,
    endSession 
  } = useSocket();
  
  const { 
    session, 
    participantId, 
    summary,
    getCurrentStory, 
    isScrumMaster, 
    getMyVote,
    hasEveryoneVoted 
  } = useSessionStore();

  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [showAddStory, setShowAddStory] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState('');

  const currentStory = getCurrentStory();
  const isScrum = isScrumMaster();
  const myVote = getMyVote();
  const allVoted = hasEveryoneVoted();

  // Navigate to summary when session ends
  useEffect(() => {
    if (summary) {
      navigate('/summary');
    }
  }, [summary, navigate]);

  // Check if session is fully loaded (not just partial from persistence)
  const isSessionValid = session && session.participants && session.stories;

  // Redirect if no valid session after a short delay (to allow reconnection)
  useEffect(() => {
    if (!isSessionValid) {
      const timer = setTimeout(() => {
        if (!useSessionStore.getState().session?.participants) {
          navigate(`/join/${code}`);
        }
      }, 2000); // Give 2 seconds for socket to reconnect
      return () => clearTimeout(timer);
    }
  }, [isSessionValid, code, navigate]);

  if (!isSessionValid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to session...</p>
        </div>
      </div>
    );
  }

  const handleVote = (value: string) => {
    if (!currentStory || currentStory.status !== 'voting') return;
    
    setSelectedVote(value);
    submitVote(currentStory.id, value);
  };

  const handleReveal = () => {
    if (!currentStory) return;
    revealVotes(currentStory.id);
  };

  const handleSetFinalPoints = (points: string) => {
    if (!currentStory) return;
    setFinalPoints(currentStory.id, points);
    setSelectedVote(null);
  };

  const handleStartVoting = (storyId: string) => {
    setSelectedVote(null);
    startVoting(storyId);
  };

  const handleAddStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoryTitle.trim()) return;
    addStory(newStoryTitle.trim());
    setNewStoryTitle('');
    setShowAddStory(false);
  };

  const handleEndSession = () => {
    if (confirm('Are you sure you want to end this session? This will show the summary to all participants.')) {
      endSession();
    }
  };

  const pointScale = POINT_SCALES[session.pointScale];
  const inviteLink = `${window.location.origin}/join/${session.code}`;

  // Calculate vote statistics for revealed votes
  const getVoteStats = () => {
    if (!currentStory || currentStory.status !== 'revealed') return null;
    
    const numericVotes = currentStory.votes
      .map(v => parseFloat(v.value))
      .filter(v => !isNaN(v));

    if (numericVotes.length === 0) return null;

    const average = numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length;
    
    // Find mode (most common vote)
    const voteCounts = currentStory.votes.reduce((acc, v) => {
      acc[v.value] = (acc[v.value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const maxCount = Math.max(...Object.values(voteCounts));
    const mode = Object.entries(voteCounts).find(([_, count]) => count === maxCount)?.[0];

    return { average: average.toFixed(1), mode };
  };

  const voteStats = getVoteStats();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div>
              <h1 className="font-semibold text-gray-900">{session.name}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="font-mono font-bold">{session.code}</span>
                <CopyButton text={inviteLink} label="invite link" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isScrum && (
              <TimerSettings
                currentDuration={session.timerDuration}
                onSetTimer={(duration) => setTimer(duration)}
              />
            )}
            {isScrum && (
              <button
                onClick={handleEndSession}
                className="btn-secondary text-sm"
              >
                End Session
              </button>
            )}
            <div className="text-sm text-gray-500">
              Joined as: <span className="font-medium text-gray-900">
                {session.participants.find(p => p.id === participantId)?.name}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Current Story & Voting */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Story Card */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Current Story</h2>
              {session.timerEndTime && currentStory?.status === 'voting' && (
                <VotingTimer endTime={session.timerEndTime} />
              )}
            </div>

            {currentStory ? (
              <div>
                <div className="p-4 bg-gray-50 rounded-lg mb-4">
                  <h3 className="text-xl font-medium text-gray-900">{currentStory.title}</h3>
                  {currentStory.description && (
                    <p className="text-gray-600 mt-1">{currentStory.description}</p>
                  )}
                  <div className="mt-2">
                    {currentStory.status === 'voting' && (
                      <span className="status-voting">Voting in progress</span>
                    )}
                    {currentStory.status === 'revealed' && (
                      <span className="status-revealed">Votes revealed</span>
                    )}
                  </div>
                </div>

                {/* Participants' Vote Status */}
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">
                    Votes ({currentStory.votes.length}/{session.participants.filter(p => p.isConnected).length} voted)
                  </div>
                  <ParticipantsList
                    participants={session.participants}
                    votes={currentStory.votes}
                    isRevealed={currentStory.status === 'revealed'}
                    currentUserId={participantId || ''}
                  />
                </div>

                {/* Vote Statistics (after reveal) */}
                {currentStory.status === 'revealed' && voteStats && (
                  <div className="p-3 bg-blue-50 rounded-lg mb-4 flex items-center justify-center gap-6 text-sm">
                    <div>
                      <span className="text-blue-600 font-medium">Average:</span>{' '}
                      <span className="font-bold">{voteStats.average}</span>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Most common:</span>{' '}
                      <span className="font-bold">{voteStats.mode}</span>
                    </div>
                  </div>
                )}

                {/* Scrum Master Controls */}
                {isScrum && currentStory.status === 'voting' && (
                  <button
                    onClick={handleReveal}
                    className="w-full btn-accent py-3"
                  >
                    {allVoted ? 'Reveal Votes' : `Reveal Votes (${currentStory.votes.length}/${session.participants.filter(p => p.isConnected).length})`}
                  </button>
                )}

                {/* Final Points Selection (Scrum Master only, after reveal) */}
                {isScrum && currentStory.status === 'revealed' && (
                  <div className="mt-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Set Final Points:</div>
                    <div className="flex flex-wrap gap-2">
                      {pointScale.filter(v => v !== '?' && v !== '☕').map((value) => (
                        <button
                          key={value}
                          onClick={() => handleSetFinalPoints(value)}
                          className="px-4 py-2 rounded-lg border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 font-medium transition-all"
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-3">🎯</div>
                <p className="font-medium">No story selected</p>
                <p className="text-sm mt-1">
                  {isScrum 
                    ? 'Select a story from the list to start voting' 
                    : 'Waiting for Scrum Master to select a story'}
                </p>
              </div>
            )}
          </div>

          {/* Voting Cards (for developers during voting) */}
          {currentStory?.status === 'voting' && (
            <VotingCards
              pointScale={pointScale}
              selectedValue={selectedVote || myVote?.value || null}
              onSelect={handleVote}
            />
          )}
        </div>

        {/* Right Column - Stories List */}
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Stories</h2>
              {isScrum && (
                <button
                  onClick={() => setShowAddStory(!showAddStory)}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  + Add Story
                </button>
              )}
            </div>

            {/* Add Story Form */}
            {showAddStory && isScrum && (
              <form onSubmit={handleAddStory} className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={newStoryTitle}
                  onChange={(e) => setNewStoryTitle(e.target.value)}
                  placeholder="Story title..."
                  className="input flex-1 text-sm"
                  autoFocus
                />
                <button type="submit" className="btn-primary text-sm">Add</button>
              </form>
            )}

            <StoriesList
              stories={session.stories}
              activeStoryId={session.activeStoryId}
              isScrumMaster={isScrum}
              onStartVoting={handleStartVoting}
            />
          </div>

          {/* Online Participants */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Participants ({session.participants.filter(p => p.isConnected).length})
            </h2>
            <div className="space-y-2">
              {session.participants.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-2 text-sm ${
                    p.isConnected ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    p.isConnected ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <span>{p.name}</span>
                  {p.role === 'scrum_master' && (
                    <span className="text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded">SM</span>
                  )}
                  {p.id === participantId && (
                    <span className="text-xs text-gray-400">(you)</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
