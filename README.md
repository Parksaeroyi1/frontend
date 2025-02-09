# Note-Taking App

## Overview
THIS IS THE FRONTEND CLIENT PART

## Features
- User authentication (Register, Login, Logout)
- Create, update, and delete notes
- Display notes by user
- Show creation and last edited timestamps for notes
- Persist user session using localStorage

## Technologies Used
- HTML, CSS, JavaScript (Frontend)
- Node.js, Express.js (Backend)
- MongoDB (Database)
- JWT for authentication

 Open the `index.html` file in a browser to access the app.
 Before opening file in browser make sure the backend server is running.

## API Endpoints

### User Authentication
- **POST `/register`** - Register a new user
- **POST `/login`** - Log in a user

### Notes
- **POST `/notes`** - Create a new note
- **POST `/notesbyuser`** - Fetch notes by user
- **PUT `/notes/:id`** - Update an existing note
- **DELETE `/notes/:id`** - Delete a note

## Usage

### Register a New User
1. Open the app in a browser.
2. Fill out the registration form and submit.
3. After successful registration, proceed to login.

### Log In
1. Enter your registered username and password.
2. Upon successful login, you will be redirected to the notes section.

### Managing Notes
- **Create a Note**: Fill out the title and description fields, then submit.
- **Edit a Note**: Click the "Edit" button on an existing note, modify the fields, and submit.
- **Delete a Note**: Click the "×" button on a note to remove it.

### Log Out
Click the "Logout" button to clear the session and return to the login screen.

## Local Storage Usage
- `usernameID`: Stores the logged-in user's ID.
- `username`: Stores the logged-in username.
- `token`: Stores the authentication token for API requests.

## Notes
- If a user's session expires, they will be prompted to log in again.
- Edits update the "Last edited" timestamp, but the original creation date remains unchanged.



