import React from 'react';

function Navbar({ currentPage, onNavigate, onOpenChat, user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <h1>🤖 AI Knowledge Base</h1>
        </div>
        
        <ul className="nav-menu">
          <li>
            <button
              className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => onNavigate('home')}
            >
              📊 Home
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentPage === 'documents' ? 'active' : ''}`}
              onClick={() => onNavigate('documents')}
            >
              📄 Documents
            </button>
          </li>
          <li>
            <button
              className="nav-link chat-btn"
              onClick={onOpenChat}
            >
              💬 Chat
            </button>
          </li>
          <li>
            <button className="user-name">
            <span className="user-info">👤 {user?.name}</span>
            </button>
          </li>
          <li>
            <button
              className="nav-link logout-btn"
              onClick={onLogout}
            >
              🚪 Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;