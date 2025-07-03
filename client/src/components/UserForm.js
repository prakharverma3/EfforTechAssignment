import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Spinner } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const initialFormState = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  panNumber: ''
};

const UserForm = ({ onSubmit, selectedUser, isLoading }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [validated, setValidated] = useState(false);
  const [showPAN, setShowPAN] = useState(false);
  
  // Update form when selected user changes
  useEffect(() => {
    if (selectedUser) {
      setFormData(selectedUser);
    } else {
      setFormData(initialFormState);
    }
    setValidated(false);
  }, [selectedUser]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number (only allow numbers)
    if (name === 'phoneNumber' && value) {
      const digitsOnly = value.replace(/\D/g, '');
      setFormData({ ...formData, [name]: digitsOnly.slice(0, 10) });
    }
    // Special handling for PAN number (uppercase)
    else if (name === 'panNumber' && value) {
      setFormData({ ...formData, [name]: value.toUpperCase() });
    }
    else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Toggle PAN number visibility
  const togglePANVisibility = () => {
    setShowPAN(!showPAN);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    // Validate form
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    // Submit the form data
    onSubmit(formData, !!selectedUser);
    
    // Reset form if not editing
    if (!selectedUser) {
      setFormData(initialFormState);
      setValidated(false);
    }
  };

  // Validate PAN format
  const validatePANFormat = (pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };

  // Mask the PAN number
  const maskPAN = (pan) => {
    if (!pan) return '';
    return showPAN ? pan : pan.replace(/./g, '•');
  };

  return (
    <Card className="user-form mb-4">
      <Card.Body>
        <Card.Title>
          {selectedUser ? 'Edit User' : 'Add New User'}
        </Card.Title>
        
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>First Name*</Form.Label>
            <Form.Control
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            <Form.Control.Feedback type="invalid">
              First name is required
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Last Name*</Form.Label>
            <Form.Control
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            <Form.Control.Feedback type="invalid">
              Last name is required
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email*</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
            />
            <Form.Control.Feedback type="invalid">
              Please enter a valid email address
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Phone Number* (10 digits)</Form.Label>
            <Form.Control
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              disabled={isLoading}
              pattern="[0-9]{10}"
              maxLength="10"
            />
            <Form.Control.Feedback type="invalid">
              Please enter a valid 10-digit phone number
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3 pan-field">
            <Form.Label>PAN Number*</Form.Label>
            <div className="position-relative">
              <Form.Control
                type="text"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
                required
                disabled={isLoading}
                pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                maxLength="10"
              />
              <div className="eye-icon" onClick={togglePANVisibility}>
                {showPAN ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
            <Form.Text className="text-muted">
              Format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)
            </Form.Text>
            <Form.Control.Feedback type="invalid">
              Please enter a valid PAN number (5 letters, 4 digits, 1 letter)
            </Form.Control.Feedback>
          </Form.Group>

          <div className="d-grid gap-2">
            <Button 
              variant="primary" 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                selectedUser ? 'Update User' : 'Add User'
              )}
            </Button>
            
            {selectedUser && (
              <Button 
                variant="secondary" 
                onClick={() => setFormData(initialFormState)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default UserForm;
