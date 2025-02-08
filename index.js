const note = document.querySelector(".notes");
const noteForm = document.getElementById("noteForm");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");

async function getData() {
  const url = "http://localhost:8000/notes";
  try {
    const response = await fetch(url);
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
        <button class="delete-btn" onclick="deleteNote(event)">×</button>
      `;

      note.appendChild(li);
    });

  } catch (error) {
    console.error(error.message);
  }
}

async function deleteNote(event) {
  const noteId = event.target.closest('li').dataset.id;
  const url = `http://localhost:8000/notes/${noteId}`;
  try {
    const response = await fetch(url, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    // Remove the note from the UI
    event.target.closest('li').remove();
  } catch (error) {
    console.error("Error deleting note:", error.message);
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
        "Content-Type": "application/json"
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
      <button class="delete-btn" onclick="deleteNote(event)">×</button>
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
