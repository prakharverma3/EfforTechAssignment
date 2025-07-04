import React, { useState } from 'react';
import { Table, Card, Button, Form } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const UserList = ({ users, onEdit, onDelete, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showPANMap, setShowPANMap] = useState({});

  const togglePANVisibility = (userId) => {
    setShowPANMap(prevState => ({
      ...prevState,
      [userId]: !prevState[userId]
    }));
  };

  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    return (
      user.firstName.toLowerCase().includes(term) ||
      user.lastName.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.phoneNumber.includes(term)
    );
  });

  return (
    <Card>
      <Card.Body>
        <Card.Title>User List</Card.Title>
        <Form.Control
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-3"
        />
        <Table striped bordered responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>PAN</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" className="text-center">Loading...</td>
              </tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <tr key={user.id}>
                  <td>{index + 1}</td>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.phoneNumber}</td>
<td>
    {showPANMap[user.id] ?
      user.panNumber :
      `${user.panNumber.slice(0, 4)}••••${user.panNumber.slice(-4)}`}
    <Button variant="link" onClick={() => togglePANVisibility(user.id)}>
      {showPANMap[user.id] ? <FaEyeSlash /> : <FaEye />}
    </Button>
  </td>
                  <td>
                    <Button size="sm" onClick={() => onEdit(user)} disabled={isLoading}>
                      Edit
                    </Button>{' '}
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => onDelete(user.id)}
                      disabled={isLoading}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">No users found</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default UserList;
