import React from 'react';

function VideoCardSkeleton() {
	return (
		<div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-soft animate-pulse">
			{/* Thumbnail Skeleton */}
			<div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600" />
			
			{/* Content Skeleton */}
			<div className="p-5">
				{/* Channel Info Skeleton */}
				<div className="flex items-start gap-3 mb-3">
					<div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600" />
					<div className="flex-1 space-y-2">
						<div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
						<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
					</div>
				</div>

				{/* Metadata Skeleton */}
				<div className="flex items-center gap-4 mb-4">
					<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
					<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
					<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12" />
				</div>

				{/* Action Buttons Skeleton */}
				<div className="grid grid-cols-3 gap-2">
					{[1, 2, 3, 4, 5].map((i) => (
						<div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />
					))}
				</div>
			</div>
		</div>
	);
}

export default VideoCardSkeleton;
