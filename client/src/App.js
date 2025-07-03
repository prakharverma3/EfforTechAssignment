import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserForm from './components/UserForm';
import UserList from './components/UserList';
import UploadForm from './components/UploadForm';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

function App() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch all users from the API
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL);
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user form submission (create or update)
  const handleSubmitUser = async (userData, isEdit) => {
    setIsLoading(true);
    try {
      if (isEdit) {
        // Update existing user
        const response = await axios.put(`${API_URL}/${userData.id}`, userData);
        toast.success('User updated successfully');
        setUsers(users.map(user => user.id === userData.id ? response.data.data : user));
      } else {
        // Create new user
        const response = await axios.post(API_URL, userData);
        toast.success('User created successfully');
        setUsers([response.data.data, ...users]);
      }
      setSelectedUser(null); // Reset selected user after submission
    } catch (error) {
      console.error('Error submitting user:', error);
      
      if (error.response && error.response.data && error.response.data.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        errors.forEach(err => toast.error(err.msg || err.error || 'Validation error'));
      } else if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to save user data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setIsLoading(true);
      try {
        await axios.delete(`${API_URL}/${userId}`);
        toast.success('User deleted successfully');
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle edit user
  const handleEditUser = (user) => {
    setSelectedUser(user);
  };

  // Handle file upload
  const handleFileUpload = async (file) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success(response.data.message);
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error uploading file:', error);
      
      if (error.response && error.response.data && error.response.data.errors) {
        // Show the first few errors
        const errors = error.response.data.errors;
        const errorCount = errors.length;
        
        errors.slice(0, 3).forEach(err => {
          const errorMessage = err.row 
            ? `Row ${err.row}: ${err.error || err.msg}` 
            : (err.error || err.msg || 'Validation error');
          toast.error(errorMessage);
        });
        
        if (errorCount > 3) {
          toast.error(`...and ${errorCount - 3} more errors`);
        }
      } else if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to upload file');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle template download
  const handleDownloadTemplate = async () => {
    try {
      window.open(`${API_URL}/download/sample`, '_blank');
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Failed to download template');
    }
  };

  return (
    <Container className="py-4">
      <h1 className="text-center mb-4">User Management System</h1>

      <Row>
        <Col lg={4}>
          <UserForm 
            onSubmit={handleSubmitUser} 
            selectedUser={selectedUser} 
            isLoading={isLoading}
          />
          
          <UploadForm 
            onUpload={handleFileUpload} 
            onDownload={handleDownloadTemplate}
            isLoading={isLoading}
          />
        </Col>
        
        <Col lg={8}>
          <UserList 
            users={users} 
            onEdit={handleEditUser} 
            onDelete={handleDeleteUser}
            isLoading={isLoading}
          />
        </Col>
      </Row>
      
      <ToastContainer position="top-right" autoClose={5000} />
    </Container>
  );
}

export default App;
