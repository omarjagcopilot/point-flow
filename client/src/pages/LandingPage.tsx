import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { useSessionStore } from '../stores/sessionStore';

export function LandingPage() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [codeError, setCodeError] = useState('');

  const handleStartSession = () => {
    // Clear any previous errors/session data
    useSessionStore.getState().setError(null);
    navigate('/create');
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    
    if (!code) {
      setCodeError('Please enter a session code');
      return;
    }
    
    if (code.length !== 6) {
      setCodeError('Code must be 6 characters');
      return;
    }
    
    if (!/^[A-Z0-9]+$/.test(code)) {
      setCodeError('Code can only contain letters and numbers');
      return;
    }
    
    setCodeError('');
    useSessionStore.getState().setError(null);
    navigate(`/join/${code}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and tagline */}
        <div className="text-center">
          <Logo className="mx-auto mb-4" size="lg" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Point Flow</h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Quick Planning Poker for Agile Teams</p>
        </div>

        {/* Main actions */}
        <div className="space-y-4">
          {/* Start Session */}
          <button
            onClick={handleStartSession}
            className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-3 group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">🎯</span>
            <div className="text-left">
              <div className="font-semibold">Start New Session</div>
              <div className="text-sm text-primary-200">Create and lead a pointing session</div>
            </div>
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-500 dark:text-gray-400">or</span>
            </div>
          </div>

          {/* Join Session */}
          <div className="card">
            <form onSubmit={handleJoin} className="space-y-3">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🚀</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">Join Session</span>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => {
                      setJoinCode(e.target.value.toUpperCase());
                      setCodeError('');
                    }}
                    placeholder="Enter code (e.g., ABC123)"
                    className={`input flex-1 uppercase tracking-widest text-center font-mono ${
                      codeError ? 'border-red-400 focus:ring-red-500' : ''
                    }`}
                    maxLength={6}
                  />
                  <button
                    type="submit"
                    disabled={!joinCode.trim()}
                    className="btn-primary px-6"
                  >
                    Join
                  </button>
                </div>
                {codeError && (
                  <p className="text-sm text-red-600 dark:text-red-400">{codeError}</p>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 pt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <div>
            <div className="text-2xl mb-1">⚡</div>
            <div>Real-time voting</div>
          </div>
          <div>
            <div className="text-2xl mb-1">📱</div>
            <div>Works on any device</div>
          </div>
          <div>
            <div className="text-2xl mb-1">🔒</div>
            <div>No login required</div>
          </div>
        </div>
      </div>
    </div>
  );
}
