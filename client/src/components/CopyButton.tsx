import { useState } from 'react';

interface CopyButtonProps {
  text: string;
  label?: string;
  variant?: 'icon' | 'button';
}

export function CopyButton({ text, label = 'text', variant = 'icon' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (variant === 'button') {
    return (
      <button
        onClick={handleCopy}
        className="btn-secondary text-sm"
      >
        {copied ? '✓ Copied!' : `Copy ${label}`}
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      className="text-gray-400 hover:text-gray-600 transition-colors"
      title={`Copy ${label}`}
    >
      {copied ? '✓' : '📋'}
    </button>
  );
}
