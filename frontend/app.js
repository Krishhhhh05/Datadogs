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
let activeCharts = []; // Track active charts for cleanup

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
    if (name) parts.push(`Product Name: ${name}`);
    if (idea) parts.push(`Description: ${idea}`);
    if (industry) parts.push(`Industry: ${industry}`);
    if (businessModel) parts.push(`Business Model: ${businessModel}`);
    if (targetAudience) parts.push(`Target Audience: ${targetAudience}`);
    if (fundingStage) parts.push(`Funding Stage: ${fundingStage}`);
    if (geography) parts.push(`Geographic Focus: ${geography}`);
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

    // Clear out old charts
    activeCharts.forEach(c => c.destroy());
    activeCharts = [];

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
        { id: 'industry', label: 'Industry' },
        { id: 'businessModel', label: 'Model' },
        { id: 'targetAudience', label: 'Audience' },
        { id: 'fundingStage', label: 'Stage' },
        { id: 'geography', label: 'Geography' },
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

    // ── Market Analysis ──────────────────────────────────────────────
    const market = validation?.market;
    if (market) {
        const mta = market.market_trend_analysis || market;
        html += `<div class="info-card">
            <h4>📊 Market Analysis</h4>`;
        if (mta.context) html += `<p class="card-context">${mta.context}</p>`;

        // Render Market Size Chart if available
        if (mta.market_size && Array.isArray(mta.market_size)) {
            setTimeout(() => {
                const ctx = document.createElement('canvas');
                const container = document.getElementById('validationCharts');
                const wrapper = document.createElement('div');
                wrapper.className = 'chart-wrapper';
                wrapper.innerHTML = '<h5>Market Size Estimates</h5>';
                wrapper.appendChild(ctx);
                container.appendChild(wrapper);

                const labels = mta.market_size.map(d => d.label);
                const data = mta.market_size.map(d => d.value);

                const chart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: labels,
                        datasets: [{
                            data: data,
                            backgroundColor: ['#667eea', '#764ba2', '#10b981'],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'bottom', labels: { color: '#cbd5e1' } }
                        }
                    }
                });
                activeCharts.push(chart);
            }, 50);
        }

        if (mta.market_conditions?.length) {
            html += `<div class="sub-section"><h5>Market Conditions</h5><div class="trend-grid">`;
            mta.market_conditions.forEach(mc => {
                html += `<div class="trend-card">
                    <div class="trend-name">${mc.trend || ''}</div>
                    ${mc.growth_rate ? `<span class="trend-badge">${mc.growth_rate}</span>` : ''}
                    ${mc.analysis ? `<p class="trend-analysis">${mc.analysis}</p>` : ''}
                </div>`;
            });
            html += `</div></div>`;
        }

        if (mta.predictive_analytics) {
            const pa = mta.predictive_analytics;
            html += `<div class="sub-section"><h5>Predictive Analytics</h5>
                <div class="metrics-row">
                    ${pa.forecast ? `<div class="metric-pill">${pa.forecast}</div>` : ''}
                    ${pa.probability !== undefined ? `<div class="metric-pill">Probability: ${Math.round(pa.probability * 100)}%</div>` : ''}
                    ${pa.confidence_level !== undefined ? `<div class="metric-pill">Confidence: ${pa.confidence_level}%</div>` : ''}
                </div></div>`;
        }
        html += `</div>`;
    }

    // ── Customer Personas ─────────────────────────────────────────────
    const customer = validation?.customer;
    if (customer) {
        const personas = customer.customers || [];
        html += `<div class="info-card"><h4>👥 Customer Personas</h4><div class="persona-grid">`;
        personas.forEach(c => {
            html += `<div class="persona-card">
                <div class="persona-header">
                    <span class="persona-name">${c.name || 'Persona'}</span>
                    ${c.persona_type ? `<span class="persona-type-badge">${c.persona_type}</span>` : ''}
                </div>
                ${c.demographics ? `<div class="demo-row">
                    ${c.demographics.age ? `<span>🎂 ${c.demographics.age}</span>` : ''}
                    ${c.demographics.income ? `<span>💼 ${c.demographics.income}</span>` : ''}
                    ${c.demographics.occupation ? `<span>🏢 ${c.demographics.occupation}</span>` : ''}
                </div>` : ''}
                ${c.pain_points?.length ? `<div class="tag-section">
                    <div class="tag-label">Pain Points</div>
                    ${c.pain_points.map(p => `<span class="tag tag-red">${p}</span>`).join('')}
                </div>` : ''}
                ${c.goals?.length ? `<div class="tag-section">
                    <div class="tag-label">Goals</div>
                    ${c.goals.map(g => `<span class="tag tag-green">${g}</span>`).join('')}
                </div>` : ''}
            </div>`;
        });
        html += `</div></div>`;
    }

    // ── Competitive Analysis ─────────────────────────────────────────
    const competitors = validation?.competitors;
    if (competitors) {
        const comps = competitors.competitors || competitors.competitor_scores || [];

        // Render Competitor Radar Chart if available
        if (competitors.competitor_scores && Array.isArray(competitors.competitor_scores)) {
            setTimeout(() => {
                const ctx = document.createElement('canvas');
                const container = document.getElementById('validationCharts');
                const wrapper = document.createElement('div');
                wrapper.className = 'chart-wrapper';
                wrapper.innerHTML = '<h5>Competitive Radar</h5>';
                wrapper.appendChild(ctx);
                container.appendChild(wrapper);

                const datasets = competitors.competitor_scores.map((c, i) => {
                    const isProduct = c.name === 'Proposed Product';
                    return {
                        label: c.name,
                        data: [c.price_score || 0, c.features_score || 0, c.usability_score || 0, c.brand_score || 0, c.innovation_score || 0],
                        backgroundColor: isProduct ? 'rgba(102, 126, 234, 0.4)' : `rgba(200, 200, 200, ${0.1 + (i * 0.1)})`,
                        borderColor: isProduct ? '#667eea' : '#cbd5e1',
                        borderWidth: 2
                    };
                });

                const chart = new Chart(ctx, {
                    type: 'radar',
                    data: {
                        labels: ['Price', 'Features', 'Usability', 'Brand', 'Innovation'],
                        datasets: datasets
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            r: {
                                angleLines: { color: 'rgba(255,255,255,0.1)' },
                                grid: { color: 'rgba(255,255,255,0.1)' },
                                pointLabels: { color: '#cbd5e1' },
                                ticks: { display: false, max: 10, min: 0 }
                            }
                        },
                        plugins: {
                            legend: { position: 'bottom', labels: { color: '#cbd5e1' } }
                        }
                    }
                });
                activeCharts.push(chart);
            }, 50);
        }

        html += `<div class="info-card"><h4>🎯 Competitive Analysis</h4><div class="comp-grid">`;
        comps.forEach(c => {
            if (!c.name || c.name === 'Proposed Product') return; // Skip if just score data for the product itself
            html += `<div class="comp-card">
                <div class="comp-name">${c.name || 'Competitor'}</div>
                ${c.description ? `<p class="comp-desc">${c.description}</p>` : ''}
                <div class="sw-row">
                    ${c.strengths?.length ? `<div class="sw-col">
                        <div class="sw-label sw-label-green">✅ Strengths</div>
                        <ul>${c.strengths.map(s => `<li>${s}</li>`).join('')}</ul>
                    </div>` : ''}
                    ${c.weaknesses?.length ? `<div class="sw-col">
                        <div class="sw-label sw-label-red">❌ Weaknesses</div>
                        <ul>${c.weaknesses.map(w => `<li>${w}</li>`).join('')}</ul>
                    </div>` : ''}
                </div>
            </div>`;
        });
        html += `</div></div>`;
    }

    // ── YFinance Competitor Financials Section ────────────────────────
    const compFin = validation?.competitors?.competitor_financials;
    if (compFin && compFin.length > 0) {
        // Stats card
        html += `<div class="info-card"><h4>📈 Competitor Financials <span class="badge-live">Live via Yahoo Finance</span></h4>
            <div class="comp-fin-grid">`;
        compFin.forEach(c => {
            html += `<div class="comp-fin-card">
                <div class="comp-fin-name">${c.symbol} — ${c.name}</div>
                <div class="comp-fin-meta">${c.industry || ''} · ${c.sector || ''} · ${c.country || ''}</div>
                <div class="comp-fin-stats">
                    <div><span class="fin-label">Market Cap</span><span class="fin-val">${c.marketCap_fmt || 'N/A'}</span></div>
                    <div><span class="fin-label">Revenue</span><span class="fin-val">${c.totalRevenue_fmt || 'N/A'}</span></div>
                    <div><span class="fin-label">Rev Growth</span><span class="fin-val">${c.revenueGrowth_fmt || 'N/A'}</span></div>
                    <div><span class="fin-label">Profit Margin</span><span class="fin-val">${c.profitMargins_fmt || 'N/A'}</span></div>
                    <div><span class="fin-label">Trailing P/E</span><span class="fin-val">${c.trailingPE ? c.trailingPE.toFixed(1) : 'N/A'}</span></div>
                    <div><span class="fin-label">Employees</span><span class="fin-val">${c.employeeCount ? c.employeeCount.toLocaleString() : 'N/A'}</span></div>
                    <div><span class="fin-label">52W Range</span><span class="fin-val">${c.fiftyTwoWeekLow && c.fiftyTwoWeekHigh ? '$' + c.fiftyTwoWeekLow + ' – $' + c.fiftyTwoWeekHigh : 'N/A'}</span></div>
                    <div><span class="fin-label">Beta</span><span class="fin-val">${c.beta ? c.beta.toFixed(2) : 'N/A'}</span></div>
                </div>
            </div>`;
        });
        html += `</div></div>`;

        // Render charts after HTML is inserted
        setTimeout(() => {
            const chartContainer = document.getElementById('validationCharts');

            // Chart 1: Market Cap Comparison (horizontal bar)
            const mcData = compFin.filter(c => c.marketCap);
            if (mcData.length > 0) {
                const ctx1 = document.createElement('canvas');
                const w1 = document.createElement('div');
                w1.className = 'chart-wrapper'; w1.innerHTML = '<h5>Market Cap Comparison</h5>';
                w1.appendChild(ctx1); chartContainer.appendChild(w1);
                const mcChart = new Chart(ctx1, {
                    type: 'bar',
                    data: {
                        labels: mcData.map(c => c.symbol),
                        datasets: [{
                            label: 'Market Cap ($B)', data: mcData.map(c => +(c.marketCap / 1e9).toFixed(2)),
                            backgroundColor: ['rgba(102,126,234,0.8)', 'rgba(118,75,162,0.8)', 'rgba(16,185,129,0.8)', 'rgba(245,158,11,0.8)'],
                            borderRadius: 5
                        }]
                    },
                    options: {
                        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                        scales: {
                            x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', callback: v => '$' + v + 'B' } },
                            y: { grid: { display: false }, ticks: { color: '#cbd5e1' } }
                        },
                        plugins: { legend: { display: false } }
                    }
                });
                activeCharts.push(mcChart);
            }

            // Chart 2: Revenue vs Gross Margin (grouped bars)
            const rvData = compFin.filter(c => c.totalRevenue);
            if (rvData.length > 0) {
                const ctx2 = document.createElement('canvas');
                const w2 = document.createElement('div');
                w2.className = 'chart-wrapper'; w2.innerHTML = '<h5>Revenue & Profit Margin</h5>';
                w2.appendChild(ctx2); chartContainer.appendChild(w2);
                const rvChart = new Chart(ctx2, {
                    data: {
                        labels: rvData.map(c => c.symbol),
                        datasets: [
                            {
                                type: 'bar', label: 'Revenue ($B)', data: rvData.map(c => +(c.totalRevenue / 1e9).toFixed(2)),
                                backgroundColor: 'rgba(102,126,234,0.7)', borderRadius: 4, yAxisID: 'y'
                            },
                            {
                                type: 'line', label: 'Profit Margin (%)', data: rvData.map(c => c.profitMargins ? +(c.profitMargins * 100).toFixed(1) : null),
                                borderColor: '#10b981', backgroundColor: 'transparent', tension: 0.3, borderWidth: 2, pointRadius: 5, yAxisID: 'y2'
                            }
                        ]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        scales: {
                            y: { position: 'left', grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', callback: v => '$' + v + 'B' } },
                            y2: { position: 'right', grid: { display: false }, ticks: { color: '#10b981', callback: v => v + '%' } },
                            x: { grid: { display: false }, ticks: { color: '#cbd5e1' } }
                        },
                        plugins: { legend: { position: 'top', labels: { color: '#cbd5e1' } } }
                    }
                });
                activeCharts.push(rvChart);
            }

            // Chart 3: 1-Year Stock Price History (multi-line market proxy)
            const histData = compFin.filter(c => c.priceHistory && c.priceHistory.length > 0);
            if (histData.length > 0) {
                const ctx3 = document.createElement('canvas');
                const w3 = document.createElement('div');
                w3.className = 'chart-wrapper'; w3.innerHTML = '<h5>1-Year Stock Price (Market Proxy)</h5>';
                w3.appendChild(ctx3); chartContainer.appendChild(w3);
                // Use dates from the longest dataset as labels
                const longest = histData.reduce((a, b) => a.priceHistory.length > b.priceHistory.length ? a : b);
                const dateLabels = longest.priceHistory.map(p => p.date);
                const colors = ['#667eea', '#10b981', '#f59e0b', '#ef4444'];
                const datasets = histData.map((c, i) => {
                    const dateMap = Object.fromEntries(c.priceHistory.map(p => [p.date, p.close]));
                    return {
                        label: c.symbol, data: dateLabels.map(d => dateMap[d] || null),
                        borderColor: colors[i % colors.length], backgroundColor: 'transparent',
                        tension: 0.3, borderWidth: 2, pointRadius: 0
                    };
                });
                const priceChart = new Chart(ctx3, {
                    type: 'line', data: { labels: dateLabels, datasets },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        scales: {
                            x: {
                                grid: { display: false }, ticks: {
                                    color: '#94a3b8', maxTicksLimit: 6,
                                    callback: (_, i) => dateLabels[i] ? dateLabels[i].slice(0, 7) : ''
                                }
                            },
                            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8', callback: v => '$' + v } }
                        },
                        plugins: { legend: { position: 'top', labels: { color: '#cbd5e1' } } }
                    }
                });
                activeCharts.push(priceChart);
            }
        }, 50);
    }

    // Clear old charts container and reset HTML
    const container = document.getElementById('validationCharts');
    if (container) container.innerHTML = '';
    document.getElementById('validationContent').innerHTML = html || '<p class="no-data">No validation data available.</p>';
}

function displayFinancial(financial) {
    const tab = document.getElementById('financialTab');
    let html = '';

    // ── Revenue Model ─────────────────────────────────────────────────
    const revenue = financial?.revenue;
    if (revenue) {
        const rm = revenue.revenue_model || revenue;

        // Render 5-year projection chart
        if (rm['5_year_projection'] && Array.isArray(rm['5_year_projection'])) {
            setTimeout(() => {
                const ctx = document.createElement('canvas');
                const container = document.getElementById('financialCharts');
                const wrapper = document.createElement('div');
                wrapper.className = 'chart-wrapper';
                wrapper.innerHTML = '<h5>5-Year Financial Projection</h5>';
                wrapper.appendChild(ctx);
                container.appendChild(wrapper);

                const proj = rm['5_year_projection'];
                const labels = proj.map(p => `Year ${p.year}`);
                const revenues = proj.map(p => p.revenue);
                const costs = proj.map(p => p.costs);

                const chart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                type: 'line',
                                label: 'Revenue ($)',
                                data: revenues,
                                borderColor: '#10b981',
                                backgroundColor: 'transparent',
                                tension: 0.3,
                                borderWidth: 3
                            },
                            {
                                type: 'bar',
                                label: 'Costs ($)',
                                data: costs,
                                backgroundColor: 'rgba(239, 68, 68, 0.6)',
                                borderRadius: 4
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                grid: { color: 'rgba(255,255,255,0.05)' },
                                ticks: { color: '#94a3b8', callback: value => '$' + (value / 1000) + 'k' }
                            },
                            x: {
                                grid: { display: false },
                                ticks: { color: '#94a3b8' }
                            }
                        },
                        plugins: {
                            legend: { position: 'top', labels: { color: '#cbd5e1' } }
                        }
                    }
                });
                activeCharts.push(chart);
            }, 50);
        }

        html += `<div class="info-card"><h4>💰 Revenue Model</h4>
            <div class="metrics-grid">
                ${rm.subscription_revenue !== undefined ? `<div class="metric-box">
                    <div class="metric-val">$${Number(rm.subscription_revenue).toLocaleString()}</div>
                    <div class="metric-label">Subscription Revenue</div>
                </div>` : ''}
                ${rm.total_revenue !== undefined ? `<div class="metric-box">
                    <div class="metric-val">$${Number(rm.total_revenue).toLocaleString()}</div>
                    <div class="metric-label">Total Revenue</div>
                </div>` : ''}
                ${rm.growth_rate ? `<div class="metric-box">
                    <div class="metric-val">${rm.growth_rate}</div>
                    <div class="metric-label">Growth Rate</div>
                </div>` : ''}
                ${rm.margin !== undefined ? `<div class="metric-box">
                    <div class="metric-val">${rm.margin}%</div>
                    <div class="metric-label">Margin</div>
                </div>` : ''}
            </div>
            ${rm.suggested_revenue_streams?.length ? `<div class="sub-section"><h5>Income Streams</h5><ul>${rm.suggested_revenue_streams.map(s => `<li>${s}</li>`).join('')}</ul></div>` : ''}
            ${rm.ltv_assumptions ? `<div class="sub-section"><h5>LTV Assumptions</h5><p>${rm.ltv_assumptions}</p></div>` : ''}
        </div>`;
    }

    // ── Pricing Tiers ─────────────────────────────────────────────────
    const pricing = financial?.pricing;
    if (pricing) {
        const tiers = pricing.pricing_tiers || [];
        html += `<div class="info-card"><h4>💵 Pricing Tiers</h4><div class="tier-grid">`;
        tiers.forEach((tier, i) => {
            html += `<div class="tier-card${i === 1 ? ' tier-featured' : ''}">
                <div class="tier-name">${tier.name || 'Tier'}</div>
                <div class="tier-price">$${tier.monthly_fee}<span>/mo</span></div>
                ${tier.features?.length ? `<ul class="tier-features">
                    ${tier.features.map(f => `<li>${f}</li>`).join('')}
                </ul>` : ''}
            </div>`;
        });
        html += `</div></div>`;
    }

    // ── Risk Assessment ───────────────────────────────────────────────
    const risk = financial?.risk;
    if (risk) {
        const ra = risk.risk_analysis || risk;
        html += `<div class="info-card"><h4>⚠️ Risk Assessment</h4>`;

        if (ra.potential_risks?.length || ra.risk_matrix?.length) {
            const risks = ra.risk_matrix || ra.potential_risks;

            // Render risk scatter/bubble chart
            if (ra.risk_matrix && Array.isArray(ra.risk_matrix)) {
                setTimeout(() => {
                    const ctx = document.createElement('canvas');
                    const container = document.getElementById('financialCharts');
                    const wrapper = document.createElement('div');
                    wrapper.className = 'chart-wrapper';
                    wrapper.innerHTML = '<h5>Risk Impact vs ProbabilityMatrix</h5>';
                    wrapper.appendChild(ctx);
                    container.appendChild(wrapper);

                    const datasets = ra.risk_matrix.map(r => ({
                        label: r.name,
                        data: [{ x: r.impact, y: r.probability, r: (r.impact + r.probability) / 12 }],
                        backgroundColor: r.impact > 70 ? 'rgba(239, 68, 68, 0.7)' : r.impact > 40 ? 'rgba(245, 158, 11, 0.7)' : 'rgba(16, 185, 129, 0.7)',
                    }));

                    const chart = new Chart(ctx, {
                        type: 'bubble',
                        data: { datasets: datasets },
                        options: {
                            responsive: true, maintainAspectRatio: false,
                            scales: {
                                x: { title: { display: true, text: 'Impact (1-100)', color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' }, min: 0, max: 100 },
                                y: { title: { display: true, text: 'Probability (1-100)', color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' }, min: 0, max: 100 }
                            },
                            plugins: {
                                legend: { display: false },
                                tooltip: {
                                    callbacks: { label: (ctx) => `${ctx.dataset.label}: Impact ${ctx.raw.x} / Prob ${ctx.raw.y}` }
                                }
                            }
                        }
                    });
                    activeCharts.push(chart);
                }, 50);
            }

            html += `<div class="risk-list">`;
            risks.forEach(r => {
                const title = r.name || r.description || 'Risk';
                const impact = r.impact || 0;
                const prob = r.probability !== undefined ? Math.round(r.probability * (r.probability <= 1 ? 100 : 1)) : 0;
                const level = impact >= 70 || (impact <= 10 && impact >= 7) ? 'high' : impact >= 40 || (impact <= 10 && impact >= 4) ? 'medium' : 'low';
                // normalize impact score for display
                const displayImpact = impact > 10 ? impact : impact * 10;

                html += `<div class="risk-item risk-${level}">
                    <p class="risk-desc"><strong>${title}</strong></p>
                    ${r.mitigation ? `<p class="risk-desc"><em>Mitigation:</em> ${r.mitigation}</p>` : ''}
                    <div class="risk-metrics">
                        <span class="risk-badge risk-badge-${level}">Impact ${displayImpact}/100</span>
                        <span class="risk-badge">Probability ${prob}%</span>
                    </div>
                </div>`;
            });
            html += `</div>`;
        }

        if (ra.mitigation_strategy) {
            html += `<div class="mitigation-box">
                <strong>General Strategy</strong>
                <div class="md-block">${marked.parse(ra.mitigation_strategy)}</div>
            </div>`;
        }
        html += `</div>`;
    }

    // Clear old charts container and reset HTML
    const container = document.getElementById('financialCharts');
    if (container) container.innerHTML = '';
    document.getElementById('financialContent').innerHTML = html || '<p class="no-data">No financial data available.</p>';
}

function displayGTM(gtm) {
    const tab = document.getElementById('gtmTab');
    let html = '';

    // ── GTM Strategy ──────────────────────────────────────────────────
    const strategy = gtm?.strategy;
    if (strategy) {
        const gs = strategy.gtm_strategy || strategy;
        html += `<div class="info-card"><h4>🚀 Go-to-Market Strategy</h4>`;

        if (gs.target_audience) {
            const ta = gs.target_audience;
            html += `<div class="sub-section"><h5>Target Audience</h5>`;
            if (ta.demographics?.length) {
                html += `<div class="tag-section"><div class="tag-label">Demographics</div>
                    ${ta.demographics.map(d => `<span class="tag tag-blue">${d}</span>`).join('')}</div>`;
            }
            if (ta.psychographics?.length) {
                html += `<div class="tag-section"><div class="tag-label">Psychographics</div>
                    ${ta.psychographics.map(p => `<span class="tag tag-purple">${p}</span>`).join('')}</div>`;
            }
            html += `</div>`;
        }

        if (gs.marketing_channels?.length) {
            html += `<div class="sub-section"><h5>Marketing Channels</h5>
                <div class="channel-list">
                    ${gs.marketing_channels.map(ch => `<span class="channel-chip">${ch}</span>`).join('')}
                </div></div>`;
        }

        if (gs.funnel_metrics && Array.isArray(gs.funnel_metrics)) {
            setTimeout(() => {
                const ctx = document.createElement('canvas');
                const container = document.getElementById('gtmCharts');
                const wrapper = document.createElement('div');
                wrapper.className = 'chart-wrapper';
                wrapper.innerHTML = '<h5>Funnel Metrics</h5>';
                wrapper.appendChild(ctx);
                container.appendChild(wrapper);

                const labels = gs.funnel_metrics.map(f => f.name);
                const data = gs.funnel_metrics.map(f => f.value);

                // Funnel colors graduating from blue to gray/dark
                const backgroundColors = [
                    'rgba(102, 126, 234, 0.8)', // Awareness (Top of funnel)
                    'rgba(118, 75, 162, 0.8)',  // Consideration
                    'rgba(16, 185, 129, 0.8)',  // Conversion
                    'rgba(245, 158, 11, 0.8)'   // Retention
                ];

                const chart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Users Remaining (%)',
                            data: data,
                            backgroundColor: backgroundColors.slice(0, data.length),
                            borderRadius: 4
                        }]
                    },
                    options: {
                        indexAxis: 'y', // Makes it a horizontal bar chart
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                beginAtZero: true,
                                max: 100, // Funnel starts at 100%
                                grid: { color: 'rgba(255,255,255,0.05)' },
                                ticks: { color: '#94a3b8', callback: value => value + '%' }
                            },
                            y: {
                                grid: { display: false },
                                ticks: { color: '#cbd5e1' }
                            }
                        },
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                callbacks: { label: (ctx) => `${ctx.raw}% remaining` }
                            }
                        }
                    }
                });
                activeCharts.push(chart);
            }, 50);
        } else if (gs.funnel_stages?.length) {
            // Fallback to text funnel if no metrics data
            html += `<div class="sub-section"><h5>Funnel Stages</h5>
                <div class="funnel">
                    ${gs.funnel_stages.map((stage, i) => `<div class="funnel-stage">
                        <span class="funnel-num">${i + 1}</span>
                        <span>${stage}</span>
                    </div>`).join('')}
                </div></div>`;
        }
        html += `</div>`;
    }

    // ── Feature Roadmap ───────────────────────────────────────────────
    const features = gtm?.features;
    if (features) {
        const roadmap = features.roadmap?.features || features.features || [];
        html += `<div class="info-card"><h4>✨ Feature Roadmap</h4>
            <div class="feature-list">`;
        [...roadmap].sort((a, b) => (a.priority || 99) - (b.priority || 99)).forEach(f => {
            const p = f.priority || '?';
            const pClass = p <= 2 ? 'priority-high' : p <= 4 ? 'priority-med' : 'priority-low';
            html += `<div class="feature-item">
                <span class="feature-priority ${pClass}">P${p}</span>
                <div class="feature-body">
                    <div class="feature-name">${f.name || 'Feature'}</div>
                    ${f.description ? `<div class="feature-desc">${f.description}</div>` : ''}
                </div>
            </div>`;
        });
        html += `</div></div>`;
    }

    // Clear old charts container and reset HTML
    const container = document.getElementById('gtmCharts');
    if (container) container.innerHTML = '';
    document.getElementById('gtmContent').innerHTML = html || '<p class="no-data">No GTM strategy data available.</p>';
}

function displayAgents(results) {
    const tab = document.getElementById('agentsTab');

    const agents = [
        { icon: '📊', name: 'Market Analyzer', role: 'Market trends & conditions', data: results.phase1_validation?.market },
        { icon: '👥', name: 'Customer Insight Specialist', role: 'User personas & pain points', data: results.phase1_validation?.customer },
        { icon: '🎯', name: 'Competitive Intelligence', role: 'Competitor benchmarking', data: results.phase1_validation?.competitors },
        { icon: '💰', name: 'Revenue Architect', role: 'Subscription & revenue model', data: results.phase2_financial?.revenue },
        { icon: '💵', name: 'Pricing Strategist', role: 'Pricing tiers & strategy', data: results.phase2_financial?.pricing },
        { icon: '⚠️', name: 'Risk Assessment Officer', role: 'Financial risk analysis', data: results.phase2_financial?.risk },
        { icon: '🚀', name: 'GTM Strategist', role: 'Go-to-market planning', data: results.phase3_gtm?.strategy },
        { icon: '✨', name: 'Product Roadmap Lead', role: 'Feature prioritization', data: results.phase3_gtm?.features },
        { icon: '⚖️', name: 'Launch Director', role: 'Final GO/NO-GO decision', data: results.final_decision },
        { icon: '🧠', name: 'Master Orchestrator', role: 'Executive synthesis', data: results.master_synthesis },
    ];

    let html = '<div class="agent-grid">';
    agents.forEach(a => {
        const done = !!a.data;
        const keys = done ? Object.keys(a.data) : [];
        const preview = done && keys.length
            ? keys.slice(0, 3).map(k => `<span class="agent-key">${k.replace(/_/g, ' ')}</span>`).join('')
            : '';

        html += `<div class="agent-card2${done ? '' : ' agent-card2-pending'}">
            <div class="agent2-header">
                <span class="agent2-icon">${a.icon}</span>
                <div>
                    <div class="agent2-name">${a.name}</div>
                    <div class="agent2-role">${a.role}</div>
                </div>
                <span class="agent2-status ${done ? 'status-complete' : 'status-pending'}">${done ? '✅' : '⏳'}</span>
            </div>
            ${preview ? `<div class="agent2-keys">${preview}</div>` : ''}
        </div>`;
    });
    html += '</div>';

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
