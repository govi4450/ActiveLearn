import { useState } from 'react';
import { authService } from '../services/authService';

export function useAuth(onLogin) {
	const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const login = async (username, password) => {
		setLoading(true);
		setError("");
		try {
			await authService.login(username, password);
			authService.setCurrentUser(username);
			setCurrentUser(username);
			if (onLogin) onLogin(username);
			return true;
		} catch (err) {
			setError(err.response?.data?.error || "Login failed");
			return false;
		} finally {
			setLoading(false);
		}
	};

	const register = async (username, password) => {
		setLoading(true);
		setError("");
		try {
			await authService.register(username, password);
			authService.setCurrentUser(username);
			setCurrentUser(username);
			if (onLogin) onLogin(username);
			return true;
		} catch (err) {
			setError(err.response?.data?.error || "Registration failed");
			return false;
		} finally {
			setLoading(false);
		}
	};

	const logout = () => {
		authService.removeCurrentUser();
		setCurrentUser(null);
		if (onLogin) onLogin(null);
	};

	return {
		currentUser,
		error,
		loading,
		login,
		register,
		logout
	};
}
