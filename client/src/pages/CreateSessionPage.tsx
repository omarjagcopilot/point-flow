import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { useSessionStore } from '../stores/sessionStore';
import { Logo } from '../components/Logo';
import type { PointScale, SessionType } from '@shared/types';

export function CreateSessionPage() {
  const navigate = useNavigate();
  const { createSession } = useSocket();
  const { session, error } = useSessionStore();

  const [sessionName, setSessionName] = useState('');
  const [scrumMasterName, setScrumMasterName] = useState('');
  const [pointScale, setPointScale] = useState<PointScale>('fibonacci');
  const [sessionType, setSessionType] = useState<SessionType | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Navigate when session is created
  useEffect(() => {
    if (session && isCreating) {
      setIsCreating(false);
      if (session.type === 'planned') {
        navigate(`/setup/${session.code}`);
      } else {
        navigate(`/session/${session.code}`);
      }
    }
  }, [session, isCreating, navigate]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionName.trim() || !scrumMasterName.trim() || !sessionType) return;

    // Clear any existing errors and reset store for new session
    useSessionStore.getState().setError(null);
    useSessionStore.getState().reset();
    setIsCreating(true);
    createSession(
      sessionName.trim(),
      scrumMasterName.trim(),
      pointScale,
      sessionType
    );
  };

  const pointScaleOptions = [
    { value: 'fibonacci', label: 'Fibonacci', values: '0, 1, 2, 3, 5, 8, 13, 21, ?, ☕' },
    { value: 'tshirt', label: 'T-Shirt', values: 'XS, S, M, L, XL, XXL, ?, ☕' },
    { value: 'powers', label: 'Powers of 2', values: '0, 1, 2, 4, 8, 16, 32, ?, ☕' },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create New Session</h1>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-6">
            {/* Session Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Session Name
              </label>
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="e.g., Sprint 42 Planning"
                className="input"
                required
              />
            </div>

            {/* Scrum Master Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={scrumMasterName}
                onChange={(e) => setScrumMasterName(e.target.value)}
                placeholder="e.g., Sarah (SM)"
                className="input"
                required
              />
            </div>

            {/* Point Scale */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Point Scale
              </label>
              <div className="space-y-2">
                {pointScaleOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      pointScale === option.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="pointScale"
                      value={option.value}
                      checked={pointScale === option.value}
                      onChange={(e) => setPointScale(e.target.value as PointScale)}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{option.label}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">{option.values}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Session Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Session Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSessionType('planned')}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    sessionType === 'planned'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="text-2xl mb-2">📋</div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">Planned</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Add stories before inviting team</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSessionType('quick')}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    sessionType === 'quick'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">Quick</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Start now, add stories on the fly</div>
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!sessionName.trim() || !scrumMasterName.trim() || !sessionType || isCreating}
              className="w-full btn-primary py-3 text-lg"
            >
              {isCreating ? 'Creating...' : 'Create Session'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
