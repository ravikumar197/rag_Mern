import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

function ChatInterface({ document }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = { type: 'user', content: query };
    setMessages([...messages, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/documents/search',
        { query }
      );

      const aiMessage = {
        type: 'ai',
        content: response.data.answer,
        sources: response.data.sources,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        type: 'error',
        content: error.response?.data?.error || 'Error getting response',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h2>💬 Ask about: {document.name}</h2>
        <p>{document.chunks} chunks from {document.pageCount} pages</p>
      </div>

      <div className="messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <p>Ask a question about the uploaded document</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.type}`}>
            <div className="message-content">{msg.content}</div>
            {msg.sources && (
              <div className="sources">
                <p>📚 Sources:</p>
                {msg.sources.map((source, i) => (
                  <div key={i} className="source-item">
                    <small>
                      {source.document} (Similarity: {source.similarity})
                    </small>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleAsk} className="chat-input-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? '⏳' : '✉️'}
        </button>
      </form>
    </div>
  );
}

export default ChatInterface;