import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';

function AuthButton({ onLogin }) {
	const [showModal, setShowModal] = useState(false);
	const { currentUser, error, login, register, logout } = useAuth(onLogin);

	const openModal = () => setShowModal(true);
	const closeModal = () => setShowModal(false);

	const handleSubmit = async (username, password, isLogin) => {
		if (isLogin) {
			return await login(username, password);
		} else {
			return await register(username, password);
		}
	};

	return (
		<>
			{!currentUser ? (
				<motion.button
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.9 }}
					onClick={openModal}
					className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
					title="Login"
				>
					<LogIn className="w-6 h-6" />
				</motion.button>
			) : (
				<motion.button
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.9 }}
					onClick={logout}
					className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
					title="Logout"
				>
					<LogOut className="w-6 h-6" />
				</motion.button>
			)}
			<AuthModal 
				isOpen={showModal}
				onClose={closeModal}
				onSubmit={handleSubmit}
				error={error}
			/>
		</>
	);
}

export default AuthButton;
