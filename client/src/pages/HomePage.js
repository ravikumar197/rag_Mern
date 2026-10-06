import React from 'react';

function HomePage({ documents, onUploadClick }) {
  const totalDocuments = documents.length;
  const totalChunks = documents.reduce((sum, doc) => sum + (doc.chunkCount || 0), 0);
  const totalPages = documents.reduce((sum, doc) => sum + (doc.pageCount || 0), 0);

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Welcome to AI Knowledge Base</h1>
        <p>Upload documents and get instant answers powered by RAG</p>
        <button className="btn btn-primary btn-large" onClick={onUploadClick}>
          + Add New Document
        </button>
      </div>

      <div className="analytics-section">
        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="card-icon">📄</div>
            <div className="card-content">
              <h3>{totalDocuments}</h3>
              <p>Total Documents</p>
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-icon">📑</div>
            <div className="card-content">
              <h3>{totalPages}</h3>
              <p>Total Pages</p>
            </div>
          </div>

          <div className="analytics-card">
            <div className="card-icon">🔗</div>
            <div className="card-content">
              <h3>{totalChunks}</h3>
              <p>Total Chunks</p>
            </div>
          </div>
        </div>
      </div>

      <div className="recent-documents">
        <h2>Recent Documents</h2>
        {documents.length === 0 ? (
          <p className="empty-message">No documents yet. Start by uploading one!</p>
        ) : (
          <div className="documents-preview">
            {documents.slice(0, 3).map((doc) => (
              <div key={doc._id} className="document-preview-card">
                <h4>{doc.name}</h4>
                <p>{doc.pageCount} pages • {doc.chunkCount || 0} chunks</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;