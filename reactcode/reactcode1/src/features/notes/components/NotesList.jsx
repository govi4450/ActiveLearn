import React, { useState } from 'react';
import { useNotes } from '../hooks/useNotes';
import Loading from '../../../components/Loading';

function NotesList({ currentUser, videoId = null }) {
	const { notes, loading, error, createNote, editNote, removeNote } = useNotes(currentUser, videoId);
	const [newNote, setNewNote] = useState({ timestamp: 0, content: '' });
	const [editingId, setEditingId] = useState(null);
	const [editContent, setEditContent] = useState('');

	if (loading) return <Loading message="Loading notes..." />;
	if (error) return <div className="error">Error loading notes</div>;

	const formatTimestamp = (seconds) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	const handleAddNote = async () => {
		if (!newNote.content.trim()) {
			alert('Please enter note content');
			return;
		}
		if (!videoId) {
			alert('Video ID required');
			return;
		}

		const success = await createNote(videoId, newNote.timestamp, newNote.content);
		if (success) {
			setNewNote({ timestamp: 0, content: '' });
		}
	};

	const handleEditNote = async (noteId) => {
		if (!editContent.trim()) {
			alert('Note content cannot be empty');
			return;
		}

		const success = await editNote(noteId, editContent);
		if (success) {
			setEditingId(null);
			setEditContent('');
		}
	};

	const handleDeleteNote = async (noteId) => {
		if (window.confirm('Delete this note?')) {
			await removeNote(noteId);
		}
	};

	return (
		<div className="notes-list dashboard-card">
			<div className="notes-header">
				<h2>📝 Notes</h2>
				<span className="notes-count">{notes.length} notes</span>
			</div>

			{videoId && (
				<div className="add-note-section">
					<input
						type="number"
						placeholder="Timestamp (seconds)"
						value={newNote.timestamp}
						onChange={(e) => setNewNote({ ...newNote, timestamp: parseInt(e.target.value) || 0 })}
						className="timestamp-input"
					/>
					<textarea
						placeholder="Add a note..."
						value={newNote.content}
						onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
						className="note-textarea"
						rows="3"
					/>
					<button onClick={handleAddNote} className="btn-add-note">
						Add Note
					</button>
				</div>
			)}

			{notes.length === 0 ? (
				<div className="empty-state">
					<p>No notes yet. Start taking notes while watching videos!</p>
				</div>
			) : (
				<div className="notes-items">
					{notes.map((note) => (
						<div key={note._id} className="note-item">
							<div className="note-timestamp">
								⏱️ {formatTimestamp(note.timestamp)}
							</div>
							{editingId === note._id ? (
								<div className="note-edit">
									<textarea
										value={editContent}
										onChange={(e) => setEditContent(e.target.value)}
										className="note-textarea"
										rows="3"
									/>
									<div className="note-edit-actions">
										<button onClick={() => handleEditNote(note._id)} className="btn-save">
											Save
										</button>
										<button onClick={() => setEditingId(null)} className="btn-cancel">
											Cancel
										</button>
									</div>
								</div>
							) : (
								<>
									<div className="note-content">{note.content}</div>
									<div className="note-meta">
										<span className="note-date">
											{new Date(note.createdAt).toLocaleDateString()}
										</span>
										<div className="note-actions">
											<button 
												onClick={() => {
													setEditingId(note._id);
													setEditContent(note.content);
												}}
												className="btn-edit"
											>
												Edit
											</button>
											<button 
												onClick={() => handleDeleteNote(note._id)}
												className="btn-delete"
											>
												Delete
											</button>
										</div>
									</div>
								</>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export default NotesList;
