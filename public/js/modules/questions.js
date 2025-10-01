const QuestionModule = {
  async generateQuestions(videoId, button) {
    const questionList = document.getElementById(`questions-${videoId}`);
    questionList.innerHTML = `<li class="loading"><i class="fas fa-spinner fa-spin"></i> Generating questions...</li>`;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Working...';

    try {
      const username = AuthModule.currentUser;
      const response = await fetch(`${backendUrl}api/generate_questions?video_id=${videoId}${username ? `&username=${username}` : ''}`);
      const data = await response.json();
      
      console.log("API Response:", data);
      
      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error("Invalid questions data format");
      }

      // Debug: Check question types
      console.log("Question types received:", data.questions.map(q => ({ type: q.type, id: q.id })));

      const validQuestions = data.questions.filter(q => {
        return q && q.question && typeof q.question === 'string' && q.type;
      });

      if (validQuestions.length === 0) {
        throw new Error("No valid questions generated");
      }

      this.renderQuestions(questionList, validQuestions);
    } catch (error) {
      console.error("Question generation failed:", error);
      questionList.innerHTML = `
        <li class="error">
          <i class="fas fa-exclamation-circle"></i> ${error.message || "Failed to generate questions"}
        </li>
      `;
    } finally {
      button.disabled = false;
      button.innerHTML = '<i class="fas fa-question-circle"></i> Quiz';
    }
  },

  renderQuestions(container, questions) {
    if (!questions || !Array.isArray(questions)) {
      console.error("Invalid questions data:", questions);
      container.innerHTML = `<li class="error">No questions available</li>`;
      return;
    }

    container.innerHTML = "";
    
    questions.forEach((q, index) => {
      if (!q || !q.question || !q.type) {
        console.warn("Skipping invalid question:", q);
        return;
      }

      const li = document.createElement("li");
      li.className = "question-item";
      li.dataset.question = JSON.stringify(q);

      // Debug: Log each question's type
      console.log(`Rendering question ${index + 1}: type = ${q.type}, id = ${q.id}`);

      li.innerHTML = `
        <div class="question-card">
          <div class="question-header">
            <span class="difficulty ${q.difficulty?.toLowerCase() || ''}">
              ${q.difficulty || 'Question'}
            </span>
            <span class="question-type">
              ${q.type.toUpperCase()}
            </span>
          </div>
          <p class="question-text">${q.question}</p>
          ${this.renderQuestionInput(q, index)}
          <button class="show-answer-btn" onclick="QuestionModule.revealAnswer(this)">
            <i class="fas fa-lightbulb"></i> Show Answer
          </button>
          <div class="answer-container" style="display:none">
            <p class="correct-answer"><strong>Answer:</strong> ${q.correctAnswer || 'Not available'}</p>
            ${q.explanation ? `<p class="explanation"><strong>Explanation:</strong> ${q.explanation}</p>` : ''}
          </div>
        </div>
      `;
      container.appendChild(li);
    });
  },

  renderQuestionInput(question, index) {
    console.log(`Rendering input for question type: ${question.type}`);
    
    if (question.type === 'mcq' && question.options && question.options.length > 0) {
      return `
        <div class="options-container">
          ${question.options.map((opt, optIndex) => `
            <label class="question-option">
              <input type="radio" name="q${index}" value="${opt.replace('[correct]', '').trim()}">
              <span class="option-letter">${String.fromCharCode(97 + optIndex)})</span>
              ${opt.replace('[correct]', '').trim()}
            </label>
          `).join('')}
        </div>
      `;
    } else if (question.type === 'true_false') {
      return `
        <div class="options-container">
          <label class="question-option">
            <input type="radio" name="q${index}" value="True">
            <span class="option-letter">True</span>
          </label>
          <label class="question-option">
            <input type="radio" name="q${index}" value="False">
            <span class="option-letter">False</span>
          </label>
        </div>
      `;
    } else if (question.type === 'short_answer') {
      return `<input type="text" class="question-input" placeholder="Type your answer here...">`;
    }
    
    // Fallback for unknown types
    return `<input type="text" class="question-input" placeholder="Your answer...">`;
  },

  revealAnswer(button) {
    const answerContainer = button.nextElementSibling;
    if (answerContainer.style.display === "none") {
      answerContainer.style.display = "block";
      button.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Answer';
    } else {
      answerContainer.style.display = "none";
      button.innerHTML = '<i class="fas fa-lightbulb"></i> Show Answer';
    }
  }
};

// Make sure the function is available globally
window.QuestionModule = QuestionModule;