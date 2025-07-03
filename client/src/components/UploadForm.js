import React, { useState, useRef } from 'react';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaUpload, FaDownload, FaFileExcel } from 'react-icons/fa';

const UploadForm = ({ onUpload, onDownload, isLoading }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is Excel
      if (!file.name.endsWith('.xlsx')) {
        setError('Please select a valid Excel (.xlsx) file');
        setSelectedFile(null);
        setFileName('');
        return;
      }
      
      setSelectedFile(file);
      setFileName(file.name);
      setError('');
    }
  };

  // Handle file upload
  const handleUpload = () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    onUpload(selectedFile);
    // Reset form after upload
    setSelectedFile(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="upload-section">
      <Card.Body>
        <Card.Title>Bulk Upload Users</Card.Title>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form.Group className="mb-3">
          <Form.Label>Upload Excel File</Form.Label>
          <div className="d-flex align-items-center">
            <Form.Control
              type="file"
              onChange={handleFileChange}
              disabled={isLoading}
              accept=".xlsx"
              ref={fileInputRef}
              className="mb-2"
            />
          </div>
          
          {fileName && (
            <Alert variant="info" className="d-flex align-items-center mt-2">
              <FaFileExcel className="me-2" /> {fileName}
            </Alert>
          )}
          
          <Form.Text className="text-muted">
            Please upload an Excel file with the required format. Make sure all user data is valid.
          </Form.Text>
        </Form.Group>
        
        <div className="d-grid gap-2">
          <Button 
            variant="primary" 
            onClick={handleUpload} 
            disabled={!selectedFile || isLoading}
          >
            {isLoading ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Uploading...
              </>
            ) : (
              <>
                <FaUpload className="me-2" /> Upload Users
              </>
            )}
          </Button>
          
          <Button 
            variant="outline-secondary" 
            onClick={onDownload}
            disabled={isLoading}
          >
            <FaDownload className="me-2" /> Download Sample Template
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default UploadForm;
