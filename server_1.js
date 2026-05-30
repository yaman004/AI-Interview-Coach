/**
 * AI Interview Coach — Backend
 * ============================
 * Tech: Node.js, Express.js, OpenAI API, MongoDB (Mongoose)
 */

require('dotenv').config();
const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const OpenAI     = require('openai');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());

// ── OpenAI Client ──────────────────────────────────────────────────────────
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── MongoDB Connection ─────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/interview_coach')
  .then(() => console.log('[DB] MongoDB connected'))
  .catch(err => console.error('[DB] Connection error:', err));

// ── Interview Session Schema ───────────────────────────────────────────────
const SessionSchema = new mongoose.Schema({
  userId:      { type: String, default: 'guest' },
  role:        { type: String, required: true },
  difficulty:  { type: String, enum: ['junior', 'mid', 'senior'], default: 'mid' },
  questions:   [{ question: String, answer: String, score: Number, feedback: String }],
  overallScore:{ confidence: Number, clarity: Number, performance: Number, total: Number },
  createdAt:   { type: Date, default: Date.now },
});
const Session = mongoose.model('Session', SessionSchema);

// ── Question Bank ──────────────────────────────────────────────────────────
const QUESTION_BANKS = {
  'Software Engineer': {
    junior: [
      'Explain the difference between == and === in JavaScript.',
      'What is a RESTful API? Give an example.',
      'What is the difference between var, let, and const?',
      'Explain what Git is and why developers use it.',
      'What is the purpose of a database index?',
    ],
    mid: [
      'Explain the SOLID principles with an example.',
      'What is the difference between SQL and NoSQL databases? When would you use each?',
      'Walk me through how you would design a URL shortening service.',
      'What is a race condition and how do you prevent it?',
      'Explain the event loop in Node.js.',
    ],
    senior: [
      'How would you design a distributed cache for a high-traffic system?',
      'Explain CAP theorem and its implications for system design.',
      'Walk me through your approach to handling technical debt in a production system.',
      'How do you ensure microservices remain loosely coupled?',
      'What strategies do you use to ensure observability in a distributed system?',
    ],
  },
  'Frontend Developer': {
    junior: ['What is the Virtual DOM in React?', 'Explain CSS Box Model.', 'What are React hooks?'],
    mid: ['Explain React reconciliation.', 'What is code splitting?', 'How does Redux work?'],
    senior: ['How do you optimize a React app for performance?', 'Explain micro-frontends.', 'How would you architect a large-scale SPA?'],
  },
  'Data Scientist': {
    junior: ['What is overfitting?', 'Explain precision vs recall.', 'What is a p-value?'],
    mid: ['Explain gradient boosting.', 'What is regularization?', 'How do you handle class imbalance?'],
    senior: ['Design an ML pipeline for real-time fraud detection.', 'Explain causal inference vs correlation.', 'How do you monitor model drift in production?'],
  },
};

// ── API Routes ─────────────────────────────────────────────────────────────

// Generate interview questions
app.post('/api/interview/start', async (req, res) => {
  try {
    const { role = 'Software Engineer', difficulty = 'mid', count = 5 } = req.body;
    const bank = QUESTION_BANKS[role]?.[difficulty] || QUESTION_BANKS['Software Engineer'].mid;
    const questions = bank.sort(() => Math.random() - 0.5).slice(0, count);
    res.json({ questions, role, difficulty });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Evaluate a single answer with OpenAI NLP
app.post('/api/interview/evaluate', async (req, res) => {
  try {
    const { question, answer, role, difficulty } = req.body;
    if (!question || !answer) return res.status(400).json({ error: 'question and answer required' });

    const prompt = `You are an expert ${role} interviewer evaluating a candidate at ${difficulty} level.

Question: "${question}"
Candidate's Answer: "${answer}"

Evaluate the answer and respond ONLY with a JSON object (no markdown, no extra text):
{
  "confidence": <0-100, how confidently and decisively the answer is given>,
  "clarity": <0-100, how clear, structured and easy to understand the answer is>,
  "performance": <0-100, technical correctness and depth>,
  "total": <average of the three>,
  "feedback": "<2-3 sentence constructive feedback>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
      temperature: 0.4,
    });

    const raw  = completion.choices[0].message.content.trim();
    const clean = raw.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);
    res.json(result);

  } catch (err) {
    // Fallback scoring if OpenAI fails
    const words = (req.body.answer || '').split(' ').length;
    const base  = Math.min(85, Math.max(30, words * 2));
    res.json({
      confidence:  base,
      clarity:     Math.min(100, base + 5),
      performance: Math.min(100, base - 5),
      total:       base,
      feedback:    'Good attempt. Try to elaborate with specific examples and technical depth.',
      strengths:   ['Attempted the question', 'Showed basic understanding'],
      improvements:['Add more specific examples', 'Include technical terminology'],
    });
  }
});

// Save completed session to MongoDB
app.post('/api/sessions', async (req, res) => {
  try {
    const session = new Session(req.body);
    await session.save();
    res.json({ message: 'Session saved', id: session._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get past sessions
app.get('/api/sessions/:userId', async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.params.userId }).sort({ createdAt: -1 }).limit(10);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', ai: 'OpenAI GPT-3.5' }));

app.listen(PORT, () => {
  console.log('=============================================');
  console.log('  AI Interview Coach — Backend Server');
  console.log(`  Running at http://localhost:${PORT}`);
  console.log('  AI: OpenAI GPT-3.5 | DB: MongoDB');
  console.log('=============================================');
});
