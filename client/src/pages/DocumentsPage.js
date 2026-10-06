import React, { useState } from 'react';
import DocumentUpload from '../components/DocumentUpload';

function DocumentsPage({ documents, onDocumentUploaded, onSelectDocument, onRefresh }) {
    const [selectedDocs, setSelectedDocs] = useState([]);
    const [showUploadModal, setShowUploadModal] = useState(false);

    const toggleSelectDoc = (docId) => {
        setSelectedDocs(prev =>
            prev.includes(docId)
                ? prev.filter(id => id !== docId)
                : [...prev, docId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedDocs.length === documents.length) {
            setSelectedDocs([]);
        } else {
            setSelectedDocs(documents.map(doc => doc._id));
        }
    };

    const handleDeleteSelected = async () => {
        if (!window.confirm(`Delete ${selectedDocs.length} document(s)?`)) return;

        try {
            const token = localStorage.getItem('token');

            for (const docId of selectedDocs) {
                const response = await fetch(
                    `http://localhost:5000/api/documents/${docId}`,
                    {
                        method: 'DELETE',
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to delete document');
                }
            }

            setSelectedDocs([]);
            onRefresh();
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete documents');
        }
    };

    return (
        <div className="documents-page">
            <div className="documents-header">
                <h1>📚 Documents</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowUploadModal(true)}
                >
                    + Add New Document
                </button>
            </div>

            {showUploadModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button
                            className="modal-close"
                            onClick={() => setShowUploadModal(false)}
                        >
                            ✕
                        </button>
                        <DocumentUpload
                            onDocumentUploaded={() => {
                                setShowUploadModal(false);
                                onDocumentUploaded();
                            }}
                        />
                    </div>
                </div>
            )}

            {documents.length > 0 && (
                <div className="selection-toolbar">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={selectedDocs.length === documents.length && documents.length > 0}
                            onChange={toggleSelectAll}
                        />
                        Select All
                    </label>
                    {selectedDocs.length > 0 && (
                        <button
                            className="btn btn-danger"
                            onClick={handleDeleteSelected}
                        >
                            🗑️ Delete ({selectedDocs.length})
                        </button>
                    )}
                </div>
            )}

            <div className="documents-table-container">
                {documents.length === 0 ? (
                    <div className="empty-state">
                        <p>No documents uploaded yet</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowUploadModal(true)}
                        >
                            Upload First Document
                        </button>
                    </div>
                ) : (
                    <table className="documents-table">
                        <thead>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        checked={selectedDocs.length === documents.length && documents.length > 0}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th>Document Name</th>
                                <th>Pages</th>
                                <th>Chunks</th>
                                <th>Uploaded</th>
                                {/* <th>Actions</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {documents.map((doc) => (
                                <tr key={doc._id} className={selectedDocs.includes(doc._id) ? 'selected' : ''}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedDocs.includes(doc._id)}
                                            onChange={() => toggleSelectDoc(doc._id)}
                                        />
                                    </td>
                                    <td className="doc-name">{doc.name}</td>
                                    <td>{doc.pageCount}</td>
                                    <td>{doc.chunkCount || 0}</td>
                                    <td>{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                                    {/* <td>
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => onSelectDocument(doc)}
                                        >
                                            💬 Chat
                                        </button>
                                    </td> */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default DocumentsPage;