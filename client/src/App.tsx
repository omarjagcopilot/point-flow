import { Routes, Route } from 'react-router-dom';
import { SocketProvider } from './contexts/SocketContext';
import { LandingPage } from './pages/LandingPage';
import { CreateSessionPage } from './pages/CreateSessionPage';
import { SetupStoriesPage } from './pages/SetupStoriesPage';
import { SessionRoomPage } from './pages/SessionRoomPage';
import { SummaryPage } from './pages/SummaryPage';
import { JoinPage } from './pages/JoinPage';
import { DarkModeToggle } from './components/DarkModeToggle';

function App() {
  return (
    <SocketProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
        <DarkModeToggle />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/create" element={<CreateSessionPage />} />
          <Route path="/setup" element={<SetupStoriesPage />} />
          <Route path="/session/:code" element={<SessionRoomPage />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/join/:code" element={<JoinPage />} />
          <Route path="/summary" element={<SummaryPage />} />
        </Routes>
      </div>
    </SocketProvider>
  );
}

export default App;
