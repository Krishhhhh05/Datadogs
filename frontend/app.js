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

function buildProductContext() {
    const name = document.getElementById('productName').value.trim();
    const idea = productIdea.value.trim();
    const industry = document.getElementById('industry').value;
    const businessModel = document.getElementById('businessModel').value;
    const targetAudience = document.getElementById('targetAudience').value;
    const fundingStage = document.getElementById('fundingStage').value;
    const geography = document.getElementById('geography').value;
    const launchTimeline = document.getElementById('launchTimeline').value;

    const parts = [];
    if (name)           parts.push(`Product Name: ${name}`);
    if (idea)           parts.push(`Description: ${idea}`);
    if (industry)       parts.push(`Industry: ${industry}`);
    if (businessModel)  parts.push(`Business Model: ${businessModel}`);
    if (targetAudience) parts.push(`Target Audience: ${targetAudience}`);
    if (fundingStage)   parts.push(`Funding Stage: ${fundingStage}`);
    if (geography)      parts.push(`Geographic Focus: ${geography}`);
    if (launchTimeline) parts.push(`Launch Timeline: ${launchTimeline}`);

    return parts.join('\n');
}

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
    const context = buildProductContext();

    if (!context) {
        alert('Please enter at least a product name or description');
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
            body: JSON.stringify({ product_idea: context })
        });

        if (!response.ok) {
            throw new Error('Analysis failed');
        }

        const results = await response.json();
        displayResults(results);

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to analyze product. Make sure the backend server is running on port 5001.');
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

    // Show product name badge
    const productName = document.getElementById('productName').value.trim();
    const nameBadge = document.getElementById('productNameBadge');
    if (productName) {
        nameBadge.textContent = productName;
        nameBadge.classList.remove('hidden');
    } else {
        nameBadge.classList.add('hidden');
    }

    // Show product meta (structured inputs)
    const metaFields = [
        { id: 'industry',       label: 'Industry' },
        { id: 'businessModel',  label: 'Model' },
        { id: 'targetAudience', label: 'Audience' },
        { id: 'fundingStage',   label: 'Stage' },
        { id: 'geography',      label: 'Geography' },
        { id: 'launchTimeline', label: 'Timeline' },
    ];
    const metaEl = document.getElementById('productMeta');
    const chips = metaFields
        .filter(f => document.getElementById(f.id).value)
        .map(f => `<span class="meta-chip"><strong>${f.label}:</strong> ${document.getElementById(f.id).value}</span>`)
        .join('');
    if (chips) {
        metaEl.innerHTML = chips;
        metaEl.classList.remove('hidden');
    } else {
        metaEl.classList.add('hidden');
    }

    // Display master synthesis
    displayMasterSynthesis(results.master_synthesis);

    // Display decision
    displayDecision(results.final_decision);

    // Display phase results
    displayValidation(results.phase1_validation);
    displayFinancial(results.phase2_financial);
    displayGTM(results.phase3_gtm);
    displayAgents(results);
}

function displayMasterSynthesis(synthesis) {
    const card = document.getElementById('synthesisCard');
    const content = document.getElementById('synthesisContent');
    if (!synthesis) { card.classList.add('hidden'); return; }

    const text = synthesis.message || synthesis.summary || (typeof synthesis === 'string' ? synthesis : null);
    if (text) {
        content.innerHTML = marked.parse(text);
        card.classList.remove('hidden');
    } else {
        card.classList.add('hidden');
    }
}

function displayDecision(decision) {
    const badge = document.getElementById('decisionBadge');
    const content = document.getElementById('decisionContent');

    // decision field is 'decision' (GO / NO-GO / WAIT)
    const verdict = (decision.decision || '').toUpperCase();
    badge.textContent = verdict || 'PENDING';
    badge.className = 'badge ' + (verdict === 'GO' ? 'go' : verdict === 'NO-GO' ? 'no-go' : 'maybe');

    let html = '';

    if (decision.confidence_score !== undefined) {
        html += `<p class="confidence-line"><strong>Confidence Score:</strong> <span class="confidence-value">${decision.confidence_score}/100</span></p>`;
    }

    if (decision.reasoning_summary) {
        html += `<div class="md-block">${marked.parse(decision.reasoning_summary)}</div>`;
    }

    if (decision.critical_contingencies && Array.isArray(decision.critical_contingencies)) {
        html += `<p><strong>Critical Contingencies:</strong></p><ul class="contingency-list">`;
        decision.critical_contingencies.forEach(c => {
            html += `<li>${marked.parseInline(c)}</li>`;
        });
        html += `</ul>`;
    }

    content.innerHTML = html || `<pre>${JSON.stringify(decision, null, 2)}</pre>`;
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

function displayAgents(results) {
    const tab = document.getElementById('agentsTab');
    let html = '<h4 style="margin-bottom: 1.5rem;">🤖 AI Agent Performance</h4>';

    // agents are embedded per-phase as keys; collect what we can
    const agentMap = [
        { name: 'Market Analyst',      phase: 'phase1_validation', key: 'market' },
        { name: 'Customer Analyst',    phase: 'phase1_validation', key: 'customer' },
        { name: 'Competitive Analyst', phase: 'phase1_validation', key: 'competitors' },
        { name: 'Revenue Modeler',     phase: 'phase2_financial',  key: 'revenue' },
        { name: 'Pricing Strategist',  phase: 'phase2_financial',  key: 'pricing' },
        { name: 'Risk Assessor',       phase: 'phase2_financial',  key: 'risk' },
        { name: 'GTM Strategist',      phase: 'phase3_gtm',        key: 'strategy' },
        { name: 'Feature Planner',     phase: 'phase3_gtm',        key: 'features' },
        { name: 'Launch Director',     phase: 'final_decision',    key: null },
        { name: 'Master Orchestrator', phase: 'master_synthesis',  key: null },
    ];

    agentMap.forEach(a => {
        const data = a.key ? results[a.phase]?.[a.key] : results[a.phase];
        const status = data ? '✅ Complete' : '⏳ No data';
        const statusClass = data ? 'status-complete' : 'status-pending';
        html += `
            <div class="agent-card">
                <div class="agent-header">
                    <span class="agent-name">${a.name}</span>
                    <span class="credibility ${statusClass}">${status}</span>
                </div>
                <div class="agent-role">${a.phase.replace(/_/g, ' ')} → ${a.key || 'output'}</div>
            </div>
        `;
    });

    tab.innerHTML = html;
}

function renderValue(val) {
    if (typeof val === 'string') {
        // Use markdown if it looks like it has markdown or is long
        if (val.includes('\n') || val.includes('**') || val.includes('- ') || val.includes('# ') || val.length > 100) {
            return `<div class="md-block">${marked.parse(val)}</div>`;
        }
        return `<span>${val}</span>`;
    }
    if (Array.isArray(val)) {
        return `<ul class="render-list">${val.map(item =>
            `<li>${typeof item === 'object' ? renderObject(item) : marked.parseInline(String(item))}</li>`
        ).join('')}</ul>`;
    }
    if (typeof val === 'object' && val !== null) {
        return renderObject(val);
    }
    return `<span>${val}</span>`;
}

function renderObject(obj) {
    if (typeof obj === 'string') {
        return renderValue(obj);
    }

    if (Array.isArray(obj)) {
        return renderValue(obj);
    }

    if (typeof obj === 'object' && obj !== null) {
        let html = '<div class="info-grid">';
        for (const [key, value] of Object.entries(obj)) {
            const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const isComplex = typeof value === 'object' && value !== null;
            html += `<div class="info-item${isComplex ? ' full-width' : ''}">
                <strong>${label}</strong>
                ${renderValue(value)}
            </div>`;
        }
        html += '</div>';
        return html;
    }

    return `<span>${obj}</span>`;
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
