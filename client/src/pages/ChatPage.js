import React from 'react';
import ChatInterface from '../components/ChatInterface';

function ChatPage({ document, onBack }) {
  return (
    <div className="chat-page">
      <button className="btn btn-secondary" onClick={onBack}>
        ← Back to Documents
      </button>
      <ChatInterface document={document} />
    </div>
  );
}

export default ChatPage;