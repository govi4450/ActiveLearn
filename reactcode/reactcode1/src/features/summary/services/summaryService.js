import axios from 'axios';
import { BACKEND_URL, API_ENDPOINTS } from '../../../config/constants';

export const summaryService = {
	async fetchSummary(videoId) {
		const response = await axios.get(`${BACKEND_URL}${API_ENDPOINTS.SUMMARY}`, {
			params: { video_id: videoId }
		});
		return response.data;
	}
};
