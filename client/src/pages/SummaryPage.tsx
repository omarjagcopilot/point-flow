import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../stores/sessionStore';
import { Logo } from '../components/Logo';

export function SummaryPage() {
  const navigate = useNavigate();
  const { summary, reset } = useSessionStore();

  if (!summary) {
    navigate('/');
    return null;
  }

  const handleDownloadCSV = () => {
    const headers = ['Story', 'Final Points', 'Votes'];
    const rows = summary.stories.map(story => [
      `"${story.title.replace(/"/g, '""')}"`,
      story.finalPoints || 'N/A',
      `"${story.votes.map(v => `${v.participant}: ${v.value}`).join(', ')}"`
    ]);

    const csvContent = [
      `Session: ${summary.sessionName}`,
      `Code: ${summary.sessionCode}`,
      `Completed: ${new Date(summary.completedAt).toLocaleString()}`,
      `Participants: ${summary.participants.join(', ')}`,
      `Total Points: ${summary.totalPoints}`,
      '',
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${summary.sessionCode}-summary.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = async () => {
    const text = [
      `📊 ${summary.sessionName} - Session Summary`,
      `Code: ${summary.sessionCode}`,
      `Completed: ${new Date(summary.completedAt).toLocaleString()}`,
      '',
      'Stories:',
      ...summary.stories.map((story, i) => 
        `${i + 1}. ${story.title} - ${story.finalPoints || 'N/A'} pts`
      ),
      '',
      `Total Points: ${summary.totalPoints}`,
      `Participants: ${summary.participants.join(', ')}`
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      alert('Summary copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleNewSession = () => {
    reset();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="card">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Session Complete!</h1>
            <p className="text-gray-600 dark:text-gray-400">{summary.sessionName}</p>
          </div>

          {/* Summary Table */}
          <div className="mb-6">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">#</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Story</th>
                  <th className="text-right py-2 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Points</th>
                </tr>
              </thead>
              <tbody>
                {summary.stories.map((story, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-3 text-gray-500 dark:text-gray-400">{index + 1}</td>
                    <td className="py-3 px-3 font-medium text-gray-900 dark:text-gray-100">{story.title}</td>
                    <td className="py-3 px-3 text-right">
                      {story.finalPoints ? (
                        <span className="inline-flex items-center justify-center w-10 h-8 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 font-bold rounded">
                          {story.finalPoints}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <td colSpan={2} className="py-3 px-3 font-semibold text-gray-700 dark:text-gray-300">Total</td>
                  <td className="py-3 px-3 text-right">
                    <span className="inline-flex items-center justify-center px-3 h-8 bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 font-bold rounded">
                      {summary.totalPoints} pts
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <span className="font-medium">Session Code:</span> {summary.sessionCode}
            </div>
            <div>
              <span className="font-medium">Participants:</span> {summary.participants.length}
            </div>
            <div>
              <span className="font-medium">Stories:</span> {summary.stories.length}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownloadCSV}
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
            >
              <span>📥</span> Download CSV
            </button>
            <button
              onClick={handleCopyToClipboard}
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
            >
              <span>📋</span> Copy to Clipboard
            </button>
            <button
              onClick={handleNewSession}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <span>🎯</span> New Session
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
            <Logo size="sm" />
            <span className="font-medium">Point Flow</span>
          </div>
        </div>
      </div>
    </div>
  );
}
