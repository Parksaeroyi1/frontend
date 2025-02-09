const note = document.querySelector(".notes");
const noteForm = document.getElementById("noteForm");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const userDisplay = document.getElementById("userDisplay");

async function getData() {
  const url = "http://localhost:8000/notesbyuser";
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ usernameID: localStorage.getItem("usernameID") })
    });

    console.log("trigger", localStorage.getItem("usernameID"));

    const json = await response.json();
    console.log("called", json);
    note.innerHTML = '';

    json.forEach(item => {
      const li = document.createElement("li");
      li.dataset.id = item._id; // Store the note's id for deletion

      // Format timestamps
      const createdAt = new Date(item.createdAt).toLocaleString();
      const updatedAt = new Date(item.updatedAt).toLocaleString();

      // Only show "Last edited" if the note was actually edited
      let editedText = createdAt !== updatedAt ? `<p class="updated-at">Last edited: ${updatedAt}</p>` : "";

      li.innerHTML = `
        <h2>${item.title}</h2>
        <p>${item.description}</p>
        <p class="created-by">Created by: ${localStorage.getItem("username")}</p>
        <p class="created-at">Created at: ${createdAt}</p>
        ${editedText} <!-- Show last edited only if different -->
        <button class="edit-btn" onclick="editNoteHandler(event)">Edit</button>
        <button class="delete-btn" onclick="deleteNoteHandler(event)">×</button>
      `;

      note.appendChild(li);
    });

  } catch (error) {
    console.error(error.message);
  }
}

async function deleteNote(noteId) {
  try {
    const response = await fetch(`http://localhost:8000/notes/${noteId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (response.ok) {
      console.log('Note deleted successfully');
    } else {
      const data = await response.json();
      console.error('Error deleting note:', data.message);
    }
  } catch (error) {
    console.error('Error deleting note:', error);
  }
}

function deleteNoteHandler(event) {
  const noteId = event.target.closest('li').dataset.id;
  deleteNote(noteId);
  event.target.closest('li').remove();
}

function editNoteHandler(event) {
  const li = event.target.closest('li');
  const noteId = li.dataset.id;
  const title = li.querySelector('h2').innerText;
  const description = li.querySelector('p').innerText;

  titleInput.value = title;
  descriptionInput.value = description;
  noteForm.dataset.id = noteId;
  noteForm.removeEventListener("submit", createNote);
  noteForm.addEventListener("submit", updateNote);
}

async function updateNote(event) {
  event.preventDefault();

  const noteId = noteForm.dataset.id;
  const title = titleInput.value;
  const description = descriptionInput.value;

  try {
    const response = await fetch(`http://localhost:8000/notes/${noteId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ title, description })
    });

    if (!response.ok) {
      if (response.status === 401) {
        alert("Session expired. Please log in again.");
        logoutUser();
        return;
      }
      throw new Error(`Response status: ${response.status}`);
    }

    const updatedNote = await response.json();
    console.log("Updated Note:", updatedNote);

    const li = document.querySelector(`li[data-id="${noteId}"]`);
    if (li) {
      li.querySelector('h2').innerText = updatedNote.title;
      li.querySelector('p').innerText = updatedNote.description;

      const createdAt = new Date(updatedNote.createdAt).toLocaleString();
      const updatedAt = new Date(updatedNote.updatedAt).toLocaleString();
      let editedText = createdAt !== updatedAt ? `<p class="updated-at">Last edited: ${updatedAt}</p>` : "";

      const createdByElement = li.querySelector('.created-by');
      const createdAtElement = li.querySelector('.created-at');
      const updatedAtElement = li.querySelector('.updated-at');

      if (createdByElement) {
        createdByElement.innerText = `Created by: ${updatedNote.createdBy}`;
      }
      if (createdAtElement) {
        createdAtElement.innerText = `Created at: ${createdAt}`;
      }
      if (updatedAtElement) {
        updatedAtElement.innerHTML = editedText;
      } else {
        li.insertAdjacentHTML('beforeend', editedText);
      }
    }

    // Clear the form inputs
    titleInput.value = "";
    descriptionInput.value = "";
    noteForm.removeEventListener("submit", updateNote);
    noteForm.addEventListener("submit", createNote);
    delete noteForm.dataset.id;

  } catch (error) {
    console.error("Error updating note:", error.message);
  }
}

async function createNote(event) {
  event.preventDefault();

  const title = titleInput.value;
  const description = descriptionInput.value;

  const newNote = {
    title: title,
    description: description,
    usernameID: localStorage.getItem("usernameID")
  };

  const url = "http://localhost:8000/notes";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(newNote)
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const createdNote = await response.json();
    console.log("Created Note:", createdNote);

    // Check if createdAt and updatedAt fields are present
    if (!createdNote.createdAt || !createdNote.updatedAt) {
      throw new Error("Missing createdAt or updatedAt fields in the response");
    }

    const createdAt = new Date(createdNote.createdAt).toLocaleString();
    const updatedAt = new Date(createdNote.updatedAt).toLocaleString();

    let editedText = createdAt !== updatedAt ? `<p class="updated-at">Last edited: ${updatedAt}</p>` : "";

    // Add the new note to the list in the UI
    const li = document.createElement("li");
    li.dataset.id = createdNote._id;
    li.innerHTML = `
      <h2>${createdNote.title}</h2>
      <p>${createdNote.description}</p>
      <p class="created-by">Created by: ${localStorage.getItem("username")}</p>
      <p class="created-at">Created at: ${createdAt}</p>
      ${editedText}
      <button class="edit-btn" onclick="editNoteHandler(event)">Edit</button>
      <button class="delete-btn" onclick="deleteNoteHandler(event)">×</button>
    `;
    note.appendChild(li);

    // Clear the form inputs
    titleInput.value = "";
    descriptionInput.value = "";

  } catch (error) {
    console.error("Error creating note:", error.message);
  }
}

async function registerUser(event) {
  event.preventDefault();

  const username = document.getElementById("registerUsername").value;
  const password = document.getElementById("registerPassword").value;

  try {
    const response = await fetch("http://localhost:8000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const data = await response.json();
    console.log("User registered:", data);
    showLoginForm();

  } catch (error) {
    console.error("Error registering user:", error.message);
  }
}

async function loginUser(event) {
  event.preventDefault();

  const user = document.getElementById("loginUsername").value;
  const pass = document.getElementById("loginPassword").value;
  const successMessage = document.getElementById("loginSuccess");
  const errorMessage = document.getElementById("loginError");

  const url = "http://localhost:8000/login";
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username: user, password: pass })
    });

    const json = await response.json();

    if (response.ok && json.username) {
      localStorage.setItem("usernameID", json._id);
      localStorage.setItem("username", json.username);
      localStorage.setItem("token", json.token);

      // Show success message
      successMessage.innerText = "Login successful! Redirecting...";
      successMessage.style.display = "block";
      errorMessage.style.display = "none"; // Hide error if login is successful

      // Delay switching to the notes app to show the success message
      setTimeout(() => {
        showNotesApp();
      }, 1000); // 1 second delay

    } else {
      throw new Error("Invalid username or password"); // Handle incorrect login
    }
  } catch (error) {
    successMessage.style.display = "none"; // Hide success message if there's an error
    errorMessage.innerText = error.message;
    errorMessage.style.display = "block"; // Show the error message

    console.error("Error logging in:", error.message);
  }
}

function logoutUser() {
  note.innerHTML = '';
  localStorage.removeItem("token");
  localStorage.removeItem("usernameID");
  localStorage.removeItem("username");
  showLoginForm();
}

function showRegistrationForm() {
  document.getElementById("registrationForm").style.display = "block";
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("notesApp").style.display = "none";
}

function showLoginForm() {
  document.getElementById("registrationForm").style.display = "none";
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("notesApp").style.display = "none";
}

function showNotesApp() {
  document.getElementById("registrationForm").style.display = "none";
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("notesApp").style.display = "block";
  userDisplay.innerText = `Welcome, ${localStorage.getItem("username")}`;
  getData();
}

// Attach event listeners to the forms
document.getElementById("registrationForm").addEventListener("submit", registerUser);
document.getElementById("loginForm").addEventListener("submit", loginUser);
noteForm.addEventListener("submit", createNote);

// Show the registration form by default
if (localStorage.getItem("token")) {
  showNotesApp();
} else {
  showRegistrationForm();
}