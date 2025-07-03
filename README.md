# User Management System

A full-stack web application for managing user data with CRUD operations, bulk upload, and download functionality.

## Features

- Create, Read, Update, and Delete (CRUD) user entries
- Upload user data in bulk using Excel files
- Download sample Excel templates
- Responsive design (mobile-friendly)
- Form validations
- PAN number masking with toggle visibility

## Technology Stack

- **Frontend**: React, React Bootstrap, React Icons, React-Toastify
- **Backend**: Node.js, Express.js
- **Database**: MySQL

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

## Installation

### Setting up the database

1. Create a MySQL database named `user_management`
2. Update the database credentials in the `.env` file in the server directory

### Setting up the Backend

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Start the backend server:
   ```
   npm start
   ```

The server will run on http://localhost:5000

### Setting up the Frontend

1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

The application will run on http://localhost:3000

## Validation Rules

- No field should be empty
- Email format must be valid
- Phone number should be numeric and 10 digits
- PAN number must follow the pattern: 5 letters, 4 digits, 1 letter

## Usage

### Bulk Upload

1. Click "Download Sample Template" to get the correct format
2. Fill in the Excel file with user data
   2.1. Make sure your Excel file has these exact column headers:
   •  "First Name" (not "FirstName" or "firstname")
   •  "Last Name" (not "LastName" or "lastname")
   •  "Email"
   •  "Phone Number" (with a space between "Phone" and "Number")
   •  "PAN Number" (with a space between "PAN" and "Number")
3. Upload the file using the "Upload" button
4. If there are validation errors, they will be displayed

### Adding a User

1. Fill out the form on the left side of the application
2. Click "Add User"
3. If successful, you'll see a success message and the user will appear in the list

### Editing a User

1. Click the "Edit" button next to the user you want to modify
2. Update the form with new information
3. Click "Update User"

### Deleting a User

1. Click the "Delete" button next to the user you want to remove
2. Confirm the deletion when prompted



## License

MIT
