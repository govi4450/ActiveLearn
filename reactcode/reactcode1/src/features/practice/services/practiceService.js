import { API_ENDPOINTS } from '../../../config/constants';

export const practiceService = {
	async fetchQuestions(videoId, currentUser, videoTitle = '') {
		const params = new URLSearchParams({ 
			video_id: videoId, 
			mode: 'practice',
			video_title: videoTitle,
			video_thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
		});
		if (currentUser) params.append('username', currentUser);
		
		const res = await fetch(`${API_ENDPOINTS.QUESTIONS}?${params.toString()}`);
		const data = await res.json();
		
		if (!res.ok || !data.success) {
			throw new Error(data.error || 'Failed to load questions');
		}
		
		return data.questions;
	},

	normalizeQuestions(questions) {
		return questions.map(q => ({
			...q,
			answer: q.correctAnswer || q.answer
		}));
	}
};
