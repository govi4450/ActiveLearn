import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Lock, LogIn, UserPlus } from 'lucide-react';

function AuthModal({ isOpen, onClose, onSubmit, error }) {
	const [isLogin, setIsLogin] = useState(true);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [focusedField, setFocusedField] = useState(null);

	const handleSubmit = async (e) => {
		e.preventDefault();
		const success = await onSubmit(username, password, isLogin);
		if (success) {
			setUsername("");
			setPassword("");
			onClose();
		}
	};

	const toggleMode = () => {
		setIsLogin(!isLogin);
		setUsername("");
		setPassword("");
	};

	if (!isOpen) return null;

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9998]"
					/>

					{/* Modal */}
					<motion.div
						initial={{ opacity: 0, scale: 0.9, y: 50 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.9, y: 50 }}
						transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
						style={{
							position: 'fixed',
							top: '50%',
							left: '50%',
							transform: 'translate(-50%, -50%)',
							zIndex: 9999
						}}
						className="w-[90vw] max-w-md bg-white dark:bg-[#1a2332] rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-[#2a3442]"
					>
						{/* Header */}
						<div className="relative bg-gradient-to-br from-primary-500 via-purple-500 to-secondary-500 p-8 text-white">
							<motion.button
								whileHover={{ scale: 1.1, rotate: 90 }}
								whileTap={{ scale: 0.9 }}
								onClick={onClose}
								className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/20 transition-colors"
							>
								<X className="w-5 h-5" />
							</motion.button>
							
							<div className="flex items-center gap-3 mb-2">
								<div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
									{isLogin ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
								</div>
								<div>
									<h2 className="text-2xl font-bold">
										{isLogin ? "Welcome Back!" : "Create Account"}
									</h2>
									<p className="text-white/80 text-sm">
										{isLogin ? "Login to continue learning" : "Join LearnSprint today"}
									</p>
								</div>
							</div>
						</div>

						{/* Form */}
						<form onSubmit={handleSubmit} className="p-8 space-y-6">
							{/* Username Field */}
							<div className="space-y-2">
								<label 
									className={`text-sm font-medium transition-colors ${
										focusedField === 'username' 
											? 'text-primary-600 dark:text-[#22d3ee]' 
											: 'text-gray-700 dark:text-gray-300'
									}`}
								>
									Username
								</label>
								<div className="relative">
									<div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
										<User className="w-5 h-5" />
									</div>
									<input 
										type="text" 
										value={username} 
										onChange={e => setUsername(e.target.value)}
										onFocus={() => setFocusedField('username')}
										onBlur={() => setFocusedField(null)}
										placeholder="Enter your username"
										required
										className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-[#0f1629] border-2 border-gray-200 dark:border-[#2a3442] rounded-xl focus:outline-none focus:border-primary-500 dark:focus:border-[#22d3ee] transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
									/>
								</div>
							</div>

							{/* Password Field */}
							<div className="space-y-2">
								<label 
									className={`text-sm font-medium transition-colors ${
										focusedField === 'password' 
											? 'text-primary-600 dark:text-[#22d3ee]' 
											: 'text-gray-700 dark:text-gray-300'
									}`}
								>
									Password
								</label>
								<div className="relative">
									<div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
										<Lock className="w-5 h-5" />
									</div>
									<input 
										type="password" 
										value={password} 
										onChange={e => setPassword(e.target.value)}
										onFocus={() => setFocusedField('password')}
										onBlur={() => setFocusedField(null)}
										placeholder="Enter your password"
										required
										className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-[#0f1629] border-2 border-gray-200 dark:border-[#2a3442] rounded-xl focus:outline-none focus:border-primary-500 dark:focus:border-[#22d3ee] transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
									/>
								</div>
							</div>

							{/* Error Message */}
							{error && (
								<motion.div
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm"
								>
									{error}
								</motion.div>
							)}

							{/* Submit Button */}
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								type="submit"
								className="w-full py-3.5 bg-gradient-to-r from-primary-600 via-purple-600 to-secondary-600 hover:from-primary-700 hover:via-purple-700 hover:to-secondary-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
							>
								<Lock className="w-5 h-5" />
								<span>{isLogin ? "Login" : "Create Account"}</span>
							</motion.button>

							{/* Toggle Mode */}
							<div className="text-center">
								<button 
									type="button" 
									onClick={toggleMode}
									className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-[#22d3ee] transition-colors font-medium"
								>
									{isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
								</button>
							</div>
						</form>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}

export default AuthModal;
