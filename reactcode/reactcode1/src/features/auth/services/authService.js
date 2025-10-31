import axios from 'axios';
import { BACKEND_URL, API_ENDPOINTS } from '../../../config/constants';

export const authService = {
	async login(username, password) {
		const response = await axios.post(
			`${BACKEND_URL}${API_ENDPOINTS.AUTH.LOGIN}`,
			{ username, password }
		);
		return response.data;
	},

	async register(username, password) {
		const response = await axios.post(
			`${BACKEND_URL}${API_ENDPOINTS.AUTH.REGISTER}`,
			{ username, password }
		);
		return response.data;
	},

	getCurrentUser() {
		return localStorage.getItem("currentUser");
	},

	setCurrentUser(username) {
		localStorage.setItem("currentUser", username);
	},

	removeCurrentUser() {
		localStorage.removeItem("currentUser");
	}
};
