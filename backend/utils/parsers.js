function parseGeminiResponse(responseText) {
    const questions = [];
    const questionBlocks = responseText.split('**Question:**').slice(1);

    for (const block of questionBlocks) {
        const lines = block.trim().split('\n');
        const question = {};

        question.question = lines[0].trim();

        for (const line of lines.slice(1)) {
            const parts = line.split('**');
            if (parts.length < 3) continue;

            const key = parts[1].replace(':', '').trim().toLowerCase();
            const value = parts[2].trim().replace(/^:/, '').trim();

            switch (key) {
                case 'type':
                    question.type = value;
                    break;
                case 'difficulty':
                    question.difficulty = value;
                    break;
                case 'options':
                    try {
                        // Handle potential markdown in the options array string
                        let cleanedValue = value.replace(/`+/g, '').trim();
                        
                        // If it's already a JSON array, parse it
                        if (cleanedValue.startsWith('[')) {
                            question.options = JSON.parse(cleanedValue);
                        } 
                        // If it's a comma-separated list, split it
                        else if (cleanedValue.includes(',')) {
                            question.options = cleanedValue.split(',').map(opt => opt.trim());
                        }
                        // If it's newline-separated, split by newlines
                        else if (cleanedValue.includes('\n')) {
                            question.options = cleanedValue.split('\n')
                                .map(opt => opt.trim())
                                .filter(opt => opt.length > 0);
                        }
                        else {
                            question.options = [];
                        }
                        
                        console.log(`✓ Parsed ${question.options.length} options for question`);
                    } catch (e) {
                        console.error("Failed to parse options:", value, e);
                        question.options = [];
                    }
                    break;
                case 'answer':
                    question.answer = value;
                    break;
                case 'explanation':
                    question.explanation = value;
                    break;
            }
        }
        
        // Log parsed question summary
        console.log(` Parsed question: type=${question.type}, options=${question.options?.length || 0}, hasAnswer=${!!question.answer}`);
        questions.push(question);
    }
    
    console.log(`Total questions parsed: ${questions.length}`);
    return questions;
}

module.exports = { parseGeminiResponse };