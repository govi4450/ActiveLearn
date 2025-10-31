import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2 } from 'lucide-react';

function Modal({ isOpen, onClose, children, fullscreen, onToggleFullscreen, showNav, activeTab, onTabChange }) {
	const tabs = [
		{ id: 'summary', label: 'Summary', icon: '📝' },
		{ id: 'quiz', label: 'Quiz', icon: '🧠' },
		{ id: 'practice', label: 'Practice', icon: '🎯' },
		{ id: 'mindmap', label: 'Mind Map', icon: '🗺️' }
	];

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop with blur */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9998]"
					/>

					{/* Modal Container (centering wrapper) */}
					<div className={`fixed inset-0 z-[9999] ${fullscreen ? '' : 'flex items-center justify-center'} pointer-events-none`}>
						{/* Modal Content */}
						<motion.div
							initial={{ opacity: 0, scale: 0.9, y: 50 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.9, y: 50 }}
							transition={{ type: 'spring', duration: 0.4, bounce: 0.3 }}
							onClick={(e) => e.stopPropagation()}
							className={`${
								fullscreen 
									? 'w-full h-full rounded-none' 
									: 'w-[90vw] max-w-5xl max-h-[85vh]'
							} bg-white dark:bg-[#1a2332] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 dark:border-[#2a3442] pointer-events-auto`}
						>
						{/* Header */}
						<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#2a3442] bg-gradient-to-r from-white to-gray-50 dark:from-[#0f1629] dark:to-[#1a2332]">
							<div className="flex items-center gap-3">
								<motion.button
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.9 }}
									onClick={onToggleFullscreen}
									className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
								>
									{fullscreen ? (
										<Minimize2 className="w-5 h-5" />
									) : (
										<Maximize2 className="w-5 h-5" />
									)}
								</motion.button>
								<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
									{tabs.find(t => t.id === activeTab)?.icon} {tabs.find(t => t.id === activeTab)?.label}
								</h2>
							</div>
							<motion.button
								whileHover={{ scale: 1.1, rotate: 90 }}
								whileTap={{ scale: 0.9 }}
								onClick={onClose}
								className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
							>
								<X className="w-5 h-5" />
							</motion.button>
						</div>

						{/* Navigation Tabs */}
						{showNav && (
							<div className="flex items-center gap-2 px-6 py-4 bg-gray-50 dark:bg-[#0f1629] border-b border-gray-200 dark:border-[#2a3442] overflow-x-auto">
								{tabs.map((tab) => (
									<motion.button
										key={tab.id}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										onClick={() => onTabChange(tab.id)}
										className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
											activeTab === tab.id
												? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-medium'
												: 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
										}`}
									>
										<span className="mr-2">{tab.icon}</span>
										{tab.label}
									</motion.button>
								))}
							</div>
						)}

						{/* Modal Body */}
						<div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-white to-gray-50 dark:from-[#1a2332] dark:to-[#0f1629]">
							{children}
						</div>
					</motion.div>
				</div>
			</>
		)}
	</AnimatePresence>
);
}

export default Modal;
