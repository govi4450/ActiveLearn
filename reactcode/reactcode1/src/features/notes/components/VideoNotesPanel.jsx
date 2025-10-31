import React, { useState } from 'react';
import { useNotes } from '../hooks/useNotes';

function VideoNotesPanel({ currentUser, videoId, isOpen, onClose, iframeRef }) {
	const { notes, loading, createNote, editNote, removeNote } = useNotes(currentUser, videoId);
	const [newNoteContent, setNewNoteContent] = useState('');
	const [minutes, setMinutes] = useState(0);
	const [seconds, setSeconds] = useState(0);
	const [editingId, setEditingId] = useState(null);
	const [editContent, setEditContent] = useState('');

	if (!isOpen) return null;

	const getTotalSeconds = () => {
		return (parseInt(minutes) || 0) * 60 + (parseInt(seconds) || 0);
	};

	const formatTimestamp = (totalSeconds) => {
		const mins = Math.floor(totalSeconds / 60);
		const secs = Math.floor(totalSeconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	const handleAddNote = async () => {
		if (!newNoteContent.trim()) {
			alert('Please enter note content');
			return;
		}

		const totalSeconds = getTotalSeconds();
		const success = await createNote(videoId, totalSeconds, newNoteContent);
		if (success) {
			setNewNoteContent('');
			setMinutes(0);
			setSeconds(0);
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

	const handleTimestampClick = (timestamp) => {
		// Emit event to jump to timestamp in video
		window.dispatchEvent(new CustomEvent('jumpToTimestamp', { detail: timestamp }));
	};

	return (
		<div className="video-notes-panel">
			<div className="notes-panel-header">
				<h3>📝 Notes</h3>
				<button className="close-panel-btn" onClick={onClose}>×</button>
			</div>

			<div className="notes-panel-content">
				{/* Add Note Section */}
				<div className="add-note-quick">
					<div className="manual-timestamp">
						<label>📍 Video Timestamp:</label>
						<div className="timestamp-inputs">
							<div className="time-input-group">
								<input
									type="number"
									value={minutes}
									onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
									className="timestamp-input-small"
									placeholder="00"
									min="0"
								/>
								<span className="time-label">MIN</span>
							</div>
							<span className="time-separator">:</span>
							<div className="time-input-group">
								<input
									type="number"
									value={seconds}
									onChange={(e) => setSeconds(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
									className="timestamp-input-small"
									placeholder="00"
									min="0"
									max="59"
								/>
								<span className="time-label">SEC</span>
							</div>
						</div>
						<span className="timestamp-preview">Total: {formatTimestamp(getTotalSeconds())}</span>
					</div>
					<textarea
						placeholder="What did you learn at this moment?"
						value={newNoteContent}
						onChange={(e) => setNewNoteContent(e.target.value)}
						className="note-textarea-small"
						rows="3"
					/>
					<button onClick={handleAddNote} className="btn-add-note-quick">
						+ Add Note at {formatTimestamp(getTotalSeconds())}
					</button>
				</div>

				{/* Notes List */}
				<div className="notes-panel-list">
					<h4>Your Notes ({notes.length})</h4>
					{loading ? (
						<p className="loading-text">Loading notes...</p>
					) : notes.length === 0 ? (
						<p className="empty-notes">No notes yet. Start taking notes!</p>
					) : (
						notes.map((note) => (
							<div key={note._id} className="note-item-panel">
								{editingId === note._id ? (
									<div className="note-edit-panel">
										<textarea
											value={editContent}
											onChange={(e) => setEditContent(e.target.value)}
											className="note-textarea-small"
											rows="3"
										/>
										<div className="note-edit-actions-panel">
											<button onClick={() => handleEditNote(note._id)} className="btn-save-small">
												Save
											</button>
											<button onClick={() => setEditingId(null)} className="btn-cancel-small">
												Cancel
											</button>
										</div>
									</div>
								) : (
									<>
										<div 
											className="note-timestamp-panel clickable"
											onClick={() => handleTimestampClick(note.timestamp)}
											title="Click to jump to this moment"
										>
											⏱️ {formatTimestamp(note.timestamp)}
										</div>
										<div className="note-content-panel">{note.content}</div>
										<div className="note-actions-panel">
											<button 
												onClick={() => {
													setEditingId(note._id);
													setEditContent(note.content);
												}}
												className="btn-edit-small"
											>
												Edit
											</button>
											<button 
												onClick={() => handleDeleteNote(note._id)}
												className="btn-delete-small"
											>
												Delete
											</button>
										</div>
									</>
								)}
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}

export default VideoNotesPanel;
