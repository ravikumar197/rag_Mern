import React, { useState } from 'react';
import axios from 'axios';

function DocumentUpload({ onDocumentUploaded }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Add token to upload
            const response = await axios.post(
                'http://localhost:5000/api/documents/upload',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                }
            );

            onDocumentUploaded({
                documentId: response.data.documentId,
                name: response.data.document.name,
                pageCount: response.data.document.pageCount,
                chunks: response.data.document.chunks.total,
            });

            event.target.value = '';
        } catch (err) {
            setError(err.response?.data?.error || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="upload-section">
            <h2>📄 Upload Document</h2>
            <label className="upload-input">
                <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    disabled={loading}
                />
                <span>{loading ? 'Uploading...' : 'Choose PDF'}</span>
            </label>
            {error && <p className="error">{error}</p>}
        </div>
    );
}

export default DocumentUpload;