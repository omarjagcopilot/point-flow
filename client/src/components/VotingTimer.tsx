import { useState, useEffect } from 'react';

interface VotingTimerProps {
  endTime: string;
}

export function VotingTimer({ endTime }: VotingTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const end = new Date(endTime).getTime();
      const now = Date.now();
      const diff = Math.max(0, Math.floor((end - now) / 1000));
      setTimeLeft(diff);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLow = timeLeft <= 10 && timeLeft > 0;
  const isExpired = timeLeft === 0;

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-mono font-medium ${
      isExpired
        ? 'bg-red-100 text-red-700'
        : isLow
        ? 'bg-amber-100 text-amber-700 animate-pulse'
        : 'bg-gray-100 text-gray-700'
    }`}>
      <span>⏱️</span>
      <span>
        {isExpired 
          ? "Time's up!" 
          : `${minutes}:${seconds.toString().padStart(2, '0')}`
        }
      </span>
    </div>
  );
}
