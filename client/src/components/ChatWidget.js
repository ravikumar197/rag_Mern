import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

function ChatWidget({ onClose, documents }) {
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [currentSession, setCurrentSession] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const messagesEndRef = useRef(null);
    const widgetRef = useRef(null);

    // Load sessions from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('chatSessions');
        if (saved) {
            setSessions(JSON.parse(saved));
        } else {
            createNewSession();
        }
    }, []);

    // Save sessions to localStorage
    useEffect(() => {
        localStorage.setItem('chatSessions', JSON.stringify(sessions));
    }, [sessions]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const createNewSession = () => {
        const newSession = {
            id: Date.now(),
            name: `Chat ${new Date().toLocaleTimeString()}`,
            messages: [],
        };
        setSessions([...sessions, newSession]);
        setCurrentSession(newSession);
        setMessages([]);
    };

    const switchSession = (session) => {
        setCurrentSession(session);
        setMessages(session.messages);
    };

    const deleteSession = (sessionId) => {
        setSessions(sessions.filter(s => s.id !== sessionId));
        if (currentSession?.id === sessionId) {
            const remaining = sessions.filter(s => s.id !== sessionId);
            if (remaining.length > 0) {
                switchSession(remaining[0]);
            } else {
                createNewSession();
            }
        }
    };

    const handleAsk = async (e) => {
        e.preventDefault();
        if (!query.trim() || documents.length === 0) return;

        const userMessage = { type: 'user', content: query };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setQuery('');
        setLoading(true);

        try {
            const response = await axios.post(
                'http://localhost:5000/api/documents/search',
                { query },
                {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }
            );

            const aiMessage = {
                type: 'ai',
                content: response.data.answer,
                sources: response.data.sources,
            };

            const finalMessages = [...updatedMessages, aiMessage];
            setMessages(finalMessages);

            // Update session
            if (currentSession) {
                setSessions(
                    sessions.map(s =>
                        s.id === currentSession.id
                            ? { ...s, messages: finalMessages }
                            : s
                    )
                );
            }
        } catch (error) {
            const errorMessage = {
                type: 'error',
                content: error.response?.data?.error || 'Error getting response',
            };
            const finalMessages = [...updatedMessages, errorMessage];
            setMessages(finalMessages);
        } finally {
            setLoading(false);
        }
    };

    const handleMouseDown = (e) => {
        setIsDragging(true);
        const widget = widgetRef.current;
        setOffset({
            x: e.clientX - widget.offsetLeft,
            y: e.clientY - widget.offsetTop,
        });
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            setPosition({
                x: e.clientX - offset.x,
                y: e.clientY - offset.y,
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, offset]);

    return (
        <div
            ref={widgetRef}
            className="chat-widget"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
            }}
        >
            <div className="chat-widget-header" onMouseDown={handleMouseDown}>
                <h3>💬 Multi-Doc Chat</h3>
                <button className="close-btn" onClick={onClose}>✕</button>
            </div>

            <div className="chat-widget-tabs">
                {sessions.map(session => (
                    <div
                        key={session.id}
                        className={`tab ${currentSession?.id === session.id ? 'active' : ''}`}
                    >
                        <button onClick={() => switchSession(session)} title={session.name}>
                            {session.name.substring(0, 15)}...
                        </button>
                        <button
                            className="delete-tab"
                            onClick={() => deleteSession(session.id)}
                        >
                            ✕
                        </button>
                    </div>
                ))}
                <button className="new-session-btn" onClick={createNewSession}>
                    + New
                </button>
            </div>

            <div className="chat-widget-messages">
                {documents.length === 0 ? (
                    <div className="empty-chat">
                        <p>📄 Upload documents first to start chatting</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="welcome-chat">
                        <p>👋 Welcome! Ask me anything about your documents</p>
                        <small>Searching across {documents.length} document(s)</small>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div key={idx} className={`msg ${msg.type}`}>
                            <div className="msg-content">
                                <ReactMarkdown>
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                            {msg.sources && (
                                <div className="msg-sources">
                                    <small>📚 {msg.sources.length} source(s)</small>
                                </div>
                            )}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleAsk} className="chat-widget-input">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask about your documents..."
                    disabled={loading || documents.length === 0}
                />
                <button type="submit" disabled={loading || documents.length === 0}>
                    {loading ? '⏳' : '→'}
                </button>
            </form>
        </div>
    );
}

export default ChatWidget;