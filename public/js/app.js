document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    const views = {
        dashboard: document.getElementById('dashboard-view'),
        test: document.getElementById('test-view'),
        result: document.getElementById('result-view')
    };

    // Dashboard Elements
    const setupForm = document.getElementById('setup-form');
    const loadingIndicator = document.getElementById('loading-indicator');
    const startBtn = document.getElementById('start-btn');
    const historyContainer = document.getElementById('history-container');
    const historyList = document.getElementById('history-list');

    // Test Elements
    const questionCounter = document.getElementById('question-counter');
    const progressBar = document.getElementById('progress');
    const timeDisplay = document.getElementById('time-display');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitTestBtn = document.getElementById('submit-test-btn');

    // Result Elements
    const finalScore = document.getElementById('final-score');
    const totalScore = document.getElementById('total-score');
    const scoreMessage = document.getElementById('score-message');
    const scoreCircle = document.querySelector('.score-circle');
    const reviewBtn = document.getElementById('review-btn');
    const homeBtn = document.getElementById('home-btn');
    const reviewContainer = document.getElementById('review-container');
    const reviewList = document.getElementById('review-list');

    // --- State ---
    let state = {
        questions: [],
        currentQuestionIndex: 0,
        answers: [], // Array to store user's selected options
        timeRemaining: 0,
        timerInterval: null,
        testParams: {}
    };

    // --- Exam Configs ---
    const examConfigs = {
        'SSC MTS': { questions: 90, minutes: 90, marks: 270 },
        'SSC CHSL': { questions: 100, minutes: 60, marks: 200 },
        'SSC CGL': { questions: 100, minutes: 60, marks: 200 },
        'RRB Group D': { questions: 100, minutes: 90, marks: 100 },
        'RRB NTPC': { questions: 100, minutes: 90, marks: 100 },
        'Army Agniveer': { questions: 50, minutes: 60, marks: 100 },
        'Indian Navy': { questions: 50, minutes: 30, marks: 50 }
    };

    const subjectSelect = document.getElementById('subject');
    const numQuestionsGroup = document.getElementById('num-questions-group');
    const examInfoCard = document.getElementById('exam-info-card');
    const numQuestionsInput = document.getElementById('num-questions');

    subjectSelect.addEventListener('change', () => {
        const selectedName = subjectSelect.options[subjectSelect.selectedIndex].text;
        if (examConfigs[selectedName]) {
            numQuestionsGroup.classList.add('hidden');
            examInfoCard.classList.remove('hidden');
            const config = examConfigs[selectedName];
            examInfoCard.innerHTML = `<strong>${selectedName}</strong><br>${config.questions} Questions | ${config.minutes} Minutes | ${config.marks} Marks`;
            numQuestionsInput.value = config.questions;
        } else {
            numQuestionsGroup.classList.remove('hidden');
            examInfoCard.classList.add('hidden');
        }
    });

    // Initialize UI on load
    setTimeout(() => subjectSelect.dispatchEvent(new Event('change')), 100);

    // --- Theme Management ---
    const initTheme = () => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    };

    const toggleTheme = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    };

    const updateThemeIcon = (theme) => {
        if (theme === 'dark') {
            themeIcon.classList.replace('fa-moon', 'fa-sun');
        } else {
            themeIcon.classList.replace('fa-sun', 'fa-moon');
        }
    };

    themeToggle.addEventListener('click', toggleTheme);
    initTheme();

    // --- Navigation ---
    const switchView = (viewName) => {
        Object.values(views).forEach(view => {
            view.classList.remove('active');
            view.classList.add('hidden');
        });
        views[viewName].classList.remove('hidden');
        // Small delay to allow display:block to apply before animating opacity
        setTimeout(() => views[viewName].classList.add('active'), 10);
    };

    // --- API Calls ---
    const generateQuestions = async (subject, difficulty, numQuestions) => {
        try {
            const response = await fetch('/generate-questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ subject, difficulty, numQuestions })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch questions');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error:', error);
            alert(`Error: ${error.message}`);
            return null;
        }
    };

    // --- Test Logic ---
    setupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const subjectSelect = document.getElementById('subject');
        const subject = subjectSelect.value;
        const subjectName = subjectSelect.options[subjectSelect.selectedIndex].text;
        const difficulty = document.getElementById('difficulty').value;
        let numQuestions = parseInt(document.getElementById('num-questions').value, 10);
        let timeMinutes = numQuestions; // Default 1 min per Q
        let totalMarks = numQuestions; // Default 1 mark per Q

        if (examConfigs[subjectName]) {
            numQuestions = examConfigs[subjectName].questions;
            timeMinutes = examConfigs[subjectName].minutes;
            totalMarks = examConfigs[subjectName].marks;
        }

        state.testParams = { subject, subjectName, difficulty, numQuestions, timeMinutes, totalMarks };

        // UI updates
        startBtn.disabled = true;
        loadingIndicator.classList.remove('hidden');

        const questions = await generateQuestions(subject, difficulty, numQuestions);

        startBtn.disabled = false;
        loadingIndicator.classList.add('hidden');

        if (questions && questions.length > 0) {
            startTest(questions);
        }
    });

    const startTest = (questions) => {
        state.questions = questions;
        state.currentQuestionIndex = 0;
        state.answers = new Array(questions.length).fill(null);
        
        // Timer
        state.timeRemaining = state.testParams.timeMinutes * 60; 
        
        switchView('test');
        renderQuestion();
        startTimer();
    };

    const renderQuestion = () => {
        const { questions, currentQuestionIndex, answers } = state;
        const currentQ = questions[currentQuestionIndex];

        // Update Header
        questionCounter.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
        progressBar.style.width = `${((currentQuestionIndex + 1) / questions.length) * 100}%`;

        // Update Question
        questionText.textContent = currentQ.question;

        // Update Options
        optionsContainer.innerHTML = '';
        currentQ.options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = option;
            
            if (answers[currentQuestionIndex] === option) {
                btn.classList.add('selected');
            }

            btn.addEventListener('click', () => selectOption(option));
            optionsContainer.appendChild(btn);
        });

        // Update Navigation Buttons
        prevBtn.disabled = currentQuestionIndex === 0;
        
        if (currentQuestionIndex === questions.length - 1) {
            nextBtn.classList.add('hidden');
            submitTestBtn.classList.remove('hidden');
        } else {
            nextBtn.classList.remove('hidden');
            submitTestBtn.classList.add('hidden');
        }
    };

    const selectOption = (selectedOption) => {
        state.answers[state.currentQuestionIndex] = selectedOption;
        
        // Visually update selected state
        const buttons = optionsContainer.querySelectorAll('.option-btn');
        buttons.forEach(btn => {
            if (btn.textContent === selectedOption) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
    };

    prevBtn.addEventListener('click', () => {
        if (state.currentQuestionIndex > 0) {
            state.currentQuestionIndex--;
            renderQuestion();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (state.currentQuestionIndex < state.questions.length - 1) {
            state.currentQuestionIndex++;
            renderQuestion();
        }
    });

    submitTestBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to submit the test?')) {
            finishTest();
        }
    });

    // --- Timer Logic ---
    const startTimer = () => {
        updateTimeDisplay();
        state.timerInterval = setInterval(() => {
            state.timeRemaining--;
            updateTimeDisplay();

            if (state.timeRemaining <= 0) {
                clearInterval(state.timerInterval);
                alert('Time is up! Submitting test automatically.');
                finishTest();
            }
        }, 1000);
    };

    const updateTimeDisplay = () => {
        const minutes = Math.floor(state.timeRemaining / 60);
        const seconds = state.timeRemaining % 60;
        timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (state.timeRemaining < 60) {
            timeDisplay.style.color = 'var(--danger-color)';
            timeDisplay.style.animation = 'pulse 1s infinite';
        } else {
            timeDisplay.style.color = '';
            timeDisplay.style.animation = '';
        }
    };

    // --- Result Logic ---
    const finishTest = () => {
        clearInterval(state.timerInterval);
        
        let score = 0;
        state.questions.forEach((q, i) => {
            if (state.answers[i] === q.correctAnswer) {
                score++;
            }
        });

        const total = state.questions.length;
        const marksPerQuestion = state.testParams.totalMarks / state.testParams.numQuestions;
        const finalScoreValue = score * marksPerQuestion;
        const percentage = (finalScoreValue / state.testParams.totalMarks) * 100;

        // Update UI
        finalScore.textContent = finalScoreValue.toFixed(0);
        totalScore.textContent = state.testParams.totalMarks;
        
        // CSS trick to animate conic gradient
        scoreCircle.style.setProperty('--percentage', `${percentage}%`);

        if (percentage >= 80) scoreMessage.textContent = 'Excellent!';
        else if (percentage >= 60) scoreMessage.textContent = 'Good Job!';
        else if (percentage >= 40) scoreMessage.textContent = 'Needs Improvement.';
        else scoreMessage.textContent = 'Keep Practicing!';

        saveTestHistory(state.testParams.subjectName, finalScoreValue.toFixed(0), state.testParams.totalMarks);
        renderReview();
        switchView('result');
    };

    const renderReview = () => {
        reviewList.innerHTML = '';
        state.questions.forEach((q, i) => {
            const userAnswer = state.answers[i];
            const isCorrect = userAnswer === q.correctAnswer;
            
            const item = document.createElement('div');
            item.className = `review-item ${isCorrect ? 'correct' : 'incorrect'}`;
            
            item.innerHTML = `
                <div class="review-question">${i + 1}. ${q.question}</div>
                <div class="review-answer user-answer">
                    Your Answer: ${userAnswer || 'Not answered'}
                </div>
                ${!isCorrect ? `
                <div class="review-answer correct-answer">
                    Correct Answer: ${q.correctAnswer}
                </div>
                ` : ''}
                <div class="review-explanation">
                    <strong>Explanation:</strong> ${q.explanation}
                </div>
            `;
            reviewList.appendChild(item);
        });
    };

    reviewBtn.addEventListener('click', () => {
        reviewContainer.classList.toggle('hidden');
        if (!reviewContainer.classList.contains('hidden')) {
            reviewContainer.scrollIntoView({ behavior: 'smooth' });
        }
    });

    homeBtn.addEventListener('click', () => {
        // Reset state
        state = {
            questions: [],
            currentQuestionIndex: 0,
            answers: [],
            timeRemaining: 0,
            timerInterval: null,
            testParams: {}
        };
        reviewContainer.classList.add('hidden');
        setupForm.reset();
        loadHistory();
        switchView('dashboard');
    });

    // --- History Logic ---
    const saveTestHistory = (subject, score, total) => {
        const history = JSON.parse(localStorage.getItem('testHistory') || '[]');
        const newRecord = {
            subject,
            score,
            total,
            date: new Date().toLocaleDateString()
        };
        history.unshift(newRecord);
        // Keep only last 10
        if (history.length > 10) history.pop();
        localStorage.setItem('testHistory', JSON.stringify(history));
    };

    const loadHistory = () => {
        const history = JSON.parse(localStorage.getItem('testHistory') || '[]');
        
        if (history.length > 0) {
            historyContainer.classList.remove('hidden');
            historyList.innerHTML = '';
            
            history.forEach(record => {
                const li = document.createElement('li');
                li.className = 'history-item';
                li.innerHTML = `
                    <div class="history-details">
                        <span class="history-subject">${record.subject}</span>
                        <span class="history-date">${record.date}</span>
                    </div>
                    <div class="history-score">${record.score}/${record.total}</div>
                `;
                historyList.appendChild(li);
            });
        }
    };

    // Initialize history on load
    loadHistory();
});
