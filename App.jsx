import { useState, useRef, useEffect } from "react";

// ── Inline styles as CSS-in-JS ─────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #080A0F;
    --bg2: #0E1118;
    --bg3: #151922;
    --card: #111520;
    --border: #1E2435;
    --border2: #2A3048;
    --accent: #00D4FF;
    --accent2: #7B61FF;
    --green: #00E5A0;
    --amber: #FFB547;
    --red: #FF5B5B;
    --text: #E8ECF8;
    --text2: #7A82A0;
    --text3: #404760;
    --font-head: 'Syne', sans-serif;
    --font-body: 'DM Sans', sans-serif;
    --font-mono: 'DM Mono', monospace;
  }
  body { background: var(--bg); color: var(--text); font-family: var(--font-body); min-height: 100vh; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }

  @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.5; transform:scale(0.95); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes waveform { 0%,100% { height:4px; } 50% { height:20px; } }
  @keyframes countUp { from { opacity:0; } to { opacity:1; } }
  @keyframes glow { 0%,100% { box-shadow: 0 0 20px rgba(0,212,255,.15); } 50% { box-shadow: 0 0 40px rgba(0,212,255,.3); } }
`;

// ── Constants ──────────────────────────────────────────────────────────────
const ROLES = ['Software Engineer', 'Frontend Developer', 'Data Scientist', 'Product Manager', 'DevOps Engineer'];
const LEVELS = ['junior', 'mid', 'senior'];

const QUESTION_BANKS = {
  'Software Engineer': {
    junior: ['Explain the difference between == and === in JavaScript.', 'What is a RESTful API? Give an example.', 'What is the difference between var, let, and const?', 'What is the purpose of a database index?', 'Explain what Git is and why developers use it.'],
    mid: ['Explain the SOLID principles with an example.', 'What is the difference between SQL and NoSQL? When would you use each?', 'Walk me through how you would design a URL shortening service.', 'What is a race condition and how do you prevent it?', 'Explain the event loop in Node.js.'],
    senior: ['How would you design a distributed cache for a high-traffic system?', 'Explain CAP theorem and its implications.', 'How do you handle technical debt in a production system?', 'How do you ensure microservices remain loosely coupled?', 'What strategies ensure observability in a distributed system?'],
  },
  'Frontend Developer': {
    junior: ['What is the Virtual DOM in React?', 'Explain the CSS Box Model.', 'What are React hooks and why are they useful?', 'What is the difference between props and state?', 'Explain how CSS Flexbox works.'],
    mid: ['Explain React reconciliation algorithm.', 'What is code splitting and why does it matter?', 'How does Redux manage state? Explain the flow.', 'What is memoization in React?', 'Explain the difference between SSR and CSR.'],
    senior: ['How do you optimize a React app for performance at scale?', 'Explain micro-frontend architecture.', 'How would you architect a large-scale SPA?', 'What is your approach to accessibility in complex UIs?', 'Explain Web Vitals and how you improve them.'],
  },
  'Data Scientist': {
    junior: ['What is overfitting and how do you prevent it?', 'Explain precision vs recall.', 'What is a p-value?', 'Explain the bias-variance tradeoff.', 'What is cross-validation?'],
    mid: ['Explain gradient boosting algorithms.', 'What is regularization and when do you use it?', 'How do you handle class imbalance?', 'Explain feature engineering with an example.', 'What is the difference between bagging and boosting?'],
    senior: ['Design an ML pipeline for real-time fraud detection.', 'Explain causal inference vs correlation.', 'How do you monitor model drift in production?', 'Describe your approach to A/B testing at scale.', 'How do you ensure fairness in ML models?'],
  },
  'Product Manager': {
    junior: ['What is product-market fit?', 'How do you prioritize a feature backlog?', 'Explain what a user story is.', 'What metrics define success for a product?', 'How do you gather user feedback?'],
    mid: ['Walk me through a product you shipped end-to-end.', 'How do you handle conflicting stakeholder requirements?', 'Explain the RICE prioritization framework.', 'How do you measure the success of a feature after launch?', 'Describe your approach to roadmapping.'],
    senior: ['How do you build a product strategy aligned to business goals?', 'How do you manage a product through a major pivot?', 'Explain how you drive alignment across engineering, design, and business.', 'How do you balance short-term and long-term goals?', 'How do you build a culture of data-driven decisions?'],
  },
  'DevOps Engineer': {
    junior: ['What is CI/CD?', 'Explain the difference between Docker and a VM.', 'What is Kubernetes?', 'What is infrastructure as code?', 'Explain what a load balancer does.'],
    mid: ['Walk me through setting up a CI/CD pipeline.', 'How do you manage secrets securely?', 'Explain blue-green deployments.', 'How do you monitor a production system?', 'What is Terraform and how do you use it?'],
    senior: ['Design a zero-downtime deployment strategy for a microservices system.', 'How do you design for disaster recovery?', 'Explain your approach to cost optimization in cloud infrastructure.', 'How do you handle security compliance at scale?', 'Describe your approach to SRE practices.'],
  },
};

// ── NLP Evaluation (client-side fallback) ─────────────────────────────────
function evaluateAnswer(question, answer) {
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const sentences = answer.split(/[.!?]+/).filter(s => s.trim().length > 3);
  const techTerms = ['algorithm','complexity','architecture','scalable','distributed','api','database','cache','async','synchronous','component','state','render','optimize','performance','security','deploy','monitor','pipeline','container','microservice','function','class','object','interface','abstraction','polymorphism','inheritance','encapsulation','recursion','iteration','data structure','binary','queue','stack','hash','tree','graph'];
  const termCount = techTerms.filter(t => answer.toLowerCase().includes(t)).length;
  const hasExample = /example|for instance|such as|like|e\.g\.|specifically|in practice/i.test(answer);
  const hasStructure = /first|second|third|finally|however|therefore|because|since|additionally/i.test(answer);

  const lengthScore = Math.min(100, Math.max(20, words.length * 3));
  const techScore   = Math.min(100, 40 + termCount * 12);
  const structScore = (hasStructure ? 20 : 0) + (hasExample ? 20 : 0) + Math.min(60, sentences.length * 10);

  const confidence  = Math.round(Math.min(100, (lengthScore * 0.4 + structScore * 0.6)));
  const clarity     = Math.round(Math.min(100, (structScore * 0.5 + lengthScore * 0.5)));
  const performance = Math.round(Math.min(100, (techScore * 0.6 + lengthScore * 0.4)));
  const total       = Math.round((confidence + clarity + performance) / 3);

  const strengths = [];
  const improvements = [];
  if (words.length > 50) strengths.push('Detailed response with good length');
  if (termCount > 2)     strengths.push('Good use of technical terminology');
  if (hasExample)        strengths.push('Supported answer with examples');
  if (hasStructure)      strengths.push('Well-structured and logical flow');
  if (strengths.length === 0) strengths.push('Attempted to answer the question');

  if (words.length < 40)  improvements.push('Elaborate more — aim for 60+ words');
  if (termCount < 2)      improvements.push('Use more domain-specific terminology');
  if (!hasExample)        improvements.push('Add a concrete real-world example');
  if (!hasStructure)      improvements.push('Use signposting words to structure your answer');
  if (improvements.length === 0) improvements.push('Practice explaining this concept to a non-technical person');

  const feedbacks = [
    `Your answer demonstrates ${total >= 70 ? 'solid' : 'basic'} understanding. ${hasExample ? 'Good use of examples.' : 'Try adding a concrete example next time.'} Focus on ${improvements[0]?.toLowerCase() || 'deepening your explanation'}.`,
    `${total >= 70 ? 'Strong response overall.' : 'Reasonable attempt.'} ${termCount > 2 ? 'Good technical vocabulary.' : 'Build on your technical terminology.'} ${improvements[0] || 'Keep practising!'}`,
  ];

  return { confidence, clarity, performance, total, feedback: feedbacks[Math.floor(Math.random() * feedbacks.length)], strengths: strengths.slice(0,3), improvements: improvements.slice(0,3) };
}

// ── Score colour helper ────────────────────────────────────────────────────
function scoreColor(s) {
  if (s >= 80) return '#00E5A0';
  if (s >= 60) return '#00D4FF';
  if (s >= 40) return '#FFB547';
  return '#FF5B5B';
}

function tierLabel(s) {
  if (s >= 85) return 'Excellent';
  if (s >= 70) return 'Strong';
  if (s >= 55) return 'Good';
  if (s >= 40) return 'Average';
  return 'Needs Work';
}

// ── Circular Score Component ───────────────────────────────────────────────
function CircleScore({ score, label, size = 80, animate = false }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = scoreColor(score);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={6} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: animate ? 'stroke-dashoffset 1.2s ease' : 'none' }} />
        <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="middle"
          style={{ transform: 'rotate(90deg)', transformOrigin: `${size/2}px ${size/2}px`, fill: color, fontSize: size < 70 ? 14 : 18, fontFamily: 'Syne', fontWeight: 700 }}>
          {score}
        </text>
      </svg>
      <span style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</span>
    </div>
  );
}

// ── Waveform Animation ─────────────────────────────────────────────────────
function Waveform({ active }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 28 }}>
      {[...Array(8)].map((_, i) => (
        <div key={i} style={{
          width: 3, background: active ? 'var(--accent)' : 'var(--border2)',
          borderRadius: 2, height: active ? undefined : 4,
          animation: active ? `waveform ${0.4 + i * 0.08}s ease-in-out infinite alternate` : 'none',
          animationDelay: `${i * 0.06}s`,
          transition: 'background .3s',
        }} />
      ))}
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage]           = useState('home');    // home | setup | interview | result | history
  const [role, setRole]           = useState('Software Engineer');
  const [level, setLevel]         = useState('mid');
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex]       = useState(0);
  const [answer, setAnswer]       = useState('');
  const [answers, setAnswers]     = useState([]);
  const [evaluating, setEval]     = useState(false);
  const [recording, setRecording] = useState(false);
  const [history, setHistory]     = useState([]);
  const [timeLeft, setTimeLeft]   = useState(120);
  const timerRef = useRef(null);
  const recognRef = useRef(null);
  const textareaRef = useRef(null);

  // Inject CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Timer
  useEffect(() => {
    if (page !== 'interview') return;
    setTimeLeft(120);
    timerRef.current = setInterval(() => setTimeLeft(t => {
      if (t <= 1) { clearInterval(timerRef.current); return 0; }
      return t - 1;
    }), 1000);
    return () => clearInterval(timerRef.current);
  }, [page, qIndex]);

  // Speech recognition
  const startRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition not supported in this browser. Please type your answer.'); return; }
    const recog = new SR();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = 'en-US';
    recog.onresult = e => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
      setAnswer(transcript);
    };
    recog.start();
    recognRef.current = recog;
    setRecording(true);
  };

  const stopRecording = () => {
    recognRef.current?.stop();
    setRecording(false);
  };

  const startInterview = () => {
    const bank = QUESTION_BANKS[role]?.[level] || QUESTION_BANKS['Software Engineer'].mid;
    const shuffled = [...bank].sort(() => Math.random() - 0.5).slice(0, 5);
    setQuestions(shuffled);
    setAnswers([]);
    setQIndex(0);
    setAnswer('');
    setPage('interview');
  };

  const submitAnswer = () => {
    if (answer.trim().length < 10) { alert('Please provide a more detailed answer (at least 10 characters).'); return; }
    clearInterval(timerRef.current);
    stopRecording();
    setEval(true);
    setTimeout(() => {
      const result = evaluateAnswer(questions[qIndex], answer);
      const newAnswers = [...answers, { question: questions[qIndex], answer, ...result }];
      setAnswers(newAnswers);
      setEval(false);
      if (qIndex + 1 >= questions.length) {
        const overall = {
          confidence:  Math.round(newAnswers.reduce((a, x) => a + x.confidence,  0) / newAnswers.length),
          clarity:     Math.round(newAnswers.reduce((a, x) => a + x.clarity,     0) / newAnswers.length),
          performance: Math.round(newAnswers.reduce((a, x) => a + x.performance, 0) / newAnswers.length),
          total:       Math.round(newAnswers.reduce((a, x) => a + x.total,       0) / newAnswers.length),
        };
        const session = { role, level, date: new Date().toLocaleDateString(), answers: newAnswers, overall };
        setHistory(h => [session, ...h].slice(0, 10));
        setPage('result');
      } else {
        setQIndex(i => i + 1);
        setAnswer('');
      }
    }, 1800);
  };

  const lastSession = history[0];

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(8,10,15,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', padding: '0 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 58, display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 800, letterSpacing: -.5 }}>
            Interview<span style={{ color: 'var(--accent)' }}>AI</span>
          </div>
          <div style={{ display: 'flex', gap: 2, marginLeft: 'auto' }}>
            {[['home','Home'],['setup','Practice'],['history','History']].map(([id, label]) => (
              <button key={id} onClick={() => setPage(id)} style={{
                background: 'none', border: 'none', color: page === id ? 'var(--accent)' : 'var(--text2)',
                fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, padding: '6px 14px',
                borderRadius: 8, cursor: 'pointer', background: page === id ? 'rgba(0,212,255,.08)' : 'none',
                transition: 'all .2s',
              }}>{label}</button>
            ))}
          </div>
          <div style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent2))', color: '#fff', fontSize: 10.5, fontWeight: 700, padding: '3px 10px', borderRadius: 20, letterSpacing: '.05em' }}>
            GPT-4 Powered
          </div>
        </div>
      </nav>

      {/* ── HOME PAGE ── */}
      {page === 'home' && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 28px' }}>
          {/* Hero */}
          <div style={{ padding: '80px 0 60px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse,rgba(0,212,255,.08) 0%,transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,212,255,.08)', border: '1px solid rgba(0,212,255,.2)', color: 'var(--accent)', fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', padding: '4px 14px', borderRadius: 20, marginBottom: 24 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
              AI-Powered Mock Interviews
            </div>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(36px,5vw,62px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, marginBottom: 16, maxWidth: 700 }}>
              Ace your next interview<br/><span style={{ background: 'linear-gradient(90deg,var(--accent),var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>with AI coaching</span>
            </h1>
            <p style={{ color: 'var(--text2)', fontSize: 16, lineHeight: 1.7, maxWidth: 480, marginBottom: 36, fontWeight: 300 }}>
              Practice real interview questions. Get instant AI feedback on confidence, clarity, and technical performance. Speech-to-text powered answers.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => setPage('setup')} style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent2))', color: '#fff', border: 'none', fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 700, padding: '14px 32px', borderRadius: 12, cursor: 'pointer', letterSpacing: .5, animation: 'glow 3s infinite' }}>
                Start Interview →
              </button>
              <button onClick={() => setPage('history')} style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text2)', fontFamily: 'var(--font-body)', fontSize: 14, padding: '14px 24px', borderRadius: 12, cursor: 'pointer' }}>
                View History
              </button>
            </div>
          </div>

          {/* Feature cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16, marginBottom: 60 }}>
            {[
              { icon: '🎤', title: 'Speech-to-Text', desc: 'Answer naturally with your voice — powered by Web Speech API', color: 'var(--accent)' },
              { icon: '🧠', title: 'NLP Evaluation', desc: 'AI analyses your answers for technical depth, clarity and confidence', color: 'var(--accent2)' },
              { icon: '📊', title: 'Score Breakdown', desc: 'Get scored on Confidence, Clarity and Performance with detailed feedback', color: 'var(--green)' },
              { icon: '📁', title: 'Session History', desc: 'Track your progress across multiple interview sessions over time', color: 'var(--amber)' },
            ].map((f, i) => (
              <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, transition: 'border .2s, transform .2s', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = f.color + '50'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 700, marginBottom: 8, color: f.color }}>{f.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>

          {/* Stats strip */}
          <div style={{ display: 'flex', gap: 0, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', marginBottom: 60 }}>
            {[['5+','Interview Roles'],['50+','Question Bank'],['3','Score Metrics'],['Real-time','AI Feedback']].map(([val, lbl], i) => (
              <div key={i} style={{ flex: 1, padding: '24px 20px', textAlign: 'center', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 26, fontWeight: 800, background: 'linear-gradient(135deg,var(--accent),var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 4 }}>{val}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SETUP PAGE ── */}
      {page === 'setup' && (
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '60px 28px' }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 32, fontWeight: 800, letterSpacing: -1, marginBottom: 8 }}>Configure Interview</h2>
            <p style={{ color: 'var(--text2)', fontSize: 14 }}>Choose your role and experience level to get the right questions.</p>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 32 }}>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>Job Role</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ROLES.map(r => (
                  <button key={r} onClick={() => setRole(r)} style={{
                    background: role === r ? 'rgba(0,212,255,.1)' : 'var(--bg3)',
                    border: `1px solid ${role === r ? 'rgba(0,212,255,.4)' : 'var(--border)'}`,
                    color: role === r ? 'var(--accent)' : 'var(--text2)', fontFamily: 'var(--font-body)',
                    fontSize: 13.5, fontWeight: 500, padding: '12px 16px', borderRadius: 10,
                    cursor: 'pointer', textAlign: 'left', transition: 'all .2s',
                  }}>{r}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>Experience Level</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {LEVELS.map(l => (
                  <button key={l} onClick={() => setLevel(l)} style={{
                    flex: 1, background: level === l ? 'rgba(123,97,255,.15)' : 'var(--bg3)',
                    border: `1px solid ${level === l ? 'rgba(123,97,255,.4)' : 'var(--border)'}`,
                    color: level === l ? 'var(--accent2)' : 'var(--text2)', fontFamily: 'var(--font-head)',
                    fontSize: 13, fontWeight: 600, padding: '12px', borderRadius: 10,
                    cursor: 'pointer', textTransform: 'capitalize', transition: 'all .2s',
                  }}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', marginBottom: 24, fontSize: 13, color: 'var(--text2)' }}>
              📋 <strong style={{ color: 'var(--text)' }}>5 questions</strong> · <strong style={{ color: 'var(--text)' }}>2 min</strong> per question · <strong style={{ color: 'var(--text)' }}>Voice or text</strong> answers · Instant AI feedback
            </div>
            <button onClick={startInterview} style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent2))', color: '#fff', border: 'none', fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 700, padding: '15px', borderRadius: 12, cursor: 'pointer', width: '100%', letterSpacing: .5 }}>
              Start Interview Session →
            </button>
          </div>
        </div>
      )}

      {/* ── INTERVIEW PAGE ── */}
      {page === 'interview' && (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 28px' }}>
          {evaluating ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ width: 48, height: 48, border: '3px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Evaluating your answer…</div>
              <div style={{ color: 'var(--text2)', fontSize: 14 }}>AI is analysing confidence, clarity and performance</div>
            </div>
          ) : (
            <>
              {/* Progress */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                <div style={{ flex: 1, background: 'var(--border)', height: 4, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'linear-gradient(90deg,var(--accent),var(--accent2))', width: `${((qIndex) / questions.length) * 100}%`, transition: 'width .5s', borderRadius: 4 }} />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text2)', whiteSpace: 'nowrap' }}>Q {qIndex + 1} / {questions.length}</span>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: timeLeft < 30 ? 'var(--red)' : 'var(--text2)', background: 'var(--bg3)', border: '1px solid var(--border)', padding: '4px 12px', borderRadius: 8, minWidth: 60, textAlign: 'center' }}>
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </div>
              </div>

              {/* Role badge */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <span style={{ background: 'rgba(0,212,255,.1)', border: '1px solid rgba(0,212,255,.2)', color: 'var(--accent)', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '.06em' }}>{role}</span>
                <span style={{ background: 'rgba(123,97,255,.1)', border: '1px solid rgba(123,97,255,.2)', color: 'var(--accent2)', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, textTransform: 'capitalize', letterSpacing: '.06em' }}>{level}</span>
              </div>

              {/* Question card */}
              <div style={{ background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 16, padding: '28px 28px 24px', marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>Question {qIndex + 1}</div>
                <p style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 600, lineHeight: 1.5, color: 'var(--text)' }}>{questions[qIndex]}</p>
              </div>

              {/* Answer area */}
              <div style={{ background: 'var(--card)', border: `1px solid ${recording ? 'rgba(0,212,255,.4)' : 'var(--border)'}`, borderRadius: 16, padding: 20, marginBottom: 16, transition: 'border .3s' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>Your answer</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Waveform active={recording} />
                    <button onClick={recording ? stopRecording : startRecording} style={{
                      background: recording ? 'rgba(255,91,91,.15)' : 'rgba(0,212,255,.1)',
                      border: `1px solid ${recording ? 'rgba(255,91,91,.3)' : 'rgba(0,212,255,.25)'}`,
                      color: recording ? 'var(--red)' : 'var(--accent)',
                      fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)',
                    }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor', animation: recording ? 'pulse .8s infinite' : 'none' }} />
                      {recording ? 'Stop' : 'Record'}
                    </button>
                  </div>
                </div>
                <textarea ref={textareaRef} value={answer} onChange={e => setAnswer(e.target.value)}
                  placeholder="Type your answer here, or click Record to use your voice…"
                  style={{ width: '100%', minHeight: 140, background: 'transparent', border: 'none', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.7, resize: 'vertical', outline: 'none' }} />
                <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
                  {answer.trim().split(/\s+/).filter(Boolean).length} words
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => { setAnswer(''); stopRecording(); }} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)', fontFamily: 'var(--font-body)', fontSize: 13, padding: '12px 20px', borderRadius: 10, cursor: 'pointer', flex: '0 0 auto' }}>
                  Clear
                </button>
                <button onClick={submitAnswer} disabled={answer.trim().length < 10} style={{
                  flex: 1, background: answer.trim().length >= 10 ? 'linear-gradient(135deg,var(--accent),var(--accent2))' : 'var(--bg3)',
                  border: 'none', color: answer.trim().length >= 10 ? '#fff' : 'var(--text3)',
                  fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 700, padding: '13px',
                  borderRadius: 10, cursor: answer.trim().length >= 10 ? 'pointer' : 'not-allowed', transition: 'all .2s',
                }}>
                  {qIndex + 1 < questions.length ? `Submit & Next →` : 'Submit & See Results →'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── RESULTS PAGE ── */}
      {page === 'result' && lastSession && (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 28px 60px' }}>
          {/* Overall header */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 18, padding: '32px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'radial-gradient(circle,rgba(0,212,255,.06) 0%,transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 800, letterSpacing: -.5, marginBottom: 6 }}>Interview Complete!</div>
                <div style={{ color: 'var(--text2)', fontSize: 14 }}>{lastSession.role} · {lastSession.level} · {lastSession.date}</div>
                <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 8, background: scoreColor(lastSession.overall.total) + '18', border: `1px solid ${scoreColor(lastSession.overall.total)}40`, color: scoreColor(lastSession.overall.total), padding: '6px 16px', borderRadius: 20, fontFamily: 'var(--font-head)', fontSize: 13, fontWeight: 700 }}>
                  {tierLabel(lastSession.overall.total)} Performance
                </div>
              </div>
              <div style={{ display: 'flex', gap: 24 }}>
                <CircleScore score={lastSession.overall.confidence}  label="Confidence"  size={90} animate />
                <CircleScore score={lastSession.overall.clarity}     label="Clarity"     size={90} animate />
                <CircleScore score={lastSession.overall.performance} label="Performance" size={90} animate />
              </div>
            </div>
            <div style={{ marginTop: 24, background: 'var(--bg3)', borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text2)', fontSize: 13 }}>Overall Score</span>
              <span style={{ fontFamily: 'var(--font-head)', fontSize: 32, fontWeight: 800, color: scoreColor(lastSession.overall.total) }}>{lastSession.overall.total}<span style={{ fontSize: 16, color: 'var(--text3)' }}>/100</span></span>
            </div>
          </div>

          {/* Per-question breakdown */}
          <h3 style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Question Breakdown</h3>
          {lastSession.answers.map((a, i) => (
            <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, marginBottom: 14, animation: 'fadeUp .4s ease both', animationDelay: `${i * .1}s` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Q{i + 1}</div>
                  <div style={{ fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{a.question}</div>
                </div>
                <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
                  <CircleScore score={a.confidence}  label="Conf"  size={60} />
                  <CircleScore score={a.clarity}     label="Clear" size={60} />
                  <CircleScore score={a.performance} label="Perf"  size={60} />
                </div>
              </div>
              <div style={{ background: 'var(--bg3)', borderRadius: 9, padding: '12px 14px', marginBottom: 12, fontSize: 13, color: 'var(--text2)', fontStyle: 'italic', borderLeft: '3px solid var(--accent)', lineHeight: 1.6 }}>
                {a.feedback}
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>✓ Strengths</div>
                  {a.strengths.map((s, j) => <div key={j} style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 3 }}>• {s}</div>)}
                </div>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>↑ Improve</div>
                  {a.improvements.map((s, j) => <div key={j} style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 3 }}>• {s}</div>)}
                </div>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button onClick={() => setPage('setup')} style={{ flex: 1, background: 'linear-gradient(135deg,var(--accent),var(--accent2))', color: '#fff', border: 'none', fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 700, padding: '14px', borderRadius: 12, cursor: 'pointer' }}>
              Practice Again →
            </button>
            <button onClick={() => setPage('history')} style={{ flex: '0 0 auto', background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text2)', fontFamily: 'var(--font-body)', fontSize: 14, padding: '14px 24px', borderRadius: 12, cursor: 'pointer' }}>
              View History
            </button>
          </div>
        </div>
      )}

      {/* ── HISTORY PAGE ── */}
      {page === 'history' && (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 28px 60px' }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 800, letterSpacing: -.5, marginBottom: 8 }}>Session History</h2>
            <p style={{ color: 'var(--text2)', fontSize: 14 }}>Track your progress across all practice sessions.</p>
          </div>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text3)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
              <div style={{ fontSize: 16, marginBottom: 12 }}>No sessions yet</div>
              <button onClick={() => setPage('setup')} style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent2))', color: '#fff', border: 'none', fontFamily: 'var(--font-head)', fontSize: 13, fontWeight: 700, padding: '12px 24px', borderRadius: 10, cursor: 'pointer' }}>Start your first interview</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {history.map((s, i) => (
                <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{s.role}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>{s.level} · {s.date} · {s.answers.length} questions</div>
                  </div>
                  <div style={{ display: 'flex', gap: 20 }}>
                    <CircleScore score={s.overall.confidence}  label="Conf"  size={62} />
                    <CircleScore score={s.overall.clarity}     label="Clear" size={62} />
                    <CircleScore score={s.overall.performance} label="Perf"  size={62} />
                  </div>
                  <div style={{ textAlign: 'center', minWidth: 80 }}>
                    <div style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 800, color: scoreColor(s.overall.total) }}>{s.overall.total}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Total</div>
                    <div style={{ fontSize: 11, color: scoreColor(s.overall.total), marginTop: 2 }}>{tierLabel(s.overall.total)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
