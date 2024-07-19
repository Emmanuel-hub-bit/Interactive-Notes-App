
document.addEventListener('DOMContentLoaded', () => {
    const notesContainer = document.getElementById('notes-container');
    const addNoteButton = document.getElementById('add-note');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const editModal = document.getElementById('edit-modal');
    const closeModalButton = document.getElementById('close-modal');
    const saveNoteButton = document.getElementById('save-note');
    const editTitleInput = document.getElementById('edit-note-title');
    const editContentInput = document.getElementById('edit-note-content');
    let currentNoteId = null;

    const apiUrl = 'http://localhost:3000/notes'; // URL to the json-server API

    // Fetching notes from my server
    const fetchNotes = async () => {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const notes = await response.json();
            renderNotes(notes);
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    };

    // Render notes to the screen
    const renderNotes = (notesToRender) => {
        notesContainer.innerHTML = ''; // Clear the container
        notesToRender.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.className = 'note';
            noteElement.innerHTML = `
                <h3>${note.title}</h3>
                <p>${note.content}</p>
                <p><small>${new Date(note.date).toLocaleString()}</small></p>
                <button class="edit-btn" data-id="${note.id}">Edit</button>
                <button class="delete-btn" data-id="${note.id}">Delete</button>
            `;
            notesContainer.appendChild(noteElement);
        });

        // Add event listeners to the buttons
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', () => openEditModal(button.dataset.id));
        });
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', () => deleteNote(button.dataset.id));
        });
    };

    // Function to open the edit modal
    const openEditModal = async (id) => {
        try {
            const response = await fetch(`${apiUrl}/${id}`);
            const note = await response.json();
            currentNoteId = id;
            editTitleInput.value = note.title;
            editContentInput.value = note.content;
            editModal.style.display = 'block';
        } catch (error) {
            console.error('Error fetching note for editing:', error);
        }
    };

    // Function to save edited note
    const saveNote = async () => {
        if (currentNoteId) {
            const updatedNote = {
                title: editTitleInput.value,
                content: editContentInput.value,
                date: new Date().toISOString()
            };
            try {
                const response = await fetch(`${apiUrl}/${currentNoteId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedNote)
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                fetchNotes(); // Re-fetch and render notes
                closeModal(); // Close the modal
            } catch (error) {
                console.error('Error updating note:', error);
            }
        }
    };

    // Function to close the edit modal
    const closeModal = () => {
        editModal.style.display = 'none';
        currentNoteId = null;
    };

    // Function to add a new note
    const addNote = async () => {
        const title = document.getElementById('note-title').value;
        const content = document.getElementById('note-content').value;
        const date = new Date().toISOString(); // Get the current date and time
        if (title && content) {
            const newNote = { title, content, date };
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newNote)
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                fetchNotes(); // Re-fetch and render notes
                // Clear the input fields
                document.getElementById('note-title').value = '';
                document.getElementById('note-content').value = '';
            } catch (error) {
                console.error('Error adding note:', error);
            }
        }
    };

    // Function to delete a note
    const deleteNote = async (id) => {
        const confirmed = confirm('Are you sure you want to delete this note?');
        if (confirmed) {
            try {
                const response = await fetch(`${apiUrl}/${id}`, {
                    method: 'DELETE'
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                fetchNotes(); // Re-fetch and render notes
            } catch (error) {
                console.error('Error deleting note:', error);
            }
        }
    };

    // Function to search notes
    const searchNotes = async () => {
        const query = searchInput.value.toLowerCase();
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const notes = await response.json();
            const filteredNotes = notes.filter(note => 
                note.title.toLowerCase().includes(query) || 
                note.content.toLowerCase().includes(query)
            );
            renderNotes(filteredNotes);
        } catch (error) {
            console.error('Error searching notes:', error);
        }
    };

    // Event listener for search button
    searchButton.addEventListener('click', searchNotes);

    // Event listener for add note button
    addNoteButton.addEventListener('click', addNote);

    // Event listener for save note button in modal
    saveNoteButton.addEventListener('click', saveNote);

    // Event listener for close button in modal
    closeModalButton.addEventListener('click', closeModal);

    // Initial fetch and render of notes
    fetchNotes();
});
