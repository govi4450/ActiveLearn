import React from 'react';
import { motion } from 'framer-motion';
import './Reactstyle.css';

// Components
import DarkModeToggle from './components/DarkModeToggle';
import Modal from './components/Modal';

// Features
import AuthButton from './features/auth/components/AuthButton';
import VideoContainer from './features/videos/components/VideoContainer';
import SummaryContainer from './features/summary/components/SummaryContainer';
import QuizContainer from './features/quiz/components/QuizContainer';
import PracticeContainer from './features/practice/components/PracticeContainer';
import MindMapContainer from './features/videos/components/MindMapContainer';
import Dashboard from './features/dashboard/components/Dashboard';

function App() {
	const [darkMode, setDarkMode] = React.useState(false);
	const [modalContent, setModalContent] = React.useState(null); // 'summary', 'quiz', 'practice', or 'mindmap'
	const [activeVideoId, setActiveVideoId] = React.useState(null);
	const [currentUser, setCurrentUser] = React.useState(localStorage.getItem("currentUser") || null);
	const [fullscreen, setFullscreen] = React.useState(false);
	const [showDashboard, setShowDashboard] = React.useState(false);

	React.useEffect(() => {
		document.body.className = darkMode ? 'dark-mode' : '';
	}, [darkMode]);

	const handleLogin = (user) => {
		setCurrentUser(user);
		// Store join date if not already stored
		if (!localStorage.getItem('userJoinDate')) {
			localStorage.setItem('userJoinDate', new Date().toISOString());
		}
	};

	const handleLogout = () => {
		setCurrentUser(null);
		localStorage.removeItem('currentUser');
		setShowDashboard(false);
	};

	const toggleDashboard = () => {
		if (!currentUser) {
			alert('Please login to access the dashboard');
			return;
		}
		setShowDashboard(!showDashboard);
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
				return <SummaryContainer videoId={activeVideoId} />;
				case 'player':
					return (
						<div className="w-full h-full flex items-center justify-center bg-black">
							<iframe
								title="video-player"
								src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&rel=0`}
								className="w-full h-[70vh] max-w-4xl rounded-2xl"
								frameBorder="0"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowFullScreen
							/>
						</div>
					);
				case 'notes':
					return (
						<div className="p-6 max-w-3xl w-full">
							<h2 className="text-xl font-semibold mb-4">Notes for video</h2>
							<p className="text-sm text-gray-500 mb-4">Video ID: {activeVideoId}</p>
							<textarea className="w-full h-56 p-3 rounded-lg bg-gray-900 text-white" placeholder="Write your notes here..." />
						</div>
					);
			case 'quiz':
				return <QuizContainer videoId={activeVideoId} currentUser={currentUser} />;
			case 'practice':
				return <PracticeContainer videoId={activeVideoId} currentUser={currentUser} />;
			case 'mindmap':
				return <div style={{ maxWidth: 900, margin: '0 auto' }}><h2 className="text-xl font-semibold mb-4">Mind Map</h2><div className="bg-[#0f1724] rounded-2xl overflow-hidden"><MindMapContainer videoId={activeVideoId} /></div></div>;
			default:
				return null;
		}
	};

		return (
		<div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-[#0a0e27]' : 'bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30'}`}>
			{/* Top Navbar */}
			<nav className={`sticky top-0 z-40 backdrop-blur-lg border-b transition-colors ${darkMode ? 'bg-[#0f1629]/95 border-[#1a2332]' : 'bg-gradient-to-r from-white via-pink-50/50 to-white border-pink-100'}`}>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						{/* Logo */}
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
								<span className="text-white font-bold text-xl">LS</span>
							</div>
							<span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
								LearnSprint
							</span>
						</div>

						{/* Right Side */}
						<div className="flex items-center gap-6">
							{currentUser && (
								<span className="text-sm text-gray-600 dark:text-gray-400 hidden md:block">
									{/* Show profile name instead of the literal 'Welcome' text.
										currentUser may be a string (username) or an object { username } depending on auth flow. */}
									<span className="font-semibold text-gray-900 dark:text-white">
										{typeof currentUser === 'string' ? currentUser : currentUser?.username}
									</span>
								</span>
							)}
							{currentUser && !showDashboard && (
								<motion.button
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.9 }}
									onClick={toggleDashboard}
									className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
									title="Dashboard"
								>
									<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
									</svg>
								</motion.button>
							)}
							<DarkModeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
							<AuthButton onLogin={handleLogin} />
						</div>
					</div>
				</div>
			</nav>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				
				{showDashboard ? (
					<Dashboard 
						currentUser={currentUser}
						onLogout={handleLogout}
						onNavigateToVideos={() => setShowDashboard(false)}
					/>
				) : (
					<>
						{/* Hero Section */}
						<motion.section 
							initial={{ opacity: 0, y: -30 }}
							animate={{ opacity: 1, y: 0 }}
							className={`text-center py-16 mb-12 transition-colors ${darkMode ? '' : 'bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50 rounded-3xl border border-pink-100'}`}
						>
							<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 px-4">
								<span className={darkMode ? 'text-white' : 'text-gray-900'}>Transform Videos Into</span>
								<br />
								<span className={darkMode ? 'text-[#22d3ee]' : 'bg-gradient-to-r from-primary-600 via-purple-600 to-secondary-600 bg-clip-text text-transparent'}>
									Interactive Learning
								</span>
							</h1>
							<p className={`text-base md:text-lg max-w-3xl mx-auto px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
								AI-powered summaries, quizzes, and insights from any video content
							</p>
						</motion.section>

						{/* Video Container */}
						<VideoContainer
							onSummarize={videoId => openModal('summary', videoId)}
							onQuiz={videoId => openModal('quiz', videoId)}
							onPractice={videoId => openModal('practice', videoId)}
							onMindMap={videoId => openModal('mindmap', videoId)}
							onPlay={videoId => openModal('player', videoId)}
							onNotes={videoId => openModal('notes', videoId)}
							currentUser={currentUser}
						/>
						
						<Modal
							isOpen={!!modalContent}
							onClose={closeModal}
							fullscreen={fullscreen}
							onToggleFullscreen={() => setFullscreen(!fullscreen)}
							showNav={true}
							activeTab={modalContent}
							onTabChange={setModalContent}
						>
							{renderModalContent()}
						</Modal>
					</>
				)}
			</div>
		</div>
	);
}

export default App;
