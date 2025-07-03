import React, { useState, useRef } from 'react';
import { Button, Form, Card, Alert } from 'react-bootstrap';

const UploadForm = ({ onUpload, onDownload, isLoading }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.name.endsWith('.xlsx')) {
      setFile(selected);
      setError('');
    } else {
      setFile(null);
      setError('Please select a valid .xlsx file');
    }
  };

  const handleUpload = () => {
    if (!file) {
      setError('No file selected');
      return;
    }
    onUpload(file);
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title>Upload Excel</Card.Title>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form.Group>
          <Form.Control
            type="file"
            accept=".xlsx"
            onChange={handleChange}
            ref={fileInputRef}
            disabled={isLoading}
          />
        </Form.Group>
        <div className="mt-3 d-grid gap-2">
          <Button onClick={handleUpload} disabled={!file || isLoading}>
            Upload
          </Button>
          <Button variant="secondary" onClick={onDownload} disabled={isLoading}>
            Download Sample
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default UploadForm;
