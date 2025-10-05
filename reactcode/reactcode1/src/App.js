import React from 'react';
import './Reactstyle.css';

import ReactAuth from './Reactauth';
import ReactPractice from './Reactpractice';
import ReactQuestions from './Reactquestions';
import ReactSummary from './Reactsummary';
import ReactVideo from './Reactvideo';

function App() {
	const [darkMode, setDarkMode] = React.useState(false);
	const [modalContent, setModalContent] = React.useState(null); // 'summary', 'quiz', or 'practice'
	const [activeVideoId, setActiveVideoId] = React.useState(null);
	const [currentUser, setCurrentUser] = React.useState(localStorage.getItem("currentUser") || null);
	const [fullscreen, setFullscreen] = React.useState(false);

	React.useEffect(() => {
		document.body.className = darkMode ? 'dark-mode' : '';
	}, [darkMode]);

	const handleLogin = (user) => {
		setCurrentUser(user);
	};

	const openModal = (contentType, videoId) => {
		setModalContent(contentType);
		setActiveVideoId(videoId);
	};

	const closeModal = () => {
		setModalContent(null);
		setActiveVideoId(null);
		setFullscreen(false);
	};

	const renderModalContent = () => {
		if (!modalContent) return null;

		switch (modalContent) {
			case 'summary':
				return <ReactSummary videoId={activeVideoId} />;
			case 'quiz':
				return <ReactQuestions videoId={activeVideoId} currentUser={currentUser} />;
			case 'practice':
				return <ReactPractice videoId={activeVideoId} currentUser={currentUser} />;
			default:
				return null;
		}
	};

	return (
		<div className="container">
			<div className="toggle-container">
				<span className="toggle-text">Dark Mode</span>
				<label className="switch">
					<input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
					<span className="slider"></span>
				</label>
			</div>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
				<div>
					<ReactAuth onLogin={handleLogin} />
				</div>
			</div>
			<header style={{ position: 'relative' }}>
				<h1>LearnSprint</h1>
			</header>
			<ReactVideo
				onSummarize={videoId => openModal('summary', videoId)}
				onQuiz={videoId => openModal('quiz', videoId)}
				onPractice={videoId => openModal('practice', videoId)}
			/>
			{modalContent && (
				<div className={`modal ${fullscreen ? 'fullscreen' : ''}`} style={{ display: 'block' }}>
					<div className="modal-content">
						<div className="modal-header">
							<div className="modal-header-left">
								<button className="fullscreen-btn" onClick={() => setFullscreen(!fullscreen)}>
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
										{fullscreen ? (
											<>
												<path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7"/>
											</>
										) : (
											<>
												<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
											</>
										)}
									</svg>
								</button>
							</div>
							<div className="modal-header-right">
								<span className="close" onClick={closeModal}>&times;</span>
							</div>
						</div>

						{fullscreen && (
							<div className="modal-nav">
								<button className={modalContent === 'summary' ? 'active' : ''} onClick={() => setModalContent('summary')}>Summary</button>
								<button className={modalContent === 'quiz' ? 'active' : ''} onClick={() => setModalContent('quiz')}>Quiz</button>
								<button className={modalContent === 'practice' ? 'active' : ''} onClick={() => setModalContent('practice')}>Practice</button>
							</div>
						)}
						
						<div className="modal-body">
							{renderModalContent()}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default App;
