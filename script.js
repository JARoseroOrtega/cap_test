let selectedQuestions = [];
let currentIndex = 0;
let answers = []; // {selected: null, correct: boolean}
let timerInterval = null;
let timeLeft = 7200; // 120 minutes in seconds
const TOTAL_QUESTIONS = 100;


// Questions are loaded via questions.js; allQuestions is defined there.

// Cache for grouped questions to avoid regrouping on every restart
let groupedQuestionsCache = null;

function selectProportionalQuestions(questions, target) {
    // Use cached grouped questions if available
    let grouped = groupedQuestionsCache;
    if (!grouped) {
        grouped = {};
        questions.forEach(q => {
            if (!grouped[q.section]) grouped[q.section] = [];
            grouped[q.section].push(q);
        });
        groupedQuestionsCache = grouped;
    }

    const total = questions.length;
    const sections = Object.keys(grouped);
    const rawCounts = sections.map(sec => ({
        section: sec,
        count: grouped[sec].length / total * target
    }));
    // Compute integer counts and fractions
    let sum = 0;
    const counts = [];
    rawCounts.forEach(({section, count}) => {
        const intCount = Math.floor(count);
        const fraction = count - intCount;
        counts.push({section, intCount, fraction});
        sum += intCount;
    });
    // Distribute remaining to sections with largest fraction
    const remaining = target - sum;
    if (remaining > 0) {
        counts.sort((a, b) => b.fraction - a.fraction);
        for (let i = 0; i < remaining; i++) {
            counts[i].intCount++;
        }
    }
    // Select questions
    selectedQuestions = [];
    counts.forEach(({section, intCount}) => {
        const pool = grouped[section];
        // Shuffle pool using Fisher-Yates for better performance
        const shuffled = pool.slice();
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        selectedQuestions.push(...shuffled.slice(0, intCount));
    });
    // Shuffle final order
    selectedQuestions.sort(() => Math.random() - 0.5);
}

function initQuiz() {
    // Cache DOM elements for performance
    cacheElements();

    answers = new Array(selectedQuestions.length).fill().map(() => ({selected: null, correct: false}));
    currentIndex = 0;
    loadQuestion();
    startTimer();
    updateNavButtons();
    updateUnansweredSidebar();
}

function startTimer() {
    if (cachedElements.timerText) {
        cachedElements.timerText.textContent = formatTime(timeLeft);
    }
    timerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft < 0) {
            clearInterval(timerInterval);
            timeUp();
            return;
        }
        if (cachedElements.timerText) {
            cachedElements.timerText.textContent = formatTime(timeLeft);
        }
        // Visual warnings - more subtle approach
        if (cachedElements.timerEl) {
            // Remove previous state classes
            cachedElements.timerEl.className = '';

            if (timeLeft <= 300) { // 5 minutes
                cachedElements.timerEl.classList.add('critical');
                // Add subtle pulse animation via CSS class
                cachedElements.timerEl.classList.add('pulse-warning');
            } else if (timeLeft <= 600) { // 10 minutes
                cachedElements.timerEl.classList.add('warning');
                cachedElements.timerEl.classList.add('pulse-warning');
            }
        }
    }, 1000);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Cache DOM elements for performance
const cachedElements = {
    quizDiv: null,
    resultsDiv: null,
    questionNumber: null,
    sectionBadge: null,
    progressBarWrapper: null,
    progressBar: null,
    progressLabel: null,
    questionText: null,
    optionsDiv: null,
    feedbackDiv: null,
    nextBtn: null,
    prevBtn: null,
    timerText: null,
    timerEl: null,
    unansweredSidebar: null,
    unansweredList: null,
    unansweredBtn: null,
    unansweredCountEl: null,
    resultIcon: null,
    scoreSummary: null,
    sectionStats: null,
    failedList: null,
    endBtn: null,
    restartBtn: null
};

function cacheElements() {
    cachedElements.quizDiv = document.getElementById('quiz');
    cachedElements.resultsDiv = document.getElementById('results');
    cachedElements.questionNumber = document.getElementById('question-number');
    cachedElements.sectionBadge = document.getElementById('section-badge');
    cachedElements.progressBarWrapper = document.getElementById('progress-bar-wrapper');
    cachedElements.progressBar = document.getElementById('progress-bar');
    cachedElements.progressLabel = document.getElementById('progress-label');
    cachedElements.questionText = document.getElementById('question-text');
    cachedElements.optionsDiv = document.getElementById('options');
    cachedElements.feedbackDiv = document.getElementById('feedback');
    cachedElements.nextBtn = document.getElementById('next-btn');
    cachedElements.prevBtn = document.getElementById('prev-btn');
    cachedElements.timerText = document.getElementById('timer-text');
    cachedElements.timerEl = document.getElementById('timer');
    cachedElements.unansweredSidebar = document.getElementById('unanswered-sidebar');
    cachedElements.unansweredList = document.getElementById('unanswered-list');
    cachedElements.unansweredBtn = document.getElementById('unanswered-btn');
    cachedElements.unansweredCountEl = document.getElementById('unanswered-count');
    cachedElements.resultIcon = document.getElementById('result-icon');
    cachedElements.scoreSummary = document.getElementById('score-summary');
    cachedElements.sectionStats = document.getElementById('section-stats');
    cachedElements.failedList = document.getElementById('failed-list');
    cachedElements.endBtn = document.getElementById('end-btn');
    cachedElements.restartBtn = document.getElementById('restart-btn');
}

function loadQuestion() {
    if (currentIndex >= selectedQuestions.length) {
        showResults();
        return;
    }
    const q = selectedQuestions[currentIndex];

    // Update question number
    if (cachedElements.questionNumber) {
        cachedElements.questionNumber.textContent = `PREGUNTA ${currentIndex + 1} / ${selectedQuestions.length}`;
    }

    // Update section badge
    if (cachedElements.sectionBadge) {
        cachedElements.sectionBadge.textContent = q.section || '';
    }

    // Update progress bar
    const answered = answers.filter(a => a.selected !== null).length;
    const pct = Math.round((answered / selectedQuestions.length) * 100);
    if (cachedElements.progressBar && cachedElements.progressBarWrapper) {
        cachedElements.progressBarWrapper.style.display = '';
        cachedElements.progressBar.parentElement.style.flex = '1';
        cachedElements.progressBar.style.width = pct + '%';
    }
    if (cachedElements.progressLabel) {
        cachedElements.progressLabel.textContent = `${answered} / ${selectedQuestions.length}`;
    }

    // Update question text
    if (cachedElements.questionText) {
        cachedElements.questionText.textContent = q.question;
    }

    // Update options
    if (cachedElements.optionsDiv) {
        cachedElements.optionsDiv.innerHTML = '';
        const feedbackDiv = cachedElements.feedbackDiv;
        const alreadyAnswered = answers[currentIndex].selected !== null;

        if (alreadyAnswered) {
            // Show feedback and disable options
            if (feedbackDiv) {
                feedbackDiv.textContent = answers[currentIndex].correct ? '¡Correcto!' : `Incorrecto. La respuesta correcta es ${q.answer}.`;
                feedbackDiv.className = answers[currentIndex].correct ? 'correct' : 'incorrect';
            }
        } else {
            // Reset feedback and enable options
            if (feedbackDiv) {
                feedbackDiv.textContent = '';
                feedbackDiv.className = '';
            }
        }

        // Always enable next button (allow skipping questions)
        if (cachedElements.nextBtn) {
            cachedElements.nextBtn.disabled = false;
        }

        const letters = ['A', 'B', 'C', 'D'];
        const fragment = document.createDocumentFragment();
        letters.forEach(letter => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            // Get option text; fallback to empty string if missing
            const optionText = q.options[letter] || '';
            btn.textContent = `${letter}) ${optionText}`;
            btn.dataset.letter = letter;
            btn.setAttribute('data-letter', letter);
            if (!alreadyAnswered) {
                btn.addEventListener('click', handleOptionSelect);
            }
            fragment.appendChild(btn);
        });
        cachedElements.optionsDiv.appendChild(fragment);

        // Disable all option buttons if already answered
        if (alreadyAnswered) {
            const opts = cachedElements.optionsDiv.querySelectorAll('.option-btn');
            opts.forEach(o => {
                o.disabled = true;
                o.classList.add('disabled');
            });
            // Optionally add visual indication of correctness
            opts.forEach(o => {
                const letter = o.dataset.letter;
                if (letter === q.answer) {
                    o.classList.add('correct');
                } else if (letter === answers[currentIndex].selected) {
                    o.classList.add('incorrect');
                }
            });
        }
    }

    updateNavButtons();
    updateUnansweredSidebar();
}

function handleOptionSelect(e) {
    const btn = e.target;
    // Disable all options
    const opts = cachedElements.optionsDiv.querySelectorAll('.option-btn');
    opts.forEach(o => {
        o.disabled = true;
        o.classList.add('disabled');
    });
    const selected = btn.dataset.letter;
    const q = selectedQuestions[currentIndex];
    const correct = (selected === q.answer);
    // Record answer
    answers[currentIndex] = {selected, correct};
    // Visual feedback
    opts.forEach(o => {
        const letter = o.dataset.letter;
        if (letter === q.answer) {
            o.classList.add('correct');
        } else if (letter === selected) {
            o.classList.add('incorrect');
        }
    });
    if (cachedElements.feedbackDiv) {
        if (correct) {
            cachedElements.feedbackDiv.textContent = '¡Correcto!';
            cachedElements.feedbackDiv.className = 'correct';
        } else {
            cachedElements.feedbackDiv.textContent = `Incorrecto. La respuesta correcta es ${q.answer}.`;
            cachedElements.feedbackDiv.className = 'incorrect';
        }
    }
    if (cachedElements.nextBtn) {
        cachedElements.nextBtn.disabled = false;
    }
}

function nextQuestion() {
    currentIndex++;
    loadQuestion();
}

// Previous question
function prevQuestion() {
    if (currentIndex > 0) {
        currentIndex--;
        loadQuestion();
    }
}

function timeUp() {
    // Disable any remaining interaction
    const opts = cachedElements.optionsDiv.querySelectorAll('.option-btn');
    opts.forEach(o => o.disabled = true);
    if (cachedElements.nextBtn) {
        cachedElements.nextBtn.disabled = true;
    }
    showResults();
}

function calculateScore() {
    let score = 0;
    answers.forEach(ans => {
        if (ans.selected === null) {
            // unanswered => 0
        } else if (ans.correct) {
            score += 1;
        } else {
            score -= 0.5;
        }
    });
    return score; // sumatoria, puede ser negativo
}

function showResults() {
    clearInterval(timerInterval);
    if (cachedElements.quizDiv) {
        cachedElements.quizDiv.classList.add('hidden');
    }
    if (cachedElements.resultsDiv) {
        cachedElements.resultsDiv.classList.remove('hidden');
    }

    // Hide sidebar and disable navigation buttons when showing results
    if (cachedElements.unansweredSidebar) {
        cachedElements.unansweredSidebar.style.display = 'none';
    }
    if (cachedElements.prevBtn) {
        cachedElements.prevBtn.disabled = true;
        cachedElements.prevBtn.classList.add('disabled');
    }
    if (cachedElements.nextBtn) {
        cachedElements.nextBtn.disabled = true;
        cachedElements.nextBtn.classList.add('disabled');
    }
    if (cachedElements.unansweredBtn) {
        cachedElements.unansweredBtn.disabled = true;
        cachedElements.unansweredBtn.classList.add('disabled');
    }

    const score = calculateScore();
    const passed = score >= 51;
    // Calculate percentage for visual progress
    const percentage = Math.max(0, Math.min(100, ((score + (selectedQuestions.length * 0.5)) / (selectedQuestions.length)) * 100));

    if (cachedElements.resultIcon) {
        cachedElements.resultIcon.textContent = passed ? '🏆' : '📋';
    }
    if (cachedElements.scoreSummary) {
        cachedElements.scoreSummary.innerHTML = `
            <div class="score-header">
                <p>Puntuación total: <strong>${score.toFixed(2)}</strong> / ${selectedQuestions.length}</p>
                <div class="score-progress-container">
                    <div class="score-progress-bg"></div>
                    <div class="score-progress-fill" style="width: ${percentage}%"></div>
                </div>
                <p>Porcentaje equivalente: <strong>${percentage.toFixed(1)}%</strong></p>
            </div>
            <span class="score-verdict ${passed ? 'passed' : 'failed'}">${passed ? '✓ APROBADO' : '✗ REPROBADO'}</span>
        `;
    }

    // Section stats with visual indicators
    if (cachedElements.sectionStats) {
        const statsBySection = {};
        selectedQuestions.forEach((q, idx) => {
            const sec = q.section;
            if (!statsBySection[sec]) {
                statsBySection[sec] = {total: 0, correct: 0, incorrect: 0, unanswered: 0};
            }
            const s = statsBySection[sec];
            s.total++;
            const ans = answers[idx];
            if (ans.selected === null) {
                s.unanswered++;
            } else if (ans.correct) {
                s.correct++;
            } else {
                s.incorrect++;
            }
        });

        let table = `<table><thead><tr><th>Sección</th><th>Total</th><th>Correctas</th><th>Incorrectas</th><th>Sin responder</th><th>% Correctas</th></tr></thead><tbody>`;
        Object.entries(statsBySection).forEach(([sec, stats]) => {
            const correctPercentage = stats.total > 0 ? ((stats.correct / stats.total) * 100).toFixed(1) : '0';
            table += `<tr>
                <td>${sec}</td>
                <td>${stats.total}</td>
                <td>${stats.correct}</td>
                <td>${stats.incorrect}</td>
                <td>${stats.unanswered}</td>
                <td><div class="section-progress-container"><div class="section-progress-bg"></div><div class="section-progress-fill" style="width: ${correctPercentage}%"></div></div> ${correctPercentage}%</td>
            </tr>`;
        });
        table += `</tbody></table>`;
        cachedElements.sectionStats.innerHTML = table;
    }

    // Failed questions list with better formatting
    if (cachedElements.failedList) {
        cachedElements.failedList.innerHTML = '<h3>Preguntas falladas</h3>';
        let hasFailed = false;
        selectedQuestions.forEach((q, idx) => {
            const ans = answers[idx];
            if (ans.selected !== null && !ans.correct) {
                hasFailed = true;
                const item = document.createElement('div');
                item.className = 'failed-item';
                item.innerHTML = `<div class="failed-question">
                                    <strong>${q.question}</strong>
                                  </div>
                                  <div class="failed-answer">
                                      <p><span class="label">Tu respuesta:</span> ${ans.selected} (${q.options[ans.selected] || 'N/A'})</p>
                                      <p><span class="label">Respuesta correcta:</span> ${q.answer} (${q.options[q.answer] || 'N/A'})</p>
                                  </div>
                                  <div class="failed-meta">
                                      <p><span class="label">Norma:</span> ${q.norma}</p>
                                      <p><span class="label">Referencia doctrinal:</span> ${q.referencia}</p>
                                  </div>`;
                cachedElements.failedList.appendChild(item);
            }
        });
        if (!hasFailed) {
            cachedElements.failedList.innerHTML += '<p class="no-failed">¡No fallaste ninguna pregunta!</p>';
        }
    }
}

// End exam function
function endExam() {
    if (confirm('¿Está seguro de que quiere terminar el examen? Se perderán todas las respuestas no guardadas.')) {
        clearInterval(timerInterval);
        if (cachedElements.nextBtn) {
            cachedElements.nextBtn.disabled = true;
        }
        showResults();
    }
}

// Restart exam function
function restartExam() {
    if (confirm('¿Está seguro de que quiere reiniciar el examen? Se perderá todo el progreso actual.')) {
        clearInterval(timerInterval);
        timeLeft = 7200; // reset timer
        if (cachedElements.quizDiv) {
            cachedElements.quizDiv.classList.remove('hidden');
        }
        if (cachedElements.resultsDiv) {
            cachedElements.resultsDiv.classList.add('hidden');
        }
        if (cachedElements.timerText) {
            cachedElements.timerText.textContent = formatTime(timeLeft);
        }
        if (cachedElements.timerEl) {
            cachedElements.timerEl.className = '';
        }
        selectProportionalQuestions(allQuestions, TOTAL_QUESTIONS);
        initQuiz();
    }
}

// Update navigation buttons state
function updateNavButtons() {
    // Prev button disabled at first question
    if (cachedElements.prevBtn) {
        if (currentIndex === 0) {
            cachedElements.prevBtn.disabled = true;
            cachedElements.prevBtn.classList.add('disabled');
        } else {
            cachedElements.prevBtn.disabled = false;
            cachedElements.prevBtn.classList.remove('disabled');
        }
    }
}

// Update unanswered questions sidebar
function updateUnansweredSidebar() {
    // Count unanswered questions
    const unansweredCount = answers.filter(ans => ans.selected === null).length;

    // Update counter
    if (cachedElements.unansweredCountEl) {
        cachedElements.unansweredCountEl.textContent = `${unansweredCount} Sin Responder`;
    }

    // Enable/disable button based on unanswered count
    if (cachedElements.unansweredBtn) {
        if (unansweredCount > 0) {
            cachedElements.unansweredBtn.disabled = false;
            cachedElements.unansweredBtn.classList.remove('disabled');
        } else {
            cachedElements.unansweredBtn.disabled = true;
            cachedElements.unansweredBtn.classList.add('disabled');
        }
    }

    // Update sidebar list
    if (cachedElements.unansweredList) {
        cachedElements.unansweredList.innerHTML = '';
        answers.forEach((ans, idx) => {
            if (ans.selected === null) {
                const item = document.createElement('div');
                item.textContent = `Pregunta ${idx + 1}`;
                item.dataset.index = idx;
                item.addEventListener('click', () => {
                    // Jump to this question
                    currentIndex = idx;
                    loadQuestion();
                    updateNavButtons();
                    updateUnansweredSidebar();
                    // Highlight active item
                    const activeItems = cachedElements.unansweredList.querySelectorAll('div');
                    activeItems.forEach(div => {
                        div.classList.remove('active');
                    });
                    item.classList.add('active');
                });
                cachedElements.unansweredList.appendChild(item);
            }
        });
    }

    // Show/hide sidebar based on whether there are unanswered questions
    if (cachedElements.unansweredSidebar) {
        if (unansweredCount > 0) {
            cachedElements.unansweredSidebar.style.display = 'block';
        } else {
            cachedElements.unansweredSidebar.style.display = 'none';
        }
    }
}

// Show unanswered questions modal (kept for compatibility, but we'll use sidebar)

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    // Prevent interference with form inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
    }

    switch (e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            if (cachedElements.prevBtn && !cachedElements.prevBtn.disabled) {
                prevQuestion();
            }
            break;
        case 'ArrowRight':
            e.preventDefault();
            if (cachedElements.nextBtn && !cachedElements.nextBtn.disabled) {
                nextQuestion();
            }
            break;
        case 'Enter':
            e.preventDefault();
            // If we're in the quiz area and have options, try to submit
            if (cachedElements.quizDiv && !cachedElements.quizDiv.classList.contains('hidden') && document.activeElement !== document.body) {
                // Check if any option button is focused
                const focused = document.activeElement;
                if (focused.classList && focused.classList.contains('option-btn') && !focused.disabled) {
                    focused.click();
                }
            }
            break;
    }
});

// Start quiz
selectProportionalQuestions(allQuestions, TOTAL_QUESTIONS);
initQuiz();

// Button listeners (must be after initQuiz so cachedElements are populated)
if (cachedElements.prevBtn) {
    cachedElements.prevBtn.addEventListener('click', prevQuestion);
}
if (cachedElements.nextBtn) {
    cachedElements.nextBtn.addEventListener('click', nextQuestion);
}
if (cachedElements.unansweredBtn) {
    cachedElements.unansweredBtn.addEventListener('click', () => {
        updateUnansweredSidebar();
        // Scroll sidebar into view if needed
        if (cachedElements.unansweredSidebar) {
            cachedElements.unansweredSidebar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });
}
if (cachedElements.endBtn) {
    cachedElements.endBtn.addEventListener('click', endExam);
}
if (cachedElements.restartBtn) {
    cachedElements.restartBtn.addEventListener('click', restartExam);
}
