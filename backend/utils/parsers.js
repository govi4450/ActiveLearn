function parseGeminiResponse(responseText) {
  console.log("🔍 Raw Gemini Response:\n", responseText);
  
  const questions = [];
  let currentQuestion = null;
  const lines = responseText.split('\n');
  
  const patterns = {
    question: /^(\d+|TF\d+|SA\d+)\.\s*(.*)/,
    option: /^([a-d])[\.\)]\s*(.*)/i,
    answer: /^(?:Answer|Correct Answer|Correct):\s*(.*)/i,
    explanation: /^(?:Explanation|Reason|Why):\s*(.*)/i,
    difficulty: /^(?:Difficulty|Level):\s*(Easy|Medium|Hard)/i
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Question detection
    const questionMatch = trimmed.match(patterns.question);
    if (questionMatch) {
      if (currentQuestion) {
        // Validate current question before pushing
        if (currentQuestion.question && currentQuestion.correctAnswer) {
          questions.push(currentQuestion);
        }
      }

      let questionText = questionMatch[2].replace(/^\[[^\]]+\]\s*/, '');
      
      // Determine question type correctly
      let questionType = 'mcq'; // default
      if (questionMatch[1].startsWith('TF')) {
        questionType = 'true_false';
      } else if (questionMatch[1].startsWith('SA')) {
        questionType = 'short_answer';
      }
      
      currentQuestion = {
        id: questionMatch[1],
        question: questionText,
        type: questionType, // This was the main issue - all were being set to 'mcq'
        options: [],
        correctAnswer: '',
        explanation: '',
        difficulty: 'Medium'
      };
      // console.log(`Found ${questionType} question: ${questionText.substring(0, 50)}...`);
      return;
    }

    if (!currentQuestion) return;

    // Option detection only for MCQ questions
    const optionMatch = trimmed.match(patterns.option);
    if (optionMatch && currentQuestion.type === 'mcq') {
      currentQuestion.options.push(optionMatch[2].trim());
      // console.log(` Option ${optionMatch[1]}: ${optionMatch[2].substring(0, 30)}...`);
      return;
    }

    // Answer detection
    const answerMatch = trimmed.match(patterns.answer);
    if (answerMatch) {
      currentQuestion.correctAnswer = answerMatch[1].trim();
      // console.log(` Answer: ${currentQuestion.correctAnswer}`);
      return;
    }

    // Explanation detection
    const explanationMatch = trimmed.match(patterns.explanation);
    if (explanationMatch) {
      currentQuestion.explanation = explanationMatch[1].trim();
      // console.log(` Explanation: ${currentQuestion.explanation.substring(0, 50)}...`);
      return;
    }

    // Difficulty detection
    const difficultyMatch = trimmed.match(patterns.difficulty);
    if (difficultyMatch) {
      currentQuestion.difficulty = difficultyMatch[1];
      // console.log(`Difficulty: ${currentQuestion.difficulty}`);
      return;
    }
  });

  // Push the last question
  if (currentQuestion && currentQuestion.question && currentQuestion.correctAnswer) {
    questions.push(currentQuestion);
  }

  // console.log(` Parsed ${questions.length} questions`);
  
  // Validate and clean questions
  const validQuestions = questions.filter(q => 
    q.question && q.correctAnswer && q.type
  ).map((q, index) => {
    // Clean up the question type and ensure proper formatting
    const cleanedQuestion = {
      id: q.id || `Q${index + 1}`,
      question: q.question.trim(),
      type: q.type,
      correctAnswer: q.correctAnswer.trim(),
      explanation: q.explanation ? q.explanation.trim() : "No explanation provided.",
      difficulty: q.difficulty || 'Medium'
    };
    
    // Only include options for MCQ questions
    if (q.type === 'mcq' && q.options && q.options.length > 0) {
      cleanedQuestion.options = q.options.map(opt => opt.trim());
    } else {
      cleanedQuestion.options = [];
    }
    
    // For true/false questions, add standard options
    if (q.type === 'true_false') {
      cleanedQuestion.options = ['True', 'False'];
    }
    
    return cleanedQuestion;
  });

  // console.log(` Valid questions: ${validQuestions.length}`);
  
  // Debug: Log each question details with correct type
  validQuestions.forEach((q, i) => {
    // console.log(`\n Question ${i + 1} (${q.type}):`);
    // console.log(`   Question: ${q.question.substring(0, 60)}...`);
    // console.log(`   Answer: ${q.correctAnswer}`);
    // console.log(`   Explanation: ${q.explanation.substring(0, 50)}...`);
    // console.log(`   Difficulty: ${q.difficulty}`);
    if (q.type === 'mcq') {
      console.log(`   Options: ${q.options.length}`);
    }
  });

  return validQuestions.slice(0, 10);
}

module.exports = { parseGeminiResponse };