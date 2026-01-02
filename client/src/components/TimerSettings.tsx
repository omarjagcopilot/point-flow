import { useState } from 'react';

interface TimerSettingsProps {
  currentDuration: number | null;
  onSetTimer: (duration: number | null) => void;
}

export function TimerSettings({ currentDuration, onSetTimer }: TimerSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const timerOptions = [
    { value: null, label: 'Off' },
    { value: 30, label: '30s' },
    { value: 60, label: '1m' },
    { value: 120, label: '2m' },
    { value: 180, label: '3m' },
    { value: 300, label: '5m' },
  ];

  const getCurrentLabel = () => {
    const option = timerOptions.find(o => o.value === currentDuration);
    return option?.label || 'Off';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
      >
        <span>⏱️</span>
        <span>Timer: {getCurrentLabel()}</span>
        <span className="text-xs">▼</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 py-1">
            {timerOptions.map((option) => (
              <button
                key={option.label}
                onClick={() => {
                  onSetTimer(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  currentDuration === option.value
                    ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 font-medium'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
