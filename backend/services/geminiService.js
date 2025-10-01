const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-2.0-flash" });

class GeminiService {
  static async generateSummary(transcript) {
    const prompt = `Summarize this YouTube video transcript in exactly 3 bullet points:
${transcript.substring(0, 10000)}

Guidelines:
- Start each point with '*'
- Keep each point concise (1-2 sentences)
- summary should be like when the user reads it it gets roughly the idea of the video
- be Precise and maintain original meaning
- Use clear, simple language`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text()
        .split('\n')
        .filter(line => line.trim().startsWith('*'))
        .map(line => line.trim().substring(1).trim());
    } catch (error) {
      console.error('Summarization error:', error);
      throw new Error('Failed to generate summary');
    }
  }

  static async generateQuestions(transcript) {
    const prompt = `Generate 5-10 diverse, content-based, and technical questions about this content:
${transcript.substring(0, 3000)}

Guidelines:
- Do NOT include any questions about the speaker, their intentions, or their opinions.
- Only ask questions about the technical content, facts, concepts, or processes described.
- Avoid questions that reference "the speaker", "the listener", or any personal perspective.
- Use these formats:
  1. Multiple choice (format: 1. [Difficulty] Question)
  2. True/False (format: TF1. Statement)
  3. Short answer (format: SA1. Question)

- For each question provide:
  - Correct answer (Answer:)
  - Explanation (Explanation:)
  - Difficulty (Easy/Medium/Hard)`;

    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
      });
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Question generation error:', error);
      throw new Error('Failed to generate questions');
    }
  }
}

module.exports = GeminiService;