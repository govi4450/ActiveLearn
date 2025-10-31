// API Configuration
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:3000';
export const YOUTUBE_API_KEY = "AIzaSyCS4t0eaxZnhfV80u-X15incPyzHt_b2As";

// Trusted article sources
export const TRUSTED_SOURCES = [
	"wikipedia.org", "khanacademy.org", "britannica.com", "edu.gov",
	"academia.edu", "scholar.google.com", "coursera.org", "edx.org",
	"mit.edu", "harvard.edu", "stanford.edu", "tutorialspoint.com",
	"geeksforgeeks.org", "towardsdatascience.com", "medium.com/education",
	"arxiv.org", "ted.com", "youtube.com", "smithsonianmag.com"
];

// Question types
export const QUESTION_TYPES = {
	MCQ: 'mcq',
	TRUE_FALSE: 'true_false',
	SHORT_ANSWER: 'short_answer',
	FILL_IN_BLANK: 'fill-in-the-blank',
	MULTIPLE_CHOICE: 'multiple-choice'
};

// API Endpoints
export const API_ENDPOINTS = {
	AUTH: {
		LOGIN: '/api/auth/login',
		REGISTER: '/api/auth/register'
	},
	SUMMARY: '/api/summarize',
	QUESTIONS: '/api/generate_questions',
	SAVE_RESPONSE: '/api/save_response',
	ARTICLES: '/api/articles'
};
