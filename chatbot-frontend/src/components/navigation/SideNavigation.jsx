import React, { useState, useEffect } from 'react';
import { getAllChatSession, deleteSessionById } from '../../clients/ChatbotService';

const SideNavigation = ({ onSessionSelect, startNewChat, refreshSessions, className }) => {
  const [sessions, setSessions] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  const fetchSessions = async () => {
    try {
      const data = await getAllChatSession();
      setSessions(data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [refreshSessions]);

  const handleRightClick = (e, sessionId) => {
    e.preventDefault();
    setContextMenu({ x: e.pageX, y: e.pageY, sessionId });
  };

  const handleDelete = async () => {
    if (contextMenu) {
      try {
        await deleteSessionById(contextMenu.sessionId);
        setSessions(sessions.filter(session => session.id !== contextMenu.sessionId));
        setContextMenu(null);
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    const today = new Date();
    const date = new Date(dateString);
    const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const time = `${hours}:${minutes}`;

    if (diffDays === 0) return `Today - ${time}`;
    if (diffDays === 1) return `Yesterday - ${time}`;
    return `${diffDays} days ago - ${time}`;
  };

  const filteredSessions = sessions.filter(session =>
    session.topic.toLowerCase().includes(search.toLowerCase())
  );

  const handleSessionClick = (id) => {
    setSelectedSessionId(id);
    onSessionSelect(id);
  };

  return (
    <div
    className={`text-light d-flex flex-column ${className}`}
    style={{
        minWidth: '250px',
        maxWidth: '250px',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgba(59, 43, 95, 0.6), rgba(30, 30, 47, 0.8))', 
        backdropFilter: 'blur(10px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '16px 16px 0 16px',
        position: 'relative',
        fontFamily: '"Inter", sans-serif',
        fontWeight: 400,
    }}
    >
      <div className="d-flex flex-column" style={{ height: '100vh' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button className="btn btn-outline-light border-0">
            <i className="bi bi-list"></i>
          </button>
          <button className="btn btn-outline-light border-0" onClick={startNewChat}>
            <i className="bi bi-plus-lg"></i>
          </button>
        </div>

        <div className="position-relative mb-3">

    <input
        type="text"
        className="form-control text-light border-0 ps-5"
        placeholder=""
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
        background: 'linear-gradient(135deg, rgba(59, 43, 95, 0.4), rgba(30, 30, 47, 0.6))',
        backdropFilter: 'blur(10px)',
        color: '#fff',
        opacity: 0.7,
        fontFamily: '"Inter", sans-serif',
        fontWeight: 400,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        }}
    />
    <i
        className="bi bi-search position-absolute text-light"
        style={{
        left: '15px',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '14px',
        opacity: 0.7,
        }}
    ></i>
    </div>

        <div
          className="overflow-auto mb-3"
          style={{
            flex: '1 1 auto',
            maxHeight: 'calc(100vh - 220px)',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {filteredSessions.reverse().map(session => (
            <div
              key={session.id}
              className="p-2 rounded mb-2"
              style={{
                background: selectedSessionId === session.id
                  ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(200, 200, 200, 0.2))'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(200, 200, 200, 0.1))',
                opacity: 0.9,
                cursor: 'pointer',
                transition: 'background 0.3s ease, transform 0.2s ease',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
              onClick={() => handleSessionClick(session.id)}
              onContextMenu={(e) => handleRightClick(e, session.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(200, 200, 200, 0.15))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = selectedSessionId === session.id
                  ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(200, 200, 200, 0.2))'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(200, 200, 200, 0.1))';
              }}
            >
              <strong style={{ color: '#fff' }}>{session.topic}</strong><br />
              <small style={{ color: '#ddd' }}>{formatDate(session.created_at)}</small>
            </div>
          ))}
        </div>

        <div className="d-flex align-items-center pt-2 " style={{ gap: '8px', marginTop: '15px' }}>
          <img src="https://i.pravatar.cc/40?img=2" alt="user" className="rounded-circle" />
          <span style={{ color: '#fff' }}>Richard Angelico</span>
        </div>
      </div>

      {contextMenu && (
        <div
          className="position-absolute bg-light text-dark p-2 rounded shadow"
          style={{ top: contextMenu.y, left: contextMenu.x, zIndex: 1000 }}
        >
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
        </div>
      )}

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400&display=swap');
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default SideNavigation;