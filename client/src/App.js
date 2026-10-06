import React, { useContext } from 'react';
import './App.css';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import DocumentsPage from './pages/DocumentsPage';
import ChatWidget from './components/ChatWidget';
import LoginPage from './pages/LoginPage';

function AppContent() {
  const [currentPage, setCurrentPage] = React.useState('home');
  const [documents, setDocuments] = React.useState([]);
  const [showChatWidget, setShowChatWidget] = React.useState(false);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  const { user, token, loading, logout } = useContext(AuthContext);

  React.useEffect(() => {
    if (token) {
      fetchDocuments();
    }
  }, [refreshTrigger, token]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/documents', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  const handleDocumentUploaded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user || !token) {
    return <LoginPage />;
  }

  return (
    <div className="App">
      <Navbar 
        currentPage={currentPage} 
        onNavigate={handleNavigate}
        onOpenChat={() => setShowChatWidget(true)}
        user={user}
        onLogout={logout}
      />
      
      <div className="app-content">
        {currentPage === 'home' && (
          <HomePage 
            documents={documents}
            onUploadClick={() => handleNavigate('documents')}
          />
        )}
        
        {currentPage === 'documents' && (
          <DocumentsPage 
            documents={documents}
            onDocumentUploaded={handleDocumentUploaded}
            onRefresh={() => setRefreshTrigger(prev => prev + 1)}
            token={token}
          />
        )}
      </div>

      {showChatWidget && (
        <ChatWidget 
          onClose={() => setShowChatWidget(false)}
          documents={documents}
          token={token}
        />
      )}

      {!showChatWidget && (
        <button 
          className="chat-toggle-btn"
          onClick={() => setShowChatWidget(true)}
          title="Open Chat"
        >
          💬
        </button>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;