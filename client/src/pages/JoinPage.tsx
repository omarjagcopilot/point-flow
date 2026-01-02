import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { useSessionStore } from '../stores/sessionStore';
import { Logo } from '../components/Logo';

export function JoinPage() {
  const navigate = useNavigate();
  const { code: urlCode } = useParams<{ code: string }>();
  const { joinSession } = useSocket();
  const { session, error, setError } = useSessionStore();

  const [sessionCode, setSessionCode] = useState(urlCode?.toUpperCase() || '');
  const [participantName, setParticipantName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [autoJoinAttempted, setAutoJoinAttempted] = useState(false);
  const [targetSessionCode, setTargetSessionCode] = useState<string | null>(null);

  // Clear old session data when component mounts with a URL code
  useEffect(() => {
    if (urlCode) {
      const currentSession = useSessionStore.getState().session;
      // Only clear if we're trying to join a different session
      if (currentSession && currentSession.code !== urlCode.toUpperCase()) {
        console.log('[JoinPage] Clearing old session data before joining new session');
        useSessionStore.getState().reset();
      }
    }
  }, [urlCode]);

  // Auto-join if we have both URL code and saved name
  useEffect(() => {
    if (urlCode && !autoJoinAttempted) {
      const savedName = localStorage.getItem('pointflow_participant_name');
      if (savedName) {
        setParticipantName(savedName);
        setAutoJoinAttempted(true);
        setIsJoining(true);
        setTargetSessionCode(urlCode.toUpperCase());
        joinSession(urlCode.toUpperCase(), savedName);
      } else {
        setAutoJoinAttempted(true);
      }
    }
  }, [urlCode, autoJoinAttempted, joinSession]);

  // Navigate when joined successfully - but only for the session we're trying to join
  useEffect(() => {
    if (session && isJoining && (!targetSessionCode || session.code === targetSessionCode)) {
      navigate(`/session/${session.code}`);
    }
  }, [session, isJoining, targetSessionCode, navigate]);

  // Reset joining state on error
  useEffect(() => {
    if (error && isJoining) {
      setIsJoining(false);
      setTargetSessionCode(null);
    }
  }, [error, isJoining]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionCode.trim() || !participantName.trim()) return;

    // Save name for future auto-join
    localStorage.setItem('pointflow_participant_name', participantName.trim());

    setError(null);
    setIsJoining(true);
    setTargetSessionCode(sessionCode.trim().toUpperCase());
    joinSession(
      sessionCode.trim().toUpperCase(),
      participantName.trim()
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          <span>Back</span>
        </button>

        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <Logo size="sm" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Join Session</h1>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleJoin} className="space-y-4">
            {/* Session Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Session Code
              </label>
              <input
                type="text"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                placeholder="e.g., ABC123"
                className="input uppercase tracking-widest text-center font-mono text-lg"
                maxLength={6}
                required
              />
            </div>

            {/* Participant Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="e.g., Mike"
                className="input"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!sessionCode.trim() || !participantName.trim() || isJoining}
              className="w-full btn-primary py-3 text-lg"
            >
              {isJoining ? 'Joining...' : 'Join Session'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
