import React from 'react';
import { Outlet } from "react-router-dom";
import SideNavigation from "../components/navigation/SideNavigation";

const MainLayout = ({ onSessionSelect, startNewChat, refreshSessions }) => {
  return (
    <div className="d-flex" style={{ maxHeight: '100vh' }}>
      <SideNavigation
        onSessionSelect={onSessionSelect}
        startNewChat={startNewChat}
        refreshSessions={refreshSessions}
        className="sidebar"
      />
      <main
        className="flex-grow-1 d-flex flex-column"
        style={{
          background: 'radial-gradient(circle at center, #3b2b5f, #1e1e2f)',
          color: 'white',
          position: 'relative'
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;