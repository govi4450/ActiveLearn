const PracticeModule = {
  async startPracticeMode(videoId) {
    console.log("Practice button clicked for video:", videoId);
    const questionList = document.getElementById(`questions-${videoId}`);
    const quizContainer = document.getElementById(`quiz-container-${videoId}`);
    questionList.style.display = "none";
    quizContainer.style.display = "block";
    quizContainer.innerHTML = `<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading practice questions...</div>`;

    try {
      // Fetch questions (same as quiz)
      const username = AuthModule.currentUser;
      const response = await fetch(`${backendUrl}api/generate_questions?video_id=${videoId}${username ? `&username=${username}` : ''}`);
      const data = await response.json();

      if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error("No questions available for practice");
      }

      // Render questions for practice
      quizContainer.innerHTML = `
        <form id="practice-form-${videoId}">
          ${data.questions.map((q, idx) => `
            <div class="quiz-question" data-correct="${q.correctAnswer}" data-explanation="${q.explanation || ''}" data-id="${q._id || q.id}">
              <div class="question-header">
                <span class="difficulty ${q.difficulty?.toLowerCase() || ''}">${q.difficulty || 'Question'}</span>
                <span class="question-type">${typeof q.type === 'string' ? q.type.toUpperCase() : 'Q'}</span>
              </div>
              <p class="question-text">${q.question}</p>
              ${this.renderPracticeInput(q, idx)}
              <div class="answer-feedback" style="display:none"></div>
            </div>
          `).join('')}
          <button type="submit" class="submit-btn">Submit Answers</button>
          <div id="quiz-score-${videoId}" class="quiz-score"></div>
          <button type="button" class="close-btn" onclick="this.closeQuizMode('${videoId}')">Close Practice</button>
        </form>
      `;

      // Attach submit handler
      document.getElementById(`practice-form-${videoId}`).onsubmit = (e) => {
        e.preventDefault();
        this.submitAllAnswers(videoId, data.questions);
      };
    } catch (error) {
      quizContainer.innerHTML = `<div class="error"><i class="fas fa-exclamation-circle"></i> ${error.message}</div>`;
    }
  },


  
  renderPracticeInput(question, index) {
    console.log(`Practice: Rendering input for question type: ${question.type}`);
    
    if (question.type === 'mcq' && question.options && question.options.length > 0) {
      return `
        <div class="options-container">
          ${question.options.map((opt, optIndex) => `
            <label class="quiz-option">
              <input type="radio" name="pq${index}" value="${opt.replace('[correct]', '').trim()}">
              <span class="option-letter">${String.fromCharCode(97 + optIndex)})</span>
              ${opt.replace('[correct]', '').trim()}
            </label>
          `).join('')}
        </div>
      `;
    } else if (question.type === 'true_false') {
      return `
        <div class="options-container">
          <label class="quiz-option">
            <input type="radio" name="pq${index}" value="True">
            <span class="option-letter">True</span>
          </label>
          <label class="quiz-option">
            <input type="radio" name="pq${index}" value="False">
            <span class="option-letter">False</span>
          </label>
        </div>
      `;
    } else if (question.type === 'short_answer') {
      return `<input type="text" class="quiz-input" placeholder="Type your answer here...">`;
    }
    
    return `<input type="text" class="quiz-input" placeholder="Type your answer...">`;
  },




  async submitAllAnswers(videoId, questionsData) {
    console.log("submitAllAnswers called", videoId, questionsData);
    const quizContainer = document.getElementById(`quiz-container-${videoId}`);
    const questions = quizContainer.querySelectorAll(".quiz-question");
    let correctCount = 0;

    // Validate all questions are answered
    let allAnswered = true;
    questions.forEach(question => {
      const hasAnswer =
        question.querySelector("input[type='radio']:checked") ||
        (question.querySelector(".quiz-select") && question.querySelector(".quiz-select").value) ||
        (question.querySelector(".quiz-input") && question.querySelector(".quiz-input").value.trim());
      if (!hasAnswer) allAnswered = false;
    });

    if (!allAnswered) {
      AuthModule.showNotification("Please answer all questions before submitting", true);
      return;
    }

    for (let idx = 0; idx < questions.length; idx++) {
      const question = questions[idx];
      const qData = questionsData[idx];
      const correctAnswer = question.dataset.correct;
      let userAnswer = "";

      if (question.querySelector("input[type='radio']:checked")) {
        userAnswer = question.querySelector("input[type='radio']:checked").value;
      } else if (question.querySelector(".quiz-select")) {
        userAnswer = question.querySelector(".quiz-select").value;
      } else if (question.querySelector(".quiz-input")) {
        userAnswer = question.querySelector(".quiz-input").value;
      }

      const isCorrect = this.checkAnswerCorrectness(userAnswer, correctAnswer);
      if (isCorrect) correctCount++;
      
      console.log("currentUser:", AuthModule.currentUser);
      console.log("About to save response for:", qData._id || qData.id, userAnswer);
      
      // Save response to backend
      if (AuthModule.currentUser) {
        try {
          const response = await fetch(`${backendUrl}api/save_response`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: AuthModule.currentUser,
              video_id: videoId,
              question_id: qData._id || qData.id,
              user_answer: userAnswer
            })
          });
          
          const result = await response.json();
          if (!result.success) {
            console.error("Failed to save response:", result.error);
          } else {
            console.log("Saved response for:", qData._id || qData.id);
          }
        } catch (error) {
          console.error("Network error saving response:", error);
        }
      } else {
        console.warn("currentUser is not set! Response not saved.");
      }

      // Show feedback
      const feedbackDiv = question.querySelector(".answer-feedback");
      feedbackDiv.innerHTML = `
        <div class="feedback ${isCorrect ? 'correct' : 'incorrect'}">
          <i class="fas fa-${isCorrect ? 'check' : 'times'}"></i>
          ${isCorrect ? 'Correct!' : 'Incorrect!'}
        </div>
        <div class="correct-answer">
          <strong>Correct Answer:</strong> ${correctAnswer}
        </div>
        ${question.dataset.explanation ? `
          <div class="explanation">
            <strong>Explanation:</strong> ${question.dataset.explanation}
          </div>
        ` : ''}
      `;
      feedbackDiv.style.display = "block";
      question.querySelectorAll("input, select").forEach(el => el.disabled = true);
    }

    // Update score
    const scoreElement = document.getElementById(`quiz-score-${videoId}`);
    scoreElement.textContent = `Score: ${correctCount}/${questions.length}`;
    scoreElement.style.color = correctCount / questions.length >= 0.7 ? "#00b894" : "#d63031";

    AuthModule.showNotification(`Practice completed! Score: ${correctCount}/${questions.length}`, false);

    // Get and display final score from backend if user is logged in
    if (AuthModule.currentUser) {
      try {
        const response = await fetch(`${backendUrl}api/progress?video_id=${videoId}&username=${AuthModule.currentUser}`);
        const data = await response.json();
        
        if (data.success && data.progress) {
          scoreElement.innerHTML += `<br>Final Score: ${data.progress.score.correct}/${data.progress.score.total} (${data.progress.score.percentage}%)`;
        }
      } catch (error) {
        console.error("Failed to fetch final score:", error);
      }
    }
  },

  checkAnswerCorrectness(userAnswer, correctAnswer) {
    if (!userAnswer) return false;

    const normalize = str => str.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\b(a|an|the)\b/g, '')
      .trim();

    const normalizedUser = normalize(userAnswer);
    const normalizedCorrect = normalize(correctAnswer);

    // Exact match
    if (normalizedUser === normalizedCorrect) return true;

    // Partial match
    if (normalizedUser.includes(normalizedCorrect) || normalizedCorrect.includes(normalizedUser)) return true;

    // Special cases for true/false
    const trueVariants = ["true", "correct", "yes", "right"];
    const falseVariants = ["false", "incorrect", "no", "wrong"];

    if (trueVariants.includes(normalizedUser) && trueVariants.includes(normalizedCorrect)) return true;
    if (falseVariants.includes(normalizedUser) && falseVariants.includes(normalizedCorrect)) return true;

    return false;
  },

  closeQuizMode(videoId) {
    document.getElementById(`quiz-container-${videoId}`).style.display = "none";
    document.getElementById(`questions-${videoId}`).style.display = "block";
  }
};

// Add closeQuizMode to global scope for onclick handlers
window.closeQuizMode = PracticeModule.closeQuizMode.bind(PracticeModule);