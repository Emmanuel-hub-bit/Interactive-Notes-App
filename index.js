document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'http://localhost:3000/notes';
    const notesContainer = document.getElementById('notes-container');
    const addNoteButton = document.getElementById('add-note');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    // Fetch notes from the server
    const fetchNotes = async () => {
        const response = await fetch(apiUrl);
        const notes = await response.json();
        renderNotes(notes);
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
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newNote)
            });
            const createdNote = await response.json();
            fetchNotes(); // Re-fetch and render notes
            // Clear the input fields
            document.getElementById('note-title').value = '';
            document.getElementById('note-content').value = '';
        }
    };

    // Edit an existing note
    window.editNote = async (id) => {
        const note = await fetch(`${apiUrl}/${id}`).then(response => response.json());
        const newTitle = prompt('Edit title:', note.title);
        const newContent = prompt('Edit content:', note.content);
        if (newTitle && newContent) {
            const updatedNote = { title: newTitle, content: newContent };
            await fetch(`${apiUrl}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedNote)
            });
            fetchNotes(); // Re-fetch and render notes
        }
    };

    // Delete a note
    window.deleteNote = async (id) => {
        await fetch(`${apiUrl}/${id}`, {
            method: 'DELETE'
        });
        fetchNotes(); // Re-fetch and render notes
    };

    // Search notes
    const searchNotes = async () => {
        const query = searchInput.value.toLowerCase();
        const response = await fetch(apiUrl);
        const notes = await response.json();
        const filteredNotes = notes.filter(note => 
            note.title.toLowerCase().includes(query) || 
            note.content.toLowerCase().includes(query)
        );
        renderNotes(filteredNotes);
    };

    // Event listeners
    searchButton.addEventListener('click', searchNotes);
    addNoteButton.addEventListener('click', addNote);

    // Initial fetch and render notes
    fetchNotes();
});
