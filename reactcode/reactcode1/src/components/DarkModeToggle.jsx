import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

function DarkModeToggle({ darkMode, setDarkMode }) {
	return (
		<motion.button
			whileHover={{ scale: 1.1 }}
			whileTap={{ scale: 0.9 }}
			onClick={() => setDarkMode(!darkMode)}
			className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
			title={darkMode ? "Light Mode" : "Dark Mode"}
		>
			{/* Icon Container */}
			<div className="relative flex items-center justify-center w-6 h-6">
				<motion.div
					initial={false}
					animate={{
						scale: darkMode ? 0 : 1,
						rotate: darkMode ? 180 : 0,
						opacity: darkMode ? 0 : 1
					}}
					transition={{ duration: 0.3 }}
					className="absolute"
				>
					<Sun className="w-6 h-6 text-gray-600 dark:text-gray-400" />
				</motion.div>
				<motion.div
					initial={false}
					animate={{
						scale: darkMode ? 1 : 0,
						rotate: darkMode ? 0 : -180,
						opacity: darkMode ? 1 : 0
					}}
					transition={{ duration: 0.3 }}
					className="absolute"
				>
					<Moon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
				</motion.div>
			</div>
		</motion.button>
	);
}

export default DarkModeToggle;
