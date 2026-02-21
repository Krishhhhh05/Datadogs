import React, { useState, useEffect } from 'react';
import {
  Rocket,
  Search,
  TrendingUp,
  ShieldCheck,
  Users,
  Zap,
  AlertTriangle,
  ChevronRight,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './App.css';

const API_BASE = 'http://localhost:5000';

const examples = [
  "A subscription-based AI pet health monitor that predicts illness from behavior data.",
  "An ESG-focused micro-investing app for Gen Z using automated tax-loss harvesting.",
  "A decentralized marketplace for renting idle GPU power for AI researchers.",
  "A smart kitchen assistant that generates recipes based on real-time fridge inventory."
];

function App() {
  const [productIdea, setProductIdea] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const runSimulation = async (idea = productIdea) => {
    if (!idea) return;
    setIsLoading(true);
    setResults(null);
    setErrorMessage('');
    setCurrentPhase(1);

    try {
      // Simulate phase transitions for better UX/visuals
      setTimeout(() => setCurrentPhase(2), 5000);
      setTimeout(() => setCurrentPhase(3), 10000);
      setTimeout(() => setCurrentPhase(4), 15000);

      const response = await axios.post(`${API_BASE}/simulate`, { product_idea: idea });
      setResults(response.data);
      setCurrentPhase(5);
    } catch (error) {
      console.error('Simulation failed', error);
      const msg = error.response?.data?.error || error.message || 'Unknown Error';
      setErrorMessage(`Error: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 w-full max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30">
            <Rocket className="text-white w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">DataDogs</h1>
            <p className="text-gray-400 text-sm">Product Launch Multi-Agent OS</p>
          </div>
        </div>
        <div className="agent-badge">v1.2 Prototype</div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Panel */}
        <section className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card bright-panel"
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-900">
              <Zap className="text-indigo-600 w-5 h-5" />
              Launch Your MVP
            </h2>

            <div className="mb-6">
              <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2 block">Quick Examples</label>
              <div className="flex flex-wrap gap-2">
                {examples.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => { setProductIdea(ex); runSimulation(ex); }}
                    className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full border border-indigo-200 transition-all"
                  >
                    Ex {i + 1}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              className="input-field h-40 mb-4"
              placeholder="Describe your product idea..."
              value={productIdea}
              onChange={(e) => setProductIdea(e.target.value)}
              disabled={isLoading}
            />

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg flex items-center gap-2 border border-red-100">
                <AlertTriangle className="w-4 h-4" />
                {errorMessage}
              </div>
            )}

            <button
              className="glow-button w-full flex items-center justify-center gap-2 py-3 shadow-xl"
              onClick={() => runSimulation()}
              disabled={isLoading || !productIdea}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  Orchestrating Agents...
                </>
              ) : (
                'Validate Concept'
              )}
            </button>
          </motion.div>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 space-y-4"
            >
              {[
                { n: 1, t: 'Market Validation' },
                { n: 2, t: 'Financial Modeling' },
                { n: 3, t: 'GTM Sequencing' },
                { n: 4, t: 'Strategic Decision' }
              ].map((p) => (
                <div key={p.n} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${currentPhase >= p.n ? 'bg-indigo-500 text-white' : 'bg-gray-800 text-gray-400'
                    }`}>
                    {currentPhase > p.n ? <CheckCircle2 className="w-5 h-5" /> : p.n}
                  </div>
                  <span className={currentPhase >= p.n ? 'text-white' : 'text-gray-500'}>{p.t}</span>
                </div>
              ))}
            </motion.div>
          )}
        </section>

        {/* Results Panel */}
        <section className="lg:col-span-2">
          {!results && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <Rocket className="w-20 h-20 mb-4" />
              <p className="text-xl">Enter a product idea to start the multi-agent analysis</p>
            </div>
          )}

          <AnimatePresence>
            {results && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Final Decision Card */}
                <div className="glass-card border-l-4 border-l-indigo-500">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold">Strategic Recommendation</h2>
                    <div className={`text-3xl font-black ${results.final_decision?.decision === 'GO' ? 'decision-go' :
                      results.final_decision?.decision === 'WAIT' ? 'decision-wait' : 'decision-nogo'
                      }`}>
                      {results.final_decision?.decision}
                    </div>
                  </div>
                  <p className="text-gray-300 italic mb-4">"{results.final_decision?.reasoning_summary}"</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <div className="text-indigo-400 font-bold">{results.final_decision?.confidence_score}%</div>
                      <div className="text-xs text-gray-500">Confidence</div>
                    </div>
                    {/* Add more metrics as needed */}
                  </div>
                </div>

                {/* Agent Insights Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AgentCard
                    title="Market Context"
                    icon={<Search />}
                    data={results.phase1_validation}
                  />
                  <AgentCard
                    title="Financial Projections"
                    icon={<TrendingUp />}
                    data={results.phase2_financial}
                  />
                  <AgentCard
                    title="Growth & Features"
                    icon={<Users />}
                    data={results.phase3_gtm}
                  />
                  <AgentCard
                    title="Risk Assessment"
                    icon={<ShieldCheck />}
                    data={results.phase2_financial?.risk}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}

function AgentCard({ title, icon, data }) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-2 mb-4 text-indigo-400">
        {React.cloneElement(icon, { size: 20 })}
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <div className="text-sm text-gray-400 space-y-2">
        {/* Highly simplified visualization of agent JSON */}
        {Object.entries(data || {}).map(([key, value]) => (
          <div key={key}>
            <div className="font-medium text-gray-300 uppercase text-xs">{key}</div>
            <pre className="text-indigo-200/70 overflow-hidden whitespace-pre-wrap">
              {typeof value === 'object' ? 'Analyzed' : value}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
