import React, { useState, useEffect } from 'react';

function QuestionItem({ question, onAnswerChange, selectedAnswer }) {
    const renderOptions = () => {
        // Handle different question types
        if (
            question.type === 'multiple-choice' ||
            question.type === 'MCQ' ||
            question.type === 'mcq'
        ) {
            // If options array exists, use it
            if (question.options && Array.isArray(question.options) && question.options.length > 0) {
                return (
                    <div className="question-input-area">
                        {question.options.map((option, index) => (
                            <button
                                key={index}
                                className={`question-option ${selectedAnswer === option ? 'selected' : ''}`}
                                onClick={() => onAnswerChange(question._id, option)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                );
            }
            
            // For MCQ questions without options, create default options
            return (
                <div className="question-input-area">
                    <button
                        className={`question-option ${selectedAnswer === 'Option A' ? 'selected' : ''}`}
                        onClick={() => onAnswerChange(question._id, 'Option A')}
                    >
                        A
                    </button>
                    <button
                        className={`question-option ${selectedAnswer === 'Option B' ? 'selected' : ''}`}
                        onClick={() => onAnswerChange(question._id, 'Option B')}
                    >
                        B
                    </button>
                    <button
                        className={`question-option ${selectedAnswer === 'Option C' ? 'selected' : ''}`}
                        onClick={() => onAnswerChange(question._id, 'Option C')}
                    >
                        C
                    </button>
                    <button
                        className={`question-option ${selectedAnswer === 'Option D' ? 'selected' : ''}`}
                        onClick={() => onAnswerChange(question._id, 'Option D')}
                    >
                        D
                    </button>
                </div>
            );
        }
        
        if (question.type === 'true-false' || question.type === 'true_false') {
            return (
                <div className="question-input-area">
                    <button
                        className={`question-option ${selectedAnswer === 'True' ? 'selected' : ''}`}
                        onClick={() => onAnswerChange(question._id, 'True')}
                    >
                        True
                    </button>
                    <button
                        className={`question-option ${selectedAnswer === 'False' ? 'selected' : ''}`}
                        onClick={() => onAnswerChange(question._id, 'False')}
                    >
                        False
                    </button>
                </div>
            );
        }
        
        if (question.type === 'fill-in-the-blank') {
            return (
                <div className="question-input-area">
                    <input
                        type="text"
                        className="question-input"
                        placeholder="Enter your answer..."
                        value={selectedAnswer || ''}
                        onChange={(e) => onAnswerChange(question._id, e.target.value)}
                    />
                </div>
            );
        }
        
        if (question.type === 'short-answer' || question.type === 'short_answer') {
            return (
                <div className="question-input-area">
                    <textarea
                        className="question-input"
                        placeholder="Enter your answer..."
                        value={selectedAnswer || ''}
                        onChange={(e) => onAnswerChange(question._id, e.target.value)}
                        rows={3}
                    />
                </div>
            );
        }
        
        // Default case - treat as short answer
        return (
            <div className="question-input-area">
                <textarea
                    className="question-input"
                    placeholder="Enter your answer..."
                    value={selectedAnswer || ''}
                    onChange={(e) => onAnswerChange(question._id, e.target.value)}
                    rows={3}
                />
            </div>
        );
    };

    return (
        <li className="question-item">
            <div className="question-card">
                <div className="question-header">
                    <span className={`difficulty ${question.difficulty?.toLowerCase() || ''}`}>{question.difficulty || 'Question'}</span>
                    <span className="question-type">{typeof question.type === 'string' ? question.type.toUpperCase() : 'Q'}</span>
                </div>
                <p className="question-text">{question.question}</p>
                {renderOptions()}
            </div>
        </li>
    );
}

function ReactQuestions({ videoId, currentUser }) {
    const [questions, setQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [score, setScore] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true);
            setError("");
            setQuestions([]);
            setUserAnswers({});
            setScore(null);
            try {
                const params = new URLSearchParams({ video_id: videoId, mode: 'quiz' });
                if (currentUser) params.append('username', currentUser);
                const res = await fetch(`/api/generate_questions?${params.toString()}`);
                const data = await res.json();
                if (!res.ok || !data.success) {
                    throw new Error(data.error || 'Failed to load questions');
                }
                const questions = data.questions.map(q => {
                    switch (q.type) {
                        case 'mcq':
                            return {
                                ...q,
                                options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
                                answer: q.correctAnswer || q.answer
                            };
                        case 'true_false':
                            return {
                                ...q,
                                options: ['True', 'False'],
                                answer: q.correctAnswer || q.answer
                            };
                        case 'short_answer':
                            return {
                                ...q,
                                answer: q.correctAnswer || q.answer
                            };
                        default:
                            throw new Error(`Unsupported question type: ${q.type}`);
                    }
                });
                setQuestions(questions);
            } catch (err) {
                setError(err.message || 'Something went wrong fetching questions');
            } finally {
                setLoading(false);
            }
        };

        if (videoId) fetchQuestions();
    }, [videoId, currentUser]);

    const handleAnswerChange = (questionId, answer) => {
        setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleSubmit = () => {
        // Check if user has answered at least one question
        const answeredQuestions = Object.keys(userAnswers).length;
        if (answeredQuestions === 0) {
            alert('Please answer at least one question before submitting!');
            return;
        }

        let correctAnswers = 0;
        let totalAnswered = 0;
        questions.forEach(q => {
            if (userAnswers[q._id]) {
                totalAnswered++;
                // Compare against correctAnswer from backend
                if (userAnswers[q._id] === (q.correctAnswer || q.answer)) {
                    correctAnswers++;
                }
            }
        });
        setScore(`${correctAnswers} / ${totalAnswered}`);
    };

	return (
		<div className="questions-module">
			{loading && <div className="loading">Generating questions...</div>}
			{error && <div className="error">{error}</div>}
			{!loading && !error && questions.length > 0 && (
                <>
                    <ul className="question-list">
                        {questions.map((q, idx) => (
                            <QuestionItem 
                                key={q._id || idx} 
                                question={q} 
                                onAnswerChange={handleAnswerChange}
                                selectedAnswer={userAnswers[q._id]}
                            />
                        ))}
                    </ul>
                    <button className="submit-btn" onClick={handleSubmit}>Submit Quiz</button>
                    {score !== null && <div className="quiz-score">Your score: {score}</div>}
                </>
			)}
		</div>
	);
}

export default ReactQuestions;
