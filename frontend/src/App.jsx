import React, { useState, useRef, useEffect } from 'react';
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
  CheckCircle2,
  MessageSquare,
  Send,
  User,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './App.css';

const API_BASE = 'http://localhost:5001';

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

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: 'Hello! I am the Master Orchestrator. Once you run a simulation, I can help you dive deeper into the strategy. Or just tell me your idea here!' }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

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

      // Auto-add synthesis to chat
      if (response.data.master_synthesis?.message) {
        setChatMessages(prev => [...prev, { role: 'assistant', text: response.data.master_synthesis.message }]);
      }
    } catch (error) {
      console.error('Simulation failed', error);
      const msg = error.response?.data?.error || error.message || 'Unknown Error';
      setErrorMessage(`Error: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const sendChatMessage = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/chat`, {
        message: userMsg,
        context: results
      });

      if (response.data.message) {
        setChatMessages(prev => [...prev, { role: 'assistant', text: response.data.message }]);
      }
    } catch (error) {
      console.error('Chat failed', error);
      setChatMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I encountered an error connecting to the brain.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
      {/* Sidebar Area */}
      <aside className="lg:w-1/3 flex flex-col gap-6">
        <header className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30">
            <Rocket className="text-white w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-indigo-950">DataDogs</h1>
            <p className="text-indigo-400 text-xs font-bold uppercase tracking-tighter">AI Product OS</p>
          </div>
        </header>

        {/* Input Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card bright-panel shadow-2xl"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-900">
            <Zap className="text-indigo-600 w-5 h-5" />
            Validate Concept
          </h2>

          <div className="mb-6">
            <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2 block">Quick Examples</label>
            <div className="flex flex-wrap gap-2">
              {examples.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => { setProductIdea(ex); runSimulation(ex); }}
                  className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full border border-indigo-200 transition-all font-semibold"
                >
                  Ex {i + 1}
                </button>
              ))}
            </div>
          </div>

          <textarea
            className="input-field h-32 mb-4 text-sm"
            placeholder="What's your product idea?"
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
            className="glow-button w-full flex items-center justify-center gap-2 py-4 shadow-xl text-sm"
            onClick={() => runSimulation()}
            disabled={isLoading || !productIdea}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                Orchestrating Agents...
              </>
            ) : (
              'Analyze MVP'
            )}
          </button>
        </motion.div>

        {/* Status Indicators */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass-card bg-indigo-50/50 space-y-3"
            >
              {[
                { n: 1, t: 'Market Validation' },
                { n: 2, t: 'Financial Modeling' },
                { n: 3, t: 'GTM Sequencing' },
                { n: 4, t: 'Strategic Decision' }
              ].map((p) => (
                <div key={p.n} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${currentPhase >= p.n ? 'bg-indigo-500 text-white' : 'bg-white text-indigo-200 border border-indigo-100'
                    }`}>
                    {currentPhase > p.n ? <CheckCircle2 className="w-4 h-4" /> : p.n}
                  </div>
                  <span className={`text-sm ${currentPhase >= p.n ? 'text-indigo-900 font-bold' : 'text-indigo-300'}`}>{p.t}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Master Agent Chat Panel (Sidebar Column) */}
        <div className="glass-card flex-grow flex flex-col p-0 overflow-hidden min-h-[400px]">
          <div className="bg-indigo-600 p-4 flex items-center gap-2 text-white">
            <MessageSquare size={18} />
            <h3 className="font-bold text-sm">Master Chat</h3>
          </div>
          <div className="flex-grow overflow-y-auto p-4 space-y-4 max-h-[450px] custom-scrollbar">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-xs ${msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-indigo-50 text-indigo-900 rounded-tl-none border border-indigo-100'
                  }`}>
                  <div className="flex items-center gap-1 mb-1 opacity-60 font-bold uppercase text-[8px]">
                    {msg.role === 'user' ? <User size={8} /> : <Bot size={8} />}
                    {msg.role}
                  </div>
                  <div className={`chat-markdown ${msg.role === 'user' ? 'chat-markdown-user' : ''}`}>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-indigo-50 p-3 rounded-2xl rounded-tl-none border border-indigo-100">
                  <Loader2 className="animate-spin w-4 h-4 text-indigo-400" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={sendChatMessage} className="p-3 border-t border-indigo-50 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-grow bg-indigo-50/50 border-none rounded-lg px-4 py-2 text-xs focus:ring-1 focus:ring-indigo-400 focus:outline-none"
              />
              <button type="submit" className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <Send size={14} />
              </button>
            </div>
          </form>
        </div>
      </aside>

      {/* Results Canvas Area */}
      <section className="flex-grow">
        {!results && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 glass-card bg-white shadow-sm border-dashed border-2 border-indigo-100">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
              <Rocket className="w-12 h-12 text-indigo-200" />
            </div>
            <h2 className="text-2xl font-bold text-indigo-950 mb-2">Awaiting Intelligence</h2>
            <p className="text-indigo-400 max-w-sm mx-auto">Describe your MVP idea in the left panel to trigger the autonomous agent swarm.</p>
          </div>
        )}

        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 pb-20"
            >
              {/* Master Synthesis & Decision */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card bright-panel border-l-4 border-l-indigo-600 shadow-xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Zap size={120} />
                  </div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest px-2 py-1 bg-indigo-50 rounded">Final verdict</span>
                      <h2 className="text-3xl font-black text-indigo-950 mt-2">Strategic Recommendation</h2>
                    </div>
                    <div className={`text-4xl font-black px-4 py-2 rounded-xl border-4 ${results.final_decision?.decision === 'GO' ? 'border-emerald-500 text-emerald-600 bg-emerald-50' :
                      results.final_decision?.decision === 'WAIT' ? 'border-amber-500 text-amber-600 bg-amber-50' :
                        'border-red-500 text-red-600 bg-red-50'
                      }`}>
                      {results.final_decision?.decision}
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-indigo-900 font-medium leading-relaxed bg-indigo-50/30 p-4 rounded-xl border border-indigo-100/50 synthesis-markdown">
                      <ReactMarkdown>
                        {results.master_synthesis?.message || results.final_decision?.reasoning_summary || ''}
                      </ReactMarkdown>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-lg">
                      <div className="text-3xl font-black mb-1">{results.final_decision?.confidence_score}%</div>
                      <div className="text-[10px] opacity-80 font-bold uppercase tracking-wider">Confidence Score</div>
                    </div>
                    <div className="p-4 bg-white border border-indigo-100 rounded-2xl">
                      <div className="text-xs font-bold text-indigo-400 uppercase mb-2">Critical Contingencies</div>
                      <ul className="text-[10px] space-y-1 text-indigo-900 font-semibold">
                        {results.final_decision?.critical_contingencies?.slice(0, 3).map((c, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <ChevronRight size={10} className="mt-0.5 text-indigo-500 shrink-0" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Agent Insight Grid Preview */}
                <div className="grid grid-cols-1 gap-4">
                  <AgentCard
                    title="Market Context"
                    icon={<Search />}
                    data={results.phase1_validation?.market}
                    color="indigo"
                  />
                  <AgentCard
                    title="User Personas"
                    icon={<Users />}
                    data={results.phase1_validation?.customer}
                    color="sky"
                  />
                </div>
              </div>

              {/* Lower Grid for more Agents */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AgentCard
                  title="Competitive Intelligence"
                  icon={<ShieldCheck />}
                  data={results.phase1_validation?.competitors}
                  color="purple"
                />
                <AgentCard
                  title="Financial Model"
                  icon={<TrendingUp />}
                  data={results.phase2_financial?.revenue}
                  color="emerald"
                />
                <AgentCard
                  title="Product Features"
                  icon={<Zap />}
                  data={results.phase3_gtm?.features}
                  color="amber"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}

function AgentCard({ title, icon, data, color = "indigo" }) {
  const getTheme = () => {
    const themes = {
      indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
      sky: "text-sky-600 bg-sky-50 border-sky-100",
      purple: "text-purple-600 bg-purple-50 border-purple-100",
      emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
      amber: "text-amber-600 bg-amber-50 border-amber-100",
    };
    return themes[color] || themes.indigo;
  };

  const renderValue = (val) => {
    if (Array.isArray(val)) {
      return (
        <ul className="space-y-2 mt-1">
          {val.map((item, i) => (
            <li key={i} className="bg-white/60 p-2 rounded-lg border border-indigo-50/50 shadow-sm list-none">
              {typeof item === 'object' ? renderValue(item) : item}
            </li>
          ))}
        </ul>
      );
    }
    if (typeof val === 'object' && val !== null) {
      return (
        <div className="grid grid-cols-1 gap-2 mt-1">
          {Object.entries(val).map(([k, v]) => (
            <div key={k} className="p-2 bg-white/40 rounded-lg">
              <span className="text-[8px] font-black uppercase text-gray-500 block mb-1">{k.replace(/_/g, ' ')}</span>
              <div className="text-[10px] text-gray-700">{typeof v === 'object' ? renderValue(v) : String(v)}</div>
            </div>
          ))}
        </div>
      );
    }
    if (typeof val === 'string' && (val.includes('\n') || val.includes('**') || val.includes('- ') || val.length > 120)) {
      return (
        <div className="agent-markdown">
          <ReactMarkdown>{val}</ReactMarkdown>
        </div>
      );
    }
    return <span className="text-[11px] font-medium text-gray-700">{val}</span>;
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass-card p-5 bright-panel shadow-lg min-h-[200px]"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className={`p-2 rounded-lg ${getTheme().split(' ')[1]}`}>
          {React.cloneElement(icon, { size: 16, className: getTheme().split(' ')[0] })}
        </div>
        <h3 className="text-sm font-bold text-indigo-950 uppercase tracking-tight">{title}</h3>
      </div>
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {data ? (
          Object.entries(data).map(([key, value]) => (
            <div key={key} className="border-b border-indigo-50/50 pb-2 last:border-0">
              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                {key.replace(/_/g, ' ')}
              </span>
              {renderValue(value)}
            </div>
          ))
        ) : (
          <div className="text-xs text-indigo-300 italic">No data captured yet</div>
        )}
      </div>
    </motion.div>
  );
}

export default App;
