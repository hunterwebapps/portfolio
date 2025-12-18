/**
 * Spreadsheet-to-System Scorecard
 * Interactive scoring tool for 3PLs & Distributors
 */

// Category data with questions
const categories = [
    {
        id: 'order-to-ship',
        name: 'Order-to-Ship',
        icon: 'bi-truck',
        questions: [
            'Order intake is captured once (no re-keying from email/PDF/spreadsheets).',
            'Customer-specific routing, labeling, and packing rules are enforced automatically.',
            'Pick/pack tasks are system-directed (not printed lists or spreadsheet work queues).',
            'Shipping labels/manifests are generated from an integrated workflow (not copy/paste).',
            'Exceptions (shorts, substitutions, holds) are tracked in-system with clear resolution paths.'
        ]
    },
    {
        id: 'receiving-putaway',
        name: 'Receiving & Putaway',
        icon: 'bi-box-seam',
        questions: [
            'Inbound appointments/ASNs are captured and accessible to receiving teams.',
            'Receiving is scan-driven with system validation (SKU/lot/qty).',
            'Putaway rules are system-directed (locations, constraints, velocity).',
            'Discrepancies (over/short/damage) are logged and communicated without spreadsheets.'
        ]
    },
    {
        id: 'inventory-accuracy',
        name: 'Inventory Accuracy',
        icon: 'bi-clipboard-check',
        questions: [
            'Cycle counting is planned and executed in-system with variance reporting.',
            'Lot/serial/expiry tracking is supported where required (without manual logs).',
            'Inventory adjustments require reason codes/approvals and are auditable.',
            'Inventory status/holds (QA, quarantine, damaged) are managed consistently in-system.'
        ]
    },
    {
        id: 'billing-finance',
        name: 'Billing & Finance',
        icon: 'bi-currency-dollar',
        questions: [
            'Billable events (storage, handling, VAS) are captured automatically at the point of work.',
            'Customer invoices are generated from system data (minimal manual edits).',
            'Accessorials and exceptions (rework, relabel, special handling) are billed consistently.',
            'Disputes/chargebacks can be supported with system evidence (timestamps, scans, logs).'
        ]
    },
    {
        id: 'customer-slas',
        name: 'Customer Requirements & SLAs',
        icon: 'bi-people',
        questions: [
            'SLAs are defined and measured (cutoffs, ship windows, accuracy) by customer.',
            'New customer onboarding has a repeatable playbook and system configuration steps.',
            'Customer reporting requirements are met without manual spreadsheet assembly.'
        ]
    },
    {
        id: 'integrations',
        name: 'Integrations & Data Flow',
        icon: 'bi-diagram-3',
        questions: [
            'WMS/ERP/EDI/Shipping systems are integrated (near real-time, minimal manual transfers).',
            'Master data changes (items, UOMs, customers) have clear ownership and sync rules.',
            'Data quality checks exist (duplicates, missing fields) before data hits operations.',
            'Operational data is available for analytics without manual exports.'
        ]
    },
    {
        id: 'reporting',
        name: 'Reporting & Analytics',
        icon: 'bi-graph-up',
        questions: [
            'Daily operational KPIs are visible without manual spreadsheet consolidation.',
            'You can attribute labor/time to customers, workflows, or value-added services.',
            'Root-cause analysis is possible (where errors happened, who/when/why).'
        ]
    },
    {
        id: 'exception-management',
        name: 'Exception Management',
        icon: 'bi-exclamation-triangle',
        questions: [
            'Most "fires" are preventable with system guardrails and alerts (not tribal knowledge).',
            'There is a defined rollback/contingency for new process changes and system updates.'
        ]
    },
    {
        id: 'labor-productivity',
        name: 'Labor & Productivity',
        icon: 'bi-person-workspace',
        questions: [
            'Labor standards exist and are measured (units/hour, touches/order, dock-to-stock time).',
            'Work is balanced across waves/teams using system visibility (not ad hoc dispatch).'
        ]
    }
];

// Score button labels
const scoreLabels = ['Manual', 'Minimal', 'Hybrid', 'Mostly', 'Full'];

// State
const scores = {};
let totalQuestions = 0;
const STORAGE_KEY = 'hwa-scorecard-data';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeScores();
    renderAccordion();
    renderCategoryBars();
    setupEventListeners();
    loadFromStorage();
    setDefaultDate();
    updateAllDisplays();
    openInitialAccordion();
});

function initializeScores() {
    categories.forEach(category => {
        scores[category.id] = new Array(category.questions.length).fill(null);
        totalQuestions += category.questions.length;
    });
}

function saveToStorage() {
    try {
        const data = {
            scores: scores,
            company: document.getElementById('company-name')?.value || '',
            date: document.getElementById('assessment-date')?.value || ''
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn('Could not save to localStorage:', e);
    }
}

function loadFromStorage() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return;

        const data = JSON.parse(saved);

        // Restore scores
        if (data.scores) {
            Object.keys(data.scores).forEach(categoryId => {
                if (scores[categoryId]) {
                    scores[categoryId] = data.scores[categoryId];
                }
            });

            // Update UI to reflect restored scores
            categories.forEach(category => {
                scores[category.id].forEach((score, qIndex) => {
                    if (score !== null) {
                        const questionCard = document.getElementById(`question-${category.id}-${qIndex}`);
                        if (questionCard) {
                            const btn = questionCard.querySelector(`.score-btn[data-score="${score}"]`);
                            if (btn) {
                                btn.classList.add('selected');
                                questionCard.classList.add('answered');
                            }
                        }
                    }
                });
            });
        }

        // Restore company info
        if (data.company) {
            document.getElementById('company-name').value = data.company;
        }
        if (data.date) {
            document.getElementById('assessment-date').value = data.date;
        }
    } catch (e) {
        console.warn('Could not load from localStorage:', e);
    }
}

function clearStorage() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        console.warn('Could not clear localStorage:', e);
    }
}

function setDefaultDate() {
    const dateInput = document.getElementById('assessment-date');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
}

function renderAccordion() {
    const accordion = document.getElementById('scorecardAccordion');
    if (!accordion) return;

    // Render all accordions collapsed initially; openInitialAccordion() will open the right one after loading
    accordion.innerHTML = categories.map((category) => `
        <div class="accordion-item">
            <h2 class="accordion-header">
                <button class="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapse-${category.id}"
                        aria-expanded="false"
                        aria-controls="collapse-${category.id}">
                    <div class="category-header-content">
                        <div class="category-title">
                            <i class="${category.icon}" aria-hidden="true"></i>
                            <span>${category.name}</span>
                        </div>
                        <div class="category-progress-bar">
                            <div class="category-progress-fill" id="progress-${category.id}" style="width: 0%"></div>
                        </div>
                    </div>
                    <span class="category-score-badge" id="badge-${category.id}">0 / ${category.questions.length * 4}</span>
                </button>
            </h2>
            <div id="collapse-${category.id}"
                 class="accordion-collapse collapse"
                 data-bs-parent="#scorecardAccordion">
                <div class="accordion-body">
                    ${category.questions.map((question, qIndex) => renderQuestionCard(category, question, qIndex)).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

function openInitialAccordion() {
    // Check if any questions have been answered (has saved data)
    const hasAnyAnswers = categories.some(cat => scores[cat.id].some(s => s !== null));

    if (!hasAnyAnswers) {
        // No saved data - open first accordion
        const firstCollapse = document.getElementById(`collapse-${categories[0].id}`);
        if (firstCollapse) {
            const bsCollapse = new bootstrap.Collapse(firstCollapse, { toggle: false });
            bsCollapse.show();
        }
        return;
    }

    // Find first incomplete category
    for (const category of categories) {
        const hasUnanswered = scores[category.id].some(s => s === null);
        if (hasUnanswered) {
            const collapseEl = document.getElementById(`collapse-${category.id}`);
            if (collapseEl) {
                const bsCollapse = new bootstrap.Collapse(collapseEl, { toggle: false });
                bsCollapse.show();
            }
            return;
        }
    }

    // All categories complete - leave all closed
}

function renderQuestionCard(category, question, qIndex) {
    const questionNum = getQuestionNumber(category.id, qIndex);
    return `
        <div class="question-card" id="question-${category.id}-${qIndex}">
            <div class="question-number">Question ${questionNum} of ${totalQuestions}</div>
            <div class="question-text">${question}</div>
            <div class="score-buttons" role="group" aria-label="Score selection">
                ${[0, 1, 2, 3, 4].map(score => `
                    <button type="button"
                            class="score-btn score-${score}"
                            data-category="${category.id}"
                            data-question="${qIndex}"
                            data-score="${score}"
                            aria-label="Score ${score}: ${scoreLabels[score]}">
                        <span class="score-value">${score}</span>
                        <span class="score-btn-label">${scoreLabels[score]}</span>
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

function getQuestionNumber(categoryId, qIndex) {
    let num = 0;
    for (const cat of categories) {
        if (cat.id === categoryId) {
            return num + qIndex + 1;
        }
        num += cat.questions.length;
    }
    return num;
}

function renderCategoryBars() {
    const container = document.getElementById('category-bars');
    if (!container) return;

    container.innerHTML = categories.map(category => `
        <div class="category-bar" id="bar-${category.id}">
            <div class="category-bar-label">
                <span class="category-bar-name">${category.name}</span>
                <span class="category-bar-score" id="bar-score-${category.id}">0%</span>
            </div>
            <div class="category-bar-track">
                <div class="category-bar-fill" id="bar-fill-${category.id}" style="width: 0%"></div>
            </div>
        </div>
    `).join('');
}

function setupEventListeners() {
    // Score buttons
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.score-btn');
        if (btn) {
            handleScoreClick(btn);
        }
    });

    // Reset buttons (top and bottom)
    document.querySelectorAll('.reset-scorecard-btn').forEach(btn => {
        btn.addEventListener('click', resetScorecard);
    });

    // Company info fields - save on change
    const companyInput = document.getElementById('company-name');
    const dateInput = document.getElementById('assessment-date');

    if (companyInput) companyInput.addEventListener('input', saveToStorage);
    if (dateInput) dateInput.addEventListener('change', saveToStorage);

    // Submit button
    const submitBtn = document.getElementById('submit-results-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', openSubmitModal);
    }

    // Confirm submit button
    const confirmSubmitBtn = document.getElementById('confirm-submit-btn');
    if (confirmSubmitBtn) {
        confirmSubmitBtn.addEventListener('click', handleSubmit);
    }

    // Phone number mask
    const phoneInput = document.getElementById('submit-phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', handlePhoneMask);
    }

    // Submit on Enter key in email/phone fields
    const submitEmailInput = document.getElementById('submit-email');
    if (submitEmailInput) {
        submitEmailInput.addEventListener('keydown', handleModalEnterKey);
        submitEmailInput.addEventListener('input', updateModalSubmitButton);
    }
    if (phoneInput) {
        phoneInput.addEventListener('keydown', handleModalEnterKey);
    }

    // Accordion manual click - scroll to show category header
    const accordion = document.getElementById('scorecardAccordion');
    if (accordion) {
        accordion.addEventListener('shown.bs.collapse', (e) => {
            const collapseEl = e.target;
            const accordionItem = collapseEl.closest('.accordion-item');
            if (accordionItem) {
                scrollToAccordionItem(accordionItem);
            }
        });
    }
}

function scrollToAccordionItem(accordionItem) {
    // Get the sticky legend height for offset (legend + previous category + padding)
    const legend = document.querySelector('.scoring-legend');
    const legendHeight = legend ? legend.offsetHeight : 80;
    const previousCategoryHeight = 70; // Space to show previous collapsed category
    const offset = legendHeight + previousCategoryHeight + 32;

    const rect = accordionItem.getBoundingClientRect();
    const scrollTop = window.pageYOffset + rect.top - offset;

    window.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
    });
}

function handleScoreClick(btn) {
    const categoryId = btn.dataset.category;
    const questionIndex = parseInt(btn.dataset.question);
    const score = parseInt(btn.dataset.score);

    // Update state
    scores[categoryId][questionIndex] = score;

    // Update UI - remove selected from siblings
    const questionCard = btn.closest('.question-card');
    questionCard.querySelectorAll('.score-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');

    // Mark question as answered
    questionCard.classList.add('answered');

    // Update all displays
    updateAllDisplays();

    // Save to localStorage
    saveToStorage();

    // Auto-advance to next unanswered question (optional smooth UX)
    autoAdvanceToNext(categoryId, questionIndex);
}

function autoAdvanceToNext(currentCategoryId, currentQuestionIndex) {
    // Find next unanswered question in current category
    const currentScores = scores[currentCategoryId];
    for (let i = currentQuestionIndex + 1; i < currentScores.length; i++) {
        if (currentScores[i] === null) {
            // Stay in current category, scroll to question
            const nextQuestion = document.getElementById(`question-${currentCategoryId}-${i}`);
            if (nextQuestion) {
                setTimeout(() => {
                    nextQuestion.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 200);
            }
            return;
        }
    }

    // Current category complete - find next incomplete category
    const currentCatIndex = categories.findIndex(c => c.id === currentCategoryId);
    for (let i = currentCatIndex + 1; i < categories.length; i++) {
        const cat = categories[i];
        if (scores[cat.id].some(s => s === null)) {
            // Open this category's accordion (scroll handled by global shown.bs.collapse listener)
            const collapseEl = document.getElementById(`collapse-${cat.id}`);
            if (collapseEl) {
                const bsCollapse = new bootstrap.Collapse(collapseEl, { toggle: false });
                bsCollapse.show();
            }
            return;
        }
    }
}

function updateAllDisplays() {
    updateCategoryDisplays();
    updateOverallScore();
    updateQuestionsProgress();
    updateSubmitButton();
    updateGuidanceText();
}

function updateCategoryDisplays() {
    categories.forEach(category => {
        const categoryScores = scores[category.id];
        const answered = categoryScores.filter(s => s !== null);
        const totalScore = answered.reduce((sum, s) => sum + s, 0);
        const maxScore = category.questions.length * 4;
        const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

        // Update accordion progress bar
        const progressFill = document.getElementById(`progress-${category.id}`);
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }

        // Update accordion badge
        const badge = document.getElementById(`badge-${category.id}`);
        if (badge) {
            badge.textContent = `${totalScore} / ${maxScore}`;
        }

        // Update results panel bar
        const barScore = document.getElementById(`bar-score-${category.id}`);
        const barFill = document.getElementById(`bar-fill-${category.id}`);
        if (barScore) {
            barScore.textContent = `${percentage}%`;
        }
        if (barFill) {
            barFill.style.width = `${percentage}%`;
            barFill.className = 'category-bar-fill ' + getColorClass(percentage);
        }
    });
}

function getColorClass(percentage) {
    if (percentage < 25) return 'low';
    if (percentage < 50) return 'medium-low';
    if (percentage < 65) return 'medium';
    if (percentage < 80) return 'medium-high';
    return 'high';
}

function updateOverallScore() {
    let totalScore = 0;
    let maxScore = 0;

    categories.forEach(category => {
        const categoryScores = scores[category.id];
        totalScore += categoryScores.filter(s => s !== null).reduce((sum, s) => sum + s, 0);
        maxScore += category.questions.length * 4;
    });

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    // Update gauge
    const gaugeValue = document.getElementById('overall-score');
    const gaugeProgress = document.querySelector('.gauge-progress');

    if (gaugeValue) {
        gaugeValue.textContent = percentage;
    }

    if (gaugeProgress) {
        // Calculate stroke-dashoffset (full circle = 339.292)
        const circumference = 339.292;
        const offset = circumference - (percentage / 100) * circumference;
        gaugeProgress.style.strokeDashoffset = offset;

        // Update color based on maturity
        gaugeProgress.style.stroke = getMaturityColor(percentage);
    }

    // Update maturity badge
    const maturityBadge = document.getElementById('maturity-badge');
    const maturityLevel = document.getElementById('maturity-level');
    const maturity = getMaturityLevel(percentage);

    if (maturityLevel) {
        maturityLevel.textContent = maturity.label;
    }

    if (maturityBadge) {
        maturityBadge.className = 'maturity-badge ' + maturity.class;
    }

    // Update modal displays
    const modalScore = document.getElementById('modal-overall-score');
    const modalMaturity = document.getElementById('modal-maturity-level');
    if (modalScore) modalScore.textContent = `${percentage} / 100`;
    if (modalMaturity) modalMaturity.textContent = maturity.label;
}

function getMaturityLevel(score) {
    if (score < 25) return { label: 'Spreadsheet-Driven', class: 'spreadsheet-driven' };
    if (score < 50) return { label: 'Hybrid', class: 'hybrid' };
    if (score < 75) return { label: 'System-Driven', class: 'system-driven' };
    return { label: 'Integrated', class: 'integrated' };
}

function getMaturityColor(score) {
    if (score < 25) return '#dc3545';
    if (score < 50) return '#fd7e14';
    if (score < 75) return '#0d6efd';
    return '#198754';
}

function updateQuestionsProgress() {
    let answered = 0;
    categories.forEach(category => {
        answered += scores[category.id].filter(s => s !== null).length;
    });

    const progressText = document.getElementById('questions-answered');
    const progressBar = document.getElementById('questions-progress');
    const percentage = Math.round((answered / totalQuestions) * 100);

    if (progressText) {
        progressText.textContent = `${answered} / ${totalQuestions}`;
    }
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }
}

function updateSubmitButton() {
    const submitBtn = document.getElementById('submit-results-btn');
    if (!submitBtn) return;

    let answered = 0;
    categories.forEach(category => {
        answered += scores[category.id].filter(s => s !== null).length;
    });

    // Enable submit if at least 50% answered
    const minRequired = Math.ceil(totalQuestions * 0.5);
    submitBtn.disabled = answered < minRequired;

    // Update button text based on completion
    if (answered === totalQuestions) {
        submitBtn.innerHTML = '<i class="bi-send me-2" aria-hidden="true"></i>Get Free Analysis';
    } else if (answered >= minRequired) {
        submitBtn.innerHTML = '<i class="bi-send me-2" aria-hidden="true"></i>Get Free Analysis';
    }
}

function updateGuidanceText() {
    const guidanceText = document.getElementById('guidance-text');
    if (!guidanceText) return;

    let answered = 0;
    categories.forEach(category => {
        answered += scores[category.id].filter(s => s !== null).length;
    });

    if (answered === 0) {
        guidanceText.textContent = 'Complete the assessment to see personalized recommendations.';
        return;
    }

    // Calculate overall percentage
    let totalScore = 0;
    let maxScore = 0;
    categories.forEach(category => {
        totalScore += scores[category.id].filter(s => s !== null).reduce((sum, s) => sum + s, 0);
        maxScore += category.questions.length * 4;
    });
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    // Find lowest scoring categories
    const categoryPercentages = categories.map(cat => {
        const catScores = scores[cat.id];
        const answered = catScores.filter(s => s !== null);
        if (answered.length === 0) return { name: cat.name, percentage: null };
        const catTotal = answered.reduce((sum, s) => sum + s, 0);
        const catMax = cat.questions.length * 4;
        return { name: cat.name, percentage: Math.round((catTotal / catMax) * 100) };
    }).filter(c => c.percentage !== null)
      .sort((a, b) => a.percentage - b.percentage);

    if (categoryPercentages.length === 0) {
        guidanceText.textContent = 'Keep answering questions to build your assessment.';
        return;
    }

    const lowest = categoryPercentages[0];

    if (percentage < 25) {
        guidanceText.textContent = `Your operations are heavily spreadsheet-dependent. Focus on ${lowest.name} (${lowest.percentage}%) as your biggest opportunity for improvement.`;
    } else if (percentage < 50) {
        guidanceText.textContent = `You're in a hybrid state with room to grow. Prioritize ${lowest.name} (${lowest.percentage}%) to see the quickest gains.`;
    } else if (percentage < 75) {
        guidanceText.textContent = `You're mostly system-driven! Consider enhancing ${lowest.name} (${lowest.percentage}%) to reach full integration.`;
    } else {
        guidanceText.textContent = `Excellent! You're well-integrated. Fine-tune ${lowest.name} (${lowest.percentage}%) to achieve operational excellence.`;
    }
}

function resetScorecard() {
    if (!confirm('Are you sure you want to reset all scores? This cannot be undone.')) {
        return;
    }

    // Reset state
    categories.forEach(category => {
        scores[category.id] = new Array(category.questions.length).fill(null);
    });

    // Reset UI
    document.querySelectorAll('.score-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelectorAll('.question-card').forEach(card => card.classList.remove('answered'));

    // Reset company info
    document.getElementById('company-name').value = '';
    setDefaultDate();

    // Clear localStorage
    clearStorage();

    // Collapse all accordions except first
    categories.forEach((category, index) => {
        const collapseEl = document.getElementById(`collapse-${category.id}`);
        if (collapseEl) {
            const bsCollapse = new bootstrap.Collapse(collapseEl, { toggle: false });
            if (index === 0) {
                bsCollapse.show();
            } else {
                bsCollapse.hide();
            }
        }
    });

    // Update displays
    updateAllDisplays();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openSubmitModal() {
    const modal = new bootstrap.Modal(document.getElementById('submitModal'));
    const modalElement = document.getElementById('submitModal');

    // Reset modal state
    document.getElementById('submit-form-container').classList.remove('d-none');
    document.getElementById('submit-success').classList.add('d-none');
    document.getElementById('submit-error').classList.add('d-none');
    document.getElementById('modal-footer').classList.remove('d-none');
    document.getElementById('submit-email').value = '';
    document.getElementById('submit-phone').value = '';
    document.getElementById('confirm-submit-btn').disabled = true;

    // Autofocus email field when modal is shown
    modalElement.addEventListener('shown.bs.modal', function onShown() {
        document.getElementById('submit-email').focus();
        modalElement.removeEventListener('shown.bs.modal', onShown);
    });

    modal.show();
}

async function handleSubmit() {
    const emailInput = document.getElementById('submit-email');
    const email = emailInput.value.trim();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        emailInput.classList.add('is-invalid');
        return;
    }
    emailInput.classList.remove('is-invalid');

    // Show loading state
    const submitBtn = document.getElementById('confirm-submit-btn');
    const btnText = document.getElementById('submit-btn-text');
    const btnLoading = document.getElementById('submit-btn-loading');
    submitBtn.disabled = true;
    btnText.classList.add('d-none');
    btnLoading.classList.remove('d-none');

    // Gather data
    const companyName = document.getElementById('company-name').value || 'Not provided';
    const phone = document.getElementById('submit-phone').value || '';
    const assessmentDate = document.getElementById('assessment-date').value;

    // Calculate scores
    let totalScore = 0;
    let maxScore = 0;
    const categoryResults = [];

    categories.forEach(category => {
        const categoryScores = scores[category.id];
        const catTotal = categoryScores.filter(s => s !== null).reduce((sum, s) => sum + s, 0);
        const catMax = category.questions.length * 4;
        const catPercentage = catMax > 0 ? Math.round((catTotal / catMax) * 100) : 0;

        totalScore += catTotal;
        maxScore += catMax;

        // Include question-level details
        const questions = category.questions.map((questionText, idx) => ({
            text: questionText,
            score: categoryScores[idx]
        }));

        categoryResults.push({
            name: category.name,
            score: catTotal,
            max: catMax,
            percentage: catPercentage,
            questions: questions
        });
    });

    const overallPercentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const maturityLevel = getMaturityLevel(overallPercentage).label;

    // Build message
    const message = buildResultsMessage(companyName, assessmentDate, overallPercentage, maturityLevel, categoryResults);

    try {
        // Submit to Salesforce WebToLead
        webToLead(email, phone, companyName, message);

        // Submit to Azure email endpoint
        const response = await fetch('https://hunterwebservices-prod.azurewebsites.net/api/SendEmail', {
            method: 'POST',
            body: JSON.stringify({
                type: 'ScorecardSubmission',
                email: email,
                phone: phone,
                company: companyName,
                message: message,
                overallScore: overallPercentage,
                maturityLevel: maturityLevel,
                categoryResults: categoryResults
            }),
            mode: 'cors',
        });

        if (response.ok) {
            showSubmitSuccess();
        } else {
            showSubmitError();
        }
    } catch (error) {
        console.error('Submit error:', error);
        showSubmitError();
    }

    // Reset button state
    submitBtn.disabled = false;
    btnText.classList.remove('d-none');
    btnLoading.classList.add('d-none');
}

function buildResultsMessage(company, date, overallScore, maturityLevel, categoryResults) {
    let message = `SCORECARD SUBMISSION\n`;
    message += `====================\n\n`;
    message += `Company: ${company}\n`;
    message += `Date: ${date}\n\n`;
    message += `OVERALL RESULTS\n`;
    message += `---------------\n`;
    message += `Overall Score: ${overallScore}/100\n`;
    message += `Maturity Level: ${maturityLevel}\n\n`;
    message += `CATEGORY BREAKDOWN\n`;
    message += `------------------\n`;

    categoryResults.forEach(cat => {
        message += `${cat.name}: ${cat.percentage}% (${cat.score}/${cat.max})\n`;
    });

    // Add lowest scoring categories
    const sorted = [...categoryResults].sort((a, b) => a.percentage - b.percentage);
    message += `\nPRIORITY AREAS\n`;
    message += `--------------\n`;
    message += `1. ${sorted[0].name} (${sorted[0].percentage}%)\n`;
    if (sorted[1]) message += `2. ${sorted[1].name} (${sorted[1].percentage}%)\n`;
    if (sorted[2]) message += `3. ${sorted[2].name} (${sorted[2].percentage}%)\n`;

    return message;
}

function webToLead(email, phone, company, description) {
    const form = document.createElement('form');

    form.method = 'POST';
    form.action = 'https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8';
    form.target = 'salesforce';

    form.appendChild(createHiddenInput('oid', '00D8b000002byl2'));
    form.appendChild(createHiddenInput('retURL', 'https://hunterwebapps.dev/scorecard.html'));
    form.appendChild(createHiddenInput('debug', '1'));
    form.appendChild(createHiddenInput('debugEmail', 'hunter@hunterwebapps.com'));
    form.appendChild(createHiddenInput('email', email));
    form.appendChild(createHiddenInput('phone', phone));
    form.appendChild(createHiddenInput('company', company));
    form.appendChild(createHiddenInput('description', description));
    form.appendChild(createHiddenInput('lead_source', 'Scorecard'));

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}

function createHiddenInput(name, value) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    return input;
}

function handlePhoneMask(e) {
    const input = e.target;
    let value = input.value.replace(/\D/g, '');

    if (value.length > 10) {
        value = value.slice(0, 10);
    }

    if (value.length >= 6) {
        input.value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
    } else if (value.length >= 3) {
        input.value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
    } else if (value.length > 0) {
        input.value = `(${value}`;
    } else {
        input.value = '';
    }
}

function handleModalEnterKey(e) {
    if (e.key !== 'Enter') return;

    const email = document.getElementById('submit-email').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailRegex.test(email)) {
        e.preventDefault();
        handleSubmit();
    }
}

function updateModalSubmitButton() {
    const email = document.getElementById('submit-email').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const submitBtn = document.getElementById('confirm-submit-btn');

    submitBtn.disabled = !emailRegex.test(email);
}

function showSubmitSuccess() {
    document.getElementById('submit-form-container').classList.add('d-none');
    document.getElementById('submit-success').classList.remove('d-none');
    document.getElementById('modal-footer').classList.add('d-none');
}

function showSubmitError() {
    document.getElementById('submit-form-container').classList.add('d-none');
    document.getElementById('submit-error').classList.remove('d-none');
    document.getElementById('modal-footer').classList.add('d-none');
}
