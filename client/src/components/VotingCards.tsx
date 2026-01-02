interface VotingCardsProps {
  pointScale: string[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
}

export function VotingCards({ pointScale, selectedValue, onSelect }: VotingCardsProps) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Your Vote</h3>
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {pointScale.map((value) => (
          <button
            key={value}
            onClick={() => onSelect(value)}
            className={selectedValue === value ? 'vote-card-selected' : 'vote-card-unselected'}
          >
            {value}
          </button>
        ))}
      </div>
      {selectedValue && (
        <div className="text-center mt-4 text-sm text-green-600 dark:text-green-400 font-medium">
          ✓ You voted: {selectedValue}
        </div>
      )}
    </div>
  );
}
