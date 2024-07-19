document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'http://localhost:3000/notes';
    const notesContainer = document.getElementById('notes-container');
    const addNoteButton = document.getElementById('add-note');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    // How to fetch notes from the server
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
                <button onclick="editNote(${note.id})">Edit</button>
                <button onclick="deleteNote(${note.id})">Delete</button>
            `;
            notesContainer.appendChild(noteElement);
        });
    };

    // Add a new note
    const addNote = async () => {
        const title = document.getElementById('note-title').value;
        const content = document.getElementById('note-content').value;
        if (title && content) {
            const newNote = { title, content };
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newNote)
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const createdNote = await response.json();
                fetchNotes(); // Re-fetch and render notes
                // Clear the input fields
                document.getElementById('note-title').value = '';
                document.getElementById('note-content').value = '';
            } catch (error) {
                console.error('Error adding note:', error);
            }
        } else {
            console.log('Title and content cannot be empty');
        }
    };

    // Edit an existing note
    window.editNote = async (id) => {
        try {
            const note = await fetch(`${apiUrl}/${id}`).then(response => response.json());
            console.log('Editing note:', note);
            const newTitle = prompt('Edit title:', note.title);
            const newContent = prompt('Edit content:', note.content);
            if (newTitle && newContent) {
                const updatedNote = { title: newTitle, content: newContent };
                const response = await fetch(`${apiUrl}/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedNote)
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                fetchNotes(); // Re-fetch and render notes
            } else {
                console.log('New title and content cannot be empty');
            }
        } catch (error) {
            console.error('Error editing note:', error);
        }
    };

    // Delete a note with confirmation
    window.deleteNote = async (id) => {
        const confirmed = confirm('Sure to delete this note?');
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

    // Search notes
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

    // Event listeners
    searchButton.addEventListener('click', searchNotes);
    addNoteButton.addEventListener('click', addNote);

    // Initial fetch and render notes
    fetchNotes();
});
