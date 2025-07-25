import React, { useState, useRef, useEffect } from "react";
import "./App.css";

/*
  Modern, minimalistic, light-themed notes app UI.
  Primary:   #1976d2  (blue)
  Secondary: #424242  (dark grey)
  Accent:    #ffca28  (amber)
*/

/** Utilities **/
function uuid() {
  // Simple unique id generation for demo/local storage
  return (
    "n-" +
    Math.random().toString(36).slice(2, 8) +
    "-" +
    Date.now().toString(36)
  );
}

// PUBLIC_INTERFACE
function App() {
  /** Notes state: [{ id, title, content, updated }] **/
  const [notes, setNotes] = useState(() => {
    // Localstorage persistence
    try {
      const saved = localStorage.getItem("notes-app-data");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  /** Refs **/
  const titleInput = useRef();

  // Persist notes to localStorage
  useEffect(() => {
    localStorage.setItem("notes-app-data", JSON.stringify(notes));
  }, [notes]);

  /** Select first note on mount if any exist */
  useEffect(() => {
    if (!selectedNoteId && notes.length > 0) {
      setSelectedNoteId(notes[0].id);
    }
  }, [notes, selectedNoteId]);

  /** Computed: Filtered notes for sidebar */
  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  /** Selected note */
  const selectedNote =
    notes.find((n) => n.id === selectedNoteId) || null;

  // PUBLIC_INTERFACE
  function handleSelectNote(id) {
    setSelectedNoteId(id);
    setIsEditing(false);
  }

  // PUBLIC_INTERFACE
  function handleCreateNote() {
    const newId = uuid();
    const untitled = {
      id: newId,
      title: "Untitled Note",
      content: "",
      updated: Date.now(),
    };
    setNotes((prev) => [untitled, ...prev]);
    setSelectedNoteId(newId);
    setIsEditing(true);
    // Focus will set after render
    setTimeout(() => {
      titleInput.current && titleInput.current.focus();
    }, 50);
  }

  // PUBLIC_INTERFACE
  function handleDeleteNote(id) {
    if (window.confirm("Delete this note?")) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (selectedNoteId === id) {
        // Select the next note or none
        const idx = notes.findIndex((n) => n.id === id);
        const rest = notes.filter((n) => n.id !== id);
        setSelectedNoteId(rest[0]?.id || null);
      }
      setIsEditing(false);
    }
  }

  // PUBLIC_INTERFACE
  function handleEditStart() {
    setIsEditing(true);
    setTimeout(() => {
      titleInput.current && titleInput.current.focus();
    }, 50);
  }

  // PUBLIC_INTERFACE
  function handleSaveNote(e) {
    e.preventDefault();
    const title = e.target.title.value.trim() || "Untitled Note";
    const content = e.target.content.value;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === selectedNote.id
          ? { ...n, title, content, updated: Date.now() }
          : n
      )
    );
    setIsEditing(false);
  }

  // PUBLIC_INTERFACE
  function handleSearch(e) {
    setSearchTerm(e.target.value);
  }

  // PUBLIC_INTERFACE
  function handleClearSearch() {
    setSearchTerm("");
  }

  // PUBLIC_INTERFACE
  function handleCancelEdit() {
    setIsEditing(false);
  }

  // Used for displaying last updated (friendly)
  function formatDate(ts) {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toLocaleString([], { dateStyle: "short", timeStyle: "short" });
  }

  // PUBLIC_INTERFACE
  return (
    <div className="notes-app-root">
      {/* Top Bar */}
      <header className="top-bar" role="banner">
        <div className="top-bar-title">
          <span role="img" aria-label="note">📝</span> Notes
        </div>
        <div className="top-bar-actions">
          <button
            className="accent-btn"
            onClick={handleCreateNote}
            aria-label="New note"
            title="Create a new note"
          >
            + New Note
          </button>
        </div>
      </header>

      {/* Main Layout: Sidebar + Main */}
      <div className="main-layout">

        {/* Sidebar */}
        <nav className="sidebar" role="navigation" aria-label="Notes list">
          <div className="sidebar-search">
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={handleSearch}
              className="sidebar-search-input"
              aria-label="Search notes"
            />
            {searchTerm && (
              <button className="sidebar-search-clear" title="Clear" onClick={handleClearSearch}>
                ×
              </button>
            )}
          </div>
          <ul className="notes-list" role="list">
            {filteredNotes.length === 0 && (
              <li className="notes-list-empty">
                <em>No notes found.</em>
              </li>
            )}
            {filteredNotes.map((note) => (
              <li
                key={note.id}
                className={
                  "notes-list-item" +
                  (note.id === selectedNoteId ? " selected" : "")
                }
                tabIndex={0}
                aria-current={note.id === selectedNoteId ? "page" : undefined}
                onClick={() => handleSelectNote(note.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleSelectNote(note.id);
                }}
              >
                <div className="notes-list-title">{note.title}</div>
                <div className="notes-list-snippet">
                  {note.content.slice(0, 32)}{note.content.length > 32 ? "…" : ""}
                </div>
                <div className="notes-list-updated">
                  {formatDate(note.updated)}
                </div>
                <button
                  className="delete-btn"
                  aria-label="Delete note"
                  title="Delete this note"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNote(note.id);
                  }}
                >
                  🗑
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main Panel */}
        <main className="main-panel" role="main">
          {!selectedNote ? (
            <div className="empty-panel">
              <p>No note selected.</p>
              <button className="accent-btn" onClick={handleCreateNote}>+ Create your first note</button>
            </div>
          ) : isEditing ? (
            <form
              className="note-edit-form"
              onSubmit={handleSaveNote}
              autoComplete="off"
            >
              <input
                ref={titleInput}
                className="note-title-input"
                name="title"
                defaultValue={selectedNote.title}
                placeholder="Note title"
                aria-label="Note title"
                maxLength={64}
                required
              />
              <textarea
                className="note-content-input"
                name="content"
                defaultValue={selectedNote.content}
                placeholder="Your note here..."
                rows={12}
                aria-label="Note content"
                required
              />
              <div className="edit-actions">
                <button type="submit" className="primary-btn">Save</button>
                <button type="button" className="secondary-btn" onClick={handleCancelEdit}>Cancel</button>
              </div>
            </form>
          ) : (
            <section className="note-viewer">
              <div className="note-view-header">
                <h2 className="note-view-title">{selectedNote.title}</h2>
                <span className="note-view-updated" title={formatDate(selectedNote.updated)}>
                  {formatDate(selectedNote.updated)}
                </span>
              </div>
              <article className="note-view-content">
                <pre>{selectedNote.content || <span className="placeholder-text">Nothing here yet...</span>}</pre>
              </article>
              <div className="note-view-actions">
                <button className="primary-btn" onClick={handleEditStart}>
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteNote(selectedNote.id)}
                >
                  Delete
                </button>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
