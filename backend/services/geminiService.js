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

  static async generateQuestions(transcript, summary) {
    const prompt = `You are a professional educational question generator. Create 10 high-quality questions based STRICTLY on the content provided below.

**Content Summary:**
${summary}

**Content Transcript:**
${transcript.substring(0, 7500)}

**CRITICAL RULES:**
1.  **SOURCE RESTRICTION:** Use ONLY the information explicitly stated in the Summary and Transcript above. Do NOT add external knowledge.
2.  **PROFESSIONAL TONE:** Write questions as if for an educational assessment. Focus on concepts, principles, and facts discussed.
3.  **NO META-REFERENCES:** 
    -  NEVER use phrases like "in the video", "in the transcript", "the speaker mentions", "according to the content"
    -  NEVER ask about the author, speaker, or video itself
    -  Ask direct concept-based questions as if testing understanding of the subject matter
4.  **CONCEPT-FOCUSED:** Ask about the actual concepts, definitions, relationships, and principles explained in the content.
5.  **VERIFICATION:** Each question must be answerable by directly referencing specific information from the text above.

**QUESTION DISTRIBUTION:**
- Exactly 4 Multiple Choice questions
- Exactly 2 Fill-in-the-Blank questions  
- Exactly 2 True/False questions
- Exactly 2 Short Answer questions

**EXAMPLES OF GOOD vs BAD QUESTIONS:**

 BAD: "According to the video, what is Newton's second law?"
 GOOD: "What is the relationship between force, mass, and acceleration?"

 BAD: "The speaker explains that energy can be _______"
 GOOD: "Energy can be _______ but not created or destroyed."

 BAD: "In the transcript, which formula is mentioned for calculating work?"
GOOD: "Which formula is used to calculate work done by a force?"

**OUTPUT FORMAT:**
For each question, provide EXACTLY this format:

**Question:** [Professional, concept-focused question with no meta-references]
**Type:** [multiple-choice | fill-in-the-blank | true/false | short-answer]
**Difficulty:** [Easy | Medium | Hard]
**Options:** [For multiple-choice ONLY: provide 4 options as JSON array like ["Option 1 text here", "Option 2 text here", "Option 3 text here", "Option 4 text here"]. For other types, write "N/A"]
**Answer:** [The correct answer from the content above]
**Explanation:** [Explain the concept without saying "the video states" or "according to the transcript" - just explain the concept directly]

**EXAMPLE MULTIPLE-CHOICE QUESTION:**
**Question:** What is the relationship between force, mass, and acceleration?
**Type:** multiple-choice
**Difficulty:** Medium
**Options:** ["Force equals mass times acceleration", "Force equals mass divided by acceleration", "Force equals acceleration divided by mass", "Force is independent of mass and acceleration"]
**Answer:** Force equals mass times acceleration
**Explanation:** Newton's second law states that force is directly proportional to both mass and acceleration, expressed as F = ma.

Generate all 10 questions now:`;

    try {
      console.log("---PROMPT START---");
      console.log(prompt);
      console.log("---PROMPT END---");

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

  static async generateDetailedSummary(prompt) {
    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 3000 }
      });
      const response = await result.response;
      const text = await response.text();

      // Parse JSON from response
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error('Invalid JSON response from model');
      }
      const jsonText = text.substring(firstBrace, lastBrace + 1);
      const parsed = JSON.parse(jsonText);
      
      return parsed;
    } catch (error) {
      console.error('Detailed summary generation error:', error);
      throw new Error('Failed to generate detailed summary');
    }
  }

  static async generateMindMap(transcript) {
    const prompt = `Create a concise mind map structure (nodes and directed edges) from the transcript below. Output MUST be valid JSON in the following schema exactly without extra commentary:
{
  "nodes": [{ "id": "n1", "label": "Root concept" }, ...],
  "edges": [{ "source": "n1", "target": "n2", "label": "relation (optional)" }, ...]
}

Guidelines:
- Choose a clear root node (the main topic) and produce 6-20 nodes total, covering main ideas and subtopics.
- Keep labels short (3-8 words).
- Do not include timestamps, URLs, or talk about the speaker.
- Output only the JSON object and nothing else.

Transcript:
${transcript.substring(0, 12000)}
`;

    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 1500 }
      });
      const response = await result.response;
      const text = await response.text();

      // Attempt to parse JSON from returned text (strip trailing/following text)
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error('Invalid mind map response from model');
      }
      const jsonText = text.substring(firstBrace, lastBrace + 1);
      const parsed = JSON.parse(jsonText);
      // Basic validation
      if (!parsed.nodes || !Array.isArray(parsed.nodes) || !parsed.edges || !Array.isArray(parsed.edges)) {
        throw new Error('Mind map JSON missing nodes/edges');
      }
      return parsed;
    } catch (error) {
      console.error('Mind map generation error:', error);
      throw new Error('Failed to generate mind map');
    }
  }
}

module.exports = GeminiService;