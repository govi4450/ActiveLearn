import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Grid3x3, List } from 'lucide-react';

function VideoSearch({ searchQuery, setSearchQuery, onSearch, activeFilter, setActiveFilter, durationFilter, setDurationFilter, viewMode, setViewMode }) {
	// activeFilter: 'all' or 'duration' (visual)
	// durationFilter: 'any' | 'short' | 'medium' | 'long'

	const handleKeyPress = (e) => {
		if (e.key === "Enter") {
			onSearch();
		}
	};

	// We removed the category & duration filters per request — only the view toggle remains.

	return (
		<motion.div 
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			className="mb-8"
		>
			{/* Search Bar */}
			<div className="relative mb-6">
				<div className="relative flex items-center bg-[#1a2332] dark:bg-[#1a2332] backdrop-blur-sm rounded-2xl border border-[#2a3442] pr-2">
					{/* Search Input */}
					<input
						id="searchQuery"
						type="text"
						value={searchQuery}
						onChange={e => setSearchQuery(e.target.value)}
						onKeyPress={handleKeyPress}
						placeholder="Search for topics..."
						className="w-full px-6 py-4 bg-transparent border-none focus:outline-none text-white placeholder:text-gray-500 text-base rounded-2xl pr-36"
					/>

					{/* Search Button - Positioned inside the input on the right and styled teal to match filters */}
					<motion.div
						className="absolute right-2 inset-y-0 flex items-center"
						initial={false}
						animate={searchQuery ? { x: 0 } : { x: 0 }}
					>
						<motion.button
							whileHover={{ scale: 1.03 }}
							whileTap={{ scale: 0.97 }}
							onClick={onSearch}
							className="h-11 px-5 bg-[#22d3ee] hover:bg-[#1fbfda] text-white font-semibold rounded-xl shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
							aria-label="Search"
						>
							<Sparkles className="w-4 h-4" />
							<span>Search</span>
						</motion.button>
					</motion.div>
				</div>
			</div>
			
			{/* Search Suggestions */}
			<div className="flex items-center justify-center gap-3 mb-6">
				<span className="text-sm text-gray-500">Try:</span>
				{['Machine Learning', 'React Tutorial', 'Python Basics'].map((hint) => (
					<motion.button
						key={hint}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={() => {
							setSearchQuery(hint);
							onSearch();
						}}
						className="px-4 py-2 bg-[#1a2332] text-gray-300 rounded-lg hover:bg-[#2a3442] transition-colors text-sm font-medium border border-[#2a3442]"
					>
						{hint}
					</motion.button>
				))}
			</div>

			{/* View Toggle (moved slightly up to keep visual balance after removing filters) */}
			<div className="flex items-center justify-end">
				<div className="flex items-center gap-2 bg-[#1a2332] rounded-lg p-1 border border-[#2a3442] -mt-2 transform -translate-y-1">
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={() => setViewMode && setViewMode('grid')}
						className={`p-2 rounded-lg transition-all ${
							viewMode === 'grid'
								? 'bg-[#2a3442] text-white'
								: 'text-gray-400 hover:text-gray-200'
						}`}
						title="Grid View"
					>
						<Grid3x3 className="w-5 h-5" />
					</motion.button>
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={() => setViewMode && setViewMode('list')}
						className={`p-2 rounded-lg transition-all ${
							viewMode === 'list'
								? 'bg-[#2a3442] text-white'
								: 'text-gray-400 hover:text-gray-200'
						}`}
						title="List View"
					>
						<List className="w-5 h-5" />
					</motion.button>
				</div>
			</div>
		</motion.div>
	);
}

export default VideoSearch;
