import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import MainLayout from './layouts/MainLayout';
import ChatbotPage from './pages/chatbotPages';

function App() {
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSessionSelect = (id) => {
    setSelectedSessionId(id);
  };

  const startNewChat = () => {
    setSelectedSessionId(null);
  };

  const refreshSessions = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout
              onSessionSelect={handleSessionSelect}
              startNewChat={startNewChat}
              refreshSessions={refreshSessions}
            />
          }
        >
          <Route
            path="/"
            element={<ChatbotPage selectedSessionId={selectedSessionId} refreshSessions={refreshSessions} />}
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;