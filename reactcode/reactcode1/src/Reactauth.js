import React, { useState } from 'react';
import axios from 'axios';

const backendUrl = "http://127.0.0.1:3000/"; 

function ReactAuth({ onLogin }) {
	const [showModal, setShowModal] = useState(false);
	const [isLogin, setIsLogin] = useState(true);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [currentUser, setCurrentUser] = useState(localStorage.getItem("currentUser") || null);

	const openModal = () => setShowModal(true);
	const closeModal = () => {
		setShowModal(false);
		setUsername("");
		setPassword("");
		setError("");
	};

	const toggleMode = () => setIsLogin(!isLogin);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		try {
			const endpoint = isLogin ? "auth/login" : "auth/register";
			await axios.post(`${backendUrl}api/${endpoint}`, { username, password });
			localStorage.setItem("currentUser", username);
			setCurrentUser(username);
			closeModal();
			if (onLogin) onLogin(username);
		} catch (err) {
			setError(err.response?.data?.error || "Authentication failed");
		}
	};

	const logout = () => {
		localStorage.removeItem("currentUser");
		setCurrentUser(null);
		if (onLogin) onLogin(null);
	};

	return (
		<div>
			{!currentUser ? (
				<button
					onClick={openModal}
					style={{
						background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
						color: 'white',
						padding: '1.2rem 2.8rem',
						borderRadius: '20px',
						fontSize: '1.35rem',
						fontWeight: 700,
						border: 'none',
						cursor: 'pointer',
						margin: '1rem 0',
						boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
					}}
				>
					Login
				</button>
			) : (
				<>
					<span>Welcome, {currentUser}</span>
					<button onClick={logout}>Logout</button>
				</>
			)}
			{showModal && (
				<div className="modal" style={{ display: 'block' }}>
					<div className="modal-content">
						<span className="close" onClick={closeModal}>&times;</span>
						<h2>{isLogin ? "Login" : "Register"}</h2>
						<form className="auth-form" onSubmit={handleSubmit}>
							<input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required />
							<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
							<div className="auth-actions">
								<button type="submit">{isLogin ? "Login" : "Register"}</button>
								<button type="button" className="auth-toggle" onClick={toggleMode}>
									{isLogin ? "Need an account? Register" : "Have an account? Login"}
								</button>
							</div>
							{error && <div className="auth-error" style={{ display: 'block' }}>{error}</div>}
						</form>
					</div>
				</div>
			)}
		</div>
	);
}

export default ReactAuth;
