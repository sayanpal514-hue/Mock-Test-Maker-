# Mock Test Master 🎓

Mock Test Master is a full-stack web application that allows users to generate and take dynamic mock tests for various competitive exams. Powered by the **Gemini AI**, this app accurately mimics real-world exam configurations (such as total questions, time limits, and scoring systems) to provide an authentic testing experience.

## Features ✨

- **AI-Powered Question Generation**: Uses Gemini 2.5 Flash to generate unique, high-quality multiple-choice questions on demand.
- **Strict Exam Modes**: Built-in configurations for popular competitive exams:
  - **SSC MTS**: 90 Questions | 90 Minutes | 270 Marks
  - **SSC CHSL & CGL**: 100 Questions | 60 Minutes | 200 Marks
  - **RRB Group D & NTPC**: 100 Questions | 90 Minutes | 100 Marks
  - **Army Agniveer**: 50 Questions | 60 Minutes | 100 Marks
  - **Indian Navy**: 50 Questions | 30 Minutes | 50 Marks
- **Customizable Tests**: Ability to specify general subjects (Math, History, etc.) with custom question counts and difficulties.
- **Real-Time Timer**: A strict countdown timer that automatically submits your test when time is up.
- **Smart Scoring**: Automatically calculates your score based on the specific exam's marking scheme.
- **Detailed Review**: Post-test analytics show correct answers, your selected answers, and detailed AI explanations for each question.
- **Test History**: Uses LocalStorage to save your past test scores locally on your browser.
- **Modern UI**: A premium, responsive design complete with Dark/Light mode toggle and smooth transitions.

## Tech Stack 🛠️

- **Frontend**: HTML5, Vanilla CSS (with CSS Variables for theming), Vanilla JavaScript.
- **Backend**: Node.js, Express.js.
- **AI Integration**: `@google/genai` (Official Gemini SDK).

## Installation & Setup 🚀

To run this project locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sayanpal514-hue/Mock-Test-Maker-.git
   cd Mock-Test-Maker-
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   - Rename the `.env.example` file to `.env` (or create a new `.env` file).
   - Add your Gemini API Key:
     ```env
     PORT=3000
     GEMINI_API_KEY=your_gemini_api_key_here
     ```

4. **Start the Server:**
   ```bash
   npm start
   ```

5. **Open in Browser:**
   Navigate to `http://localhost:3000` to start taking tests!

## Deployment 🌐

This project includes a `vercel.json` file for easy deployment to [Vercel](https://vercel.com/).
1. Push your code to GitHub.
2. Import the project in Vercel.
3. Add your `GEMINI_API_KEY` to the Environment Variables in the Vercel project settings.
4. Deploy!

## License 📄
ISC
