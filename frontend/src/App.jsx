import React, { useState, useEffect } from 'react';

export default function App() {
  const [role, setRole] = useState('Python Backend Engineer');
  const [topic, setTopic] = useState('PostgreSQL Indexing & RAG Architecture');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [question, setQuestion] = useState('');
  const [hints, setHints] = useState([]);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  
  // New Feature States
  const [isRecording, setIsRecording] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHints, setShowHints] = useState(false);

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isTimerActive) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  // Start Session
  const handleStart = async () => {
    setLoading(true);
    setFeedback(null);
    setAnswer('');
    setShowHints(false);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, topic, difficulty })
      });
      const data = await res.json();
      setQuestion(data.question);
      setHints(data.hints || []);
      setTimer(0);
      setIsTimerActive(true);
    } catch (err) {
      alert("Failed to connect to backend server!");
    }
    setLoading(false);
  };

  // Evaluate Response
  const handleEvaluate = async () => {
    setLoading(true);
    setIsTimerActive(false);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, topic, question, user_answer: answer })
      });
      const data = await res.json();
      setFeedback(data);

      // Save session to history
      setHistory((prev) => [
        {
          id: Date.now(),
          question,
          score: data.overall_score,
          timeSpent: formatTime(timer),
          role,
          topic
        },
        ...prev
      ]);
    } catch (err) {
      alert("Evaluation failed. Check backend connection.");
    }
    setLoading(false);
  };

  // Feature 1: Speech-to-Text (Voice Input)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser speech recognition not supported. Please use Chrome or Edge.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setAnswer((prev) => prev + ' ' + transcript);
    };

    recognition.start();
  };

  // Feature 2: Text-to-Speech (Read Question Aloud)
  const speakQuestion = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(question);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center font-sans">
      <div className="max-w-4xl w-full glass-panel p-6 md:p-8 rounded-3xl shadow-2xl space-y-6 border border-slate-800 relative overflow-hidden">
        
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/20">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                AI Interview Studio Pro
              </h1>
              <p className="text-xs text-slate-400">Speech-Enabled Multi-Criteria Evaluation Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isTimerActive && (
              <span className="text-xs font-mono bg-indigo-950 border border-indigo-500/40 px-3.5 py-1.5 rounded-full text-indigo-300 animate-pulse">
                ⏱️ {formatTime(timer)}
              </span>
            )}
            {history.length > 0 && (
              <span className="text-xs font-bold bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-full text-slate-300">
                Sessions: {history.length}
              </span>
            )}
          </div>
        </div>

        {/* Configuration Setup Form */}
        {!question ? (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase font-extrabold tracking-wider text-indigo-400 mb-2">Target Job Role</label>
                <input 
                  type="text" 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)} 
                  className="w-full bg-slate-950/90 border border-slate-800 focus:border-indigo-500 p-3.5 rounded-xl text-white focus:outline-none transition-all shadow-inner"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-extrabold tracking-wider text-indigo-400 mb-2">Difficulty Level</label>
                <select 
                  value={difficulty} 
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-slate-950/90 border border-slate-800 focus:border-indigo-500 p-3.5 rounded-xl text-white focus:outline-none transition-all"
                >
                  <option>Junior</option>
                  <option>Intermediate</option>
                  <option>Senior / Tech Lead</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-extrabold tracking-wider text-indigo-400 mb-2">Technical Topic</label>
              <input 
                type="text" 
                value={topic} 
                onChange={(e) => setTopic(e.target.value)} 
                className="w-full bg-slate-950/90 border border-slate-800 focus:border-indigo-500 p-3.5 rounded-xl text-white focus:outline-none transition-all shadow-inner"
              />
            </div>

            <button 
              onClick={handleStart} 
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-indigo-900/30 active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? '⚡ Initializing Studio...' : '🚀 Start Mock Interview'}
            </button>
          </div>
        ) : (
          /* Question & Answer Working Space */
          <div className="space-y-5">
            <div className="p-5 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-950 border border-indigo-500/20 rounded-2xl space-y-3 relative">
              <div className="flex justify-between items-center text-xs font-bold uppercase text-indigo-300">
                <span className="flex items-center gap-1.5">💡 Interview Question</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={speakQuestion}
                    className="bg-indigo-900/60 hover:bg-indigo-800 text-indigo-300 px-2.5 py-1 rounded-md text-xs font-semibold border border-indigo-500/30 transition flex items-center gap-1"
                  >
                    🔊 Listen
                  </button>
                  <span className="bg-indigo-500/20 px-2.5 py-1 rounded-full border border-indigo-500/30 text-indigo-300">{difficulty} • {topic}</span>
                </div>
              </div>
              <p className="text-base md:text-lg text-slate-100 font-medium leading-relaxed">{question}</p>
              
              {/* Collapsible Hints Panel */}
              <div className="pt-2 border-t border-slate-800">
                <button 
                  onClick={() => setShowHints(!showHints)}
                  className="text-xs text-indigo-400 hover:underline font-bold flex items-center gap-1"
                >
                  {showHints ? '🙈 Hide STAR Framework Hints' : '💡 Show Answer Structuring Hints'}
                </button>
                {showHints && (
                  <ul className="mt-2 space-y-1 text-xs text-slate-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    {hints.map((hint, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="text-indigo-400 font-bold">•</span> {hint}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Answer Input Area with Speech-to-Text */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <label className="text-xs uppercase font-extrabold tracking-wider text-indigo-400">Technical Answer</label>
                  <button 
                    onClick={toggleSpeechRecognition}
                    className={`text-xs px-2.5 py-1 rounded-md border font-bold flex items-center gap-1 transition ${
                      isRecording 
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' 
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    🎤 {isRecording ? 'Listening... (Click to Stop)' : 'Dictate Answer'}
                  </button>
                </div>
                <span className="text-xs text-slate-400 font-mono bg-slate-900 px-2.5 py-0.5 rounded-md border border-slate-800">{wordCount} words</span>
              </div>
              <textarea
                rows="6"
                placeholder="Type or dictate your response here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full bg-slate-950/90 border border-slate-800 focus:border-indigo-500 p-4 rounded-2xl text-white focus:outline-none transition-all shadow-inner leading-relaxed"
              />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={handleEvaluate} 
                disabled={loading || !answer.trim()}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-emerald-900/30 disabled:opacity-50"
              >
                {loading ? '🧠 Evaluating Answer...' : '✨ Submit for AI Evaluation'}
              </button>
              <button 
                onClick={() => { setQuestion(''); setFeedback(null); setIsTimerActive(false); setAnswer(''); }}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold px-5 rounded-xl transition border border-slate-800"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Multi-Criteria Evaluation Results Card */}
        {feedback && (
          <div className="p-6 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-6 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-black text-lg text-emerald-400">Evaluation Scorecard</h3>
                <p className="text-xs text-slate-400">Comprehensive AI Feedback Report</p>
              </div>
              <div className="px-4 py-2 rounded-2xl border font-black text-lg bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                Score: {feedback.overall_score}/10
              </div>
            </div>

            {/* Sub-Score Bars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>ACCURACY</span>
                  <span className="text-blue-400">{feedback.accuracy_score}/10</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${feedback.accuracy_score * 10}%` }} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>CLARITY</span>
                  <span className="text-purple-400">{feedback.clarity_score}/10</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${feedback.clarity_score * 10}%` }} />
                </div>
              </div>

              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>TECH DEPTH</span>
                  <span className="text-pink-400">{feedback.depth_score}/10</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-pink-500 h-full rounded-full" style={{ width: `${feedback.depth_score * 10}%` }} />
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-2">
              <h4 className="text-xs uppercase font-extrabold text-emerald-400">✅ Strengths</h4>
              <ul className="space-y-1 text-sm text-slate-300 list-disc list-inside">
                {feedback.strengths?.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-2">
              <h4 className="text-xs uppercase font-extrabold text-amber-400">🎯 Recommended Improvements</h4>
              <ul className="space-y-1 text-sm text-slate-300 list-disc list-inside">
                {feedback.improvements?.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <h4 className="text-xs uppercase font-extrabold text-indigo-400">📘 Model Answer Guide</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{feedback.model_answer}</p>
            </div>
          </div>
        )}

        {/* Historical Sessions Side Panel */}
        {history.length > 0 && (
          <div className="p-5 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-3">
            <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">📊 Previous Practice Sessions</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {history.map((item) => (
                <div key={item.id} className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-200 block">{item.role} • {item.topic}</span>
                    <span className="text-slate-400">Duration: {item.timeSpent}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md font-bold ${
                    item.score >= 8 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {item.score}/10
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}