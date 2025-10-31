import React, { useState } from 'react';

function PracticeQuestionItem({ question, onAnswerChange, selectedAnswer }) {
	const [showAnswer, setShowAnswer] = useState(false);

	const renderOptions = () => {
		// Handle different question types
		if (question.type === 'multiple-choice' || question.type === 'MCQ' || question.type === 'mcq') {
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
		<div className="quiz-question" key={question._id || question.id}>
			<div className="question-header">
				<span className={`difficulty ${question.difficulty?.toLowerCase() || ''}`}>
					{question.difficulty || 'Question'}
				</span>
				<span className="question-type">
					{typeof question.type === 'string' ? question.type.toUpperCase() : 'Q'}
				</span>
			</div>
			<p className="question-text">{question.question}</p>
			{renderOptions()}
			<button className="show-answer-btn" onClick={() => setShowAnswer(!showAnswer)}>
				{showAnswer ? 'Hide' : 'Show'} Answer
			</button>
			{showAnswer && (
				<div className="answer-container">
					<p className="correct-answer">Correct Answer: {question.correctAnswer || question.answer}</p>
					{question.explanation && <p className="explanation">{question.explanation}</p>}
				</div>
			)}
		</div>
	);
}

export default PracticeQuestionItem;
