const note = document.querySelector(".notes");
const noteForm = document.getElementById("noteForm");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");

async function getData() {
  const url = "http://localhost:8000/notes";
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    console.log(json);
    note.innerHTML = '';

    json.forEach(item => {
      const li = document.createElement("li");
      li.dataset.id = item._id; // Store the note's id for deletion

      li.innerHTML = `
        <h2>${item.title}</h2>
        <p>${item.description}</p>
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
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
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
      throw new Error(`Response status: ${response.status}`);
    }

    const updatedNote = await response.json();
    console.log("Updated Note:", updatedNote);

    const li = document.querySelector(`li[data-id="${noteId}"]`);
    li.querySelector('h2').innerText = updatedNote.title;
    li.querySelector('p').innerText = updatedNote.description;

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
    description: description
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

    // Add the new note to the list in the UI
    const li = document.createElement("li");
    li.dataset.id = createdNote._id;
    li.innerHTML = `
      <h2>${createdNote.title}</h2>
      <p>${createdNote.description}</p>
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

// Attach the createNote function to the form submit event
noteForm.addEventListener("submit", createNote);

// Fetch and display the notes when the page loads
getData();