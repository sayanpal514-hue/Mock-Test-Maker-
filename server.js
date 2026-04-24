const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Setup Gemini SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/generate-questions', async (req, res) => {
    try {
        const { subject, difficulty, numQuestions } = req.body;

        if (!subject || !difficulty || !numQuestions) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const prompt = `Generate ${numQuestions} multiple choice questions on ${subject} with ${difficulty} difficulty level.
Each question should have exactly 4 options, 1 correct answer, and a short explanation.
Return the response strictly in JSON format as an array of objects. Do not include any markdown formatting like \`\`\`json.
Each object must have the following structure:
{
  "question": "The question text",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correctAnswer": "The exact string of the correct option",
  "explanation": "Explanation for the correct answer"
}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        const questions = JSON.parse(response.text);

        res.json(questions);
    } catch (error) {
        console.error("Error generating questions:", error);
        res.status(500).json({ error: 'Failed to generate questions. Please try again.' });
    }
});

const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// Increase timeout to 5 minutes to allow for large question generation (e.g. 100 questions)
server.setTimeout(300000);
