// API Configuration
const API_URL = 'http://localhost:5001';

// DOM Elements
const analyzeBtn = document.getElementById('analyzeBtn');
const productIdea = document.getElementById('productIdea');
const progressSection = document.getElementById('progressSection');
const resultsSection = document.getElementById('resultsSection');
const btnText = analyzeBtn.querySelector('.btn-text');
const btnLoader = analyzeBtn.querySelector('.btn-loader');

// State
let isAnalyzing = false;

// Event Listeners
analyzeBtn.addEventListener('click', analyzeProduct);

// Simulate phase updates (since we don't have WebSocket)
function simulatePhaseProgress() {
    const phases = document.querySelectorAll('.phase');

    // Phase 1
    setTimeout(() => updatePhaseStatus(phases[0], 'active', 'Analyzing...'), 500);
    setTimeout(() => updatePhaseStatus(phases[0], 'completed', 'Complete ✓'), 3000);

    // Phase 2
    setTimeout(() => updatePhaseStatus(phases[1], 'active', 'Calculating...'), 3000);
    setTimeout(() => updatePhaseStatus(phases[1], 'completed', 'Complete ✓'), 6000);

    // Phase 3
    setTimeout(() => updatePhaseStatus(phases[2], 'active', 'Planning...'), 6000);
    setTimeout(() => updatePhaseStatus(phases[2], 'completed', 'Complete ✓'), 9000);

    // Phase 4
    setTimeout(() => updatePhaseStatus(phases[3], 'active', 'Deciding...'), 9000);
    setTimeout(() => updatePhaseStatus(phases[3], 'completed', 'Complete ✓'), 12000);
}

function updatePhaseStatus(phase, status, text) {
    if (status === 'active') {
        phase.classList.add('active');
        phase.classList.remove('completed');
    } else if (status === 'completed') {
        phase.classList.remove('active');
        phase.classList.add('completed');
    }
    phase.querySelector('.phase-status').textContent = text;
}

async function analyzeProduct() {
    const idea = productIdea.value.trim();

    if (!idea) {
        alert('Please enter a product idea');
        return;
    }

    if (isAnalyzing) return;

    // Start analysis
    isAnalyzing = true;
    analyzeBtn.disabled = true;
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');

    // Show progress section
    progressSection.classList.remove('hidden');
    resultsSection.classList.add('hidden');

    // Reset phases
    const phases = document.querySelectorAll('.phase');
    phases.forEach(phase => {
        phase.classList.remove('active', 'completed');
        phase.querySelector('.phase-status').textContent = 'Waiting...';
    });

    // Simulate progress
    simulatePhaseProgress();

    try {
        const response = await fetch(`${API_URL}/simulate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ product_idea: idea })
        });

        if (!response.ok) {
            throw new Error('Analysis failed');
        }

        const results = await response.json();
        displayResults(results);

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to analyze product. Make sure the backend server is running on port 5000.');
    } finally {
        isAnalyzing = false;
        analyzeBtn.disabled = false;
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
    }
}

function displayResults(results) {
    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth' });

    // Display decision
    displayDecision(results.final_decision);

    // Display phase results
    displayValidation(results.phase1_validation);
    displayFinancial(results.phase2_financial);
    displayGTM(results.phase3_gtm);
    displayAgents(results.final_decision);
}

function displayDecision(decision) {
    const badge = document.getElementById('decisionBadge');
    const content = document.getElementById('decisionContent');

    // Set recommendation badge
    const recommendation = decision.recommendation?.toLowerCase() || 'maybe';
    badge.textContent = decision.recommendation || 'PENDING';
    badge.className = 'badge ' + (recommendation.includes('go') && !recommendation.includes('no') ? 'go' :
                                  recommendation.includes('no-go') ? 'no-go' : 'maybe');

    // Set content
    let html = '';

    if (decision.summary) {
        html += `<p><strong>Summary:</strong> ${decision.summary}</p>`;
    }

    if (decision.confidence_score) {
        html += `<p><strong>Confidence Score:</strong> ${decision.confidence_score}/100</p>`;
    }

    if (decision.key_insights && Array.isArray(decision.key_insights)) {
        html += `<p><strong>Key Insights:</strong></p><ul>`;
        decision.key_insights.forEach(insight => {
            html += `<li>${insight}</li>`;
        });
        html += `</ul>`;
    }

    if (decision.risks && Array.isArray(decision.risks)) {
        html += `<p><strong>Risks:</strong></p><ul>`;
        decision.risks.forEach(risk => {
            html += `<li>${risk}</li>`;
        });
        html += `</ul>`;
    }

    content.innerHTML = html || JSON.stringify(decision, null, 2);
}

function displayValidation(validation) {
    const tab = document.getElementById('validationTab');
    let html = '';

    // Market Analysis
    if (validation.market) {
        html += `<div class="info-card">
            <h4>📊 Market Analysis</h4>
            ${renderObject(validation.market)}
        </div>`;
    }

    // Customer Insights
    if (validation.customer) {
        html += `<div class="info-card">
            <h4>👥 Customer Insights</h4>
            ${renderObject(validation.customer)}
        </div>`;
    }

    // Competitive Analysis
    if (validation.competitors) {
        html += `<div class="info-card">
            <h4>🎯 Competitive Analysis</h4>
            ${renderObject(validation.competitors)}
        </div>`;
    }

    tab.innerHTML = html;
}

function displayFinancial(financial) {
    const tab = document.getElementById('financialTab');
    let html = '';

    // Revenue
    if (financial.revenue) {
        html += `<div class="info-card">
            <h4>💰 Revenue Projections</h4>
            ${renderObject(financial.revenue)}
        </div>`;
    }

    // Pricing
    if (financial.pricing) {
        html += `<div class="info-card">
            <h4>💵 Pricing Strategy</h4>
            ${renderObject(financial.pricing)}
        </div>`;
    }

    // Risk
    if (financial.risk) {
        html += `<div class="info-card">
            <h4>⚠️ Risk Assessment</h4>
            ${renderObject(financial.risk)}
        </div>`;
    }

    tab.innerHTML = html;
}

function displayGTM(gtm) {
    const tab = document.getElementById('gtmTab');
    let html = '';

    // Strategy
    if (gtm.strategy) {
        html += `<div class="info-card">
            <h4>🚀 Go-to-Market Strategy</h4>
            ${renderObject(gtm.strategy)}
        </div>`;
    }

    // Features
    if (gtm.features) {
        html += `<div class="info-card">
            <h4>✨ Feature Priorities</h4>
            ${renderObject(gtm.features)}
        </div>`;
    }

    tab.innerHTML = html;
}

function displayAgents(decision) {
    const tab = document.getElementById('agentsTab');
    let html = '<h4 style="margin-bottom: 1.5rem;">🤖 AI Agent Performance</h4>';

    if (decision.agent_credibility && Array.isArray(decision.agent_credibility)) {
        decision.agent_credibility.forEach(agent => {
            html += `
                <div class="agent-card">
                    <div class="agent-header">
                        <span class="agent-name">${agent.name || 'Unknown Agent'}</span>
                        <span class="credibility">Credibility: ${((agent.credibility_score || 1) * 100).toFixed(1)}%</span>
                    </div>
                    <div class="agent-role">${agent.role || 'AI Agent'}</div>
                </div>
            `;
        });
    } else {
        html += '<p>No agent data available.</p>';
    }

    tab.innerHTML = html;
}

function renderObject(obj) {
    if (typeof obj === 'string') {
        return `<p>${obj}</p>`;
    }

    if (Array.isArray(obj)) {
        return `<ul>${obj.map(item => `<li>${typeof item === 'object' ? JSON.stringify(item) : item}</li>`).join('')}</ul>`;
    }

    if (typeof obj === 'object' && obj !== null) {
        let html = '<div class="info-grid">';
        for (const [key, value] of Object.entries(obj)) {
            const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

            if (typeof value === 'object' && value !== null) {
                html += `<div class="info-item" style="grid-column: 1 / -1;">
                    <strong>${label}</strong>
                    ${renderObject(value)}
                </div>`;
            } else {
                html += `<div class="info-item">
                    <strong>${label}</strong>
                    <span>${value}</span>
                </div>`;
            }
        }
        html += '</div>';
        return html;
    }

    return `<p>${obj}</p>`;
}

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;

        // Update buttons
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update panes
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        document.getElementById(tab + 'Tab').classList.add('active');
    });
});
