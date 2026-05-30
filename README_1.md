# 🎤 AI Interview Coach

> **AI-powered mock interview platform with speech-to-text and NLP-driven evaluation — scoring candidates on confidence, clarity and performance**

![React](https://img.shields.io/badge/React.js-18-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)
![OpenAI](https://img.shields.io/badge/OpenAI_API-GPT--3.5-412991?style=for-the-badge&logo=openai)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 📌 Overview

An AI-powered mock interview platform built with **React.js**, **Node.js**, and the **OpenAI API**. Candidates practice role-specific questions using voice or text, and the NLP engine instantly evaluates each answer — scoring **confidence**, **clarity**, and **technical performance** with detailed feedback and improvement tips.

---

## 🎯 Key Features

| Feature | Description |
|---|---|
| 🎤 **Speech-to-Text** | Record answers with your voice using the Web Speech API |
| 🧠 **OpenAI NLP Evaluation** | GPT-3.5 analyses answers for depth, clarity and confidence |
| 📊 **3-Metric Scoring** | Scores for Confidence, Clarity and Performance (0–100 each) |
| 💬 **Detailed Feedback** | Per-answer strengths, improvement tips and AI written feedback |
| 📁 **Session History** | MongoDB stores all sessions for progress tracking over time |
| ⏱️ **Timed Questions** | 2-minute timer per question simulates real interview pressure |
| 🎯 **5 Job Roles** | Software Engineer, Frontend, Data Science, PM, DevOps |
| 🎚️ **3 Difficulty Levels** | Junior, Mid-level, Senior question banks |

---

## 🧠 NLP Evaluation System

```
Answer Input
    │
    ▼
OpenAI GPT-3.5 (primary)  ──▶  Structured JSON response
    │                              {confidence, clarity, performance,
    │ fallback                      feedback, strengths, improvements}
    ▼
Client-side NLP Engine
    │  → Word count analysis
    │  → Technical term frequency
    │  → Structural markers (signposting)
    │  → Example detection
    ▼
Weighted Score Calculation
    Confidence  = length × 0.4 + structure × 0.6
    Clarity     = structure × 0.5 + length × 0.5
    Performance = tech terms × 0.6 + length × 0.4
    Total       = (C + Cl + P) / 3
```

---

## 🗂️ Project Structure

```
ai-interview-coach/
│
├── client/                    # React.js frontend
│   ├── public/index.html
│   ├── src/
│   │   ├── App.jsx            # Complete UI — Home, Setup, Interview, Results, History
│   │   └── index.js
│   └── package.json
│
├── server/                    # Node.js + Express backend
│   ├── server.js              # API routes + OpenAI integration + MongoDB schemas
│   ├── .env.example           # Environment variables template
│   └── package.json
│
└── README.md
```

---

## ⚙️ Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/ai-interview-coach.git
cd ai-interview-coach
```

### 2. Backend setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
npm run dev
```

### 3. Frontend setup
```bash
cd client
npm install
npm start
```

Open `http://localhost:3000`

---

## 🔑 Environment Variables

```env
OPENAI_API_KEY=sk-your-key-here
MONGO_URI=mongodb://localhost:27017/interview_coach
CLIENT_URL=http://localhost:3000
PORT=5000
```

Get an OpenAI API key at: https://platform.openai.com/api-keys

---

## 🔌 API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/interview/start` | Get shuffled questions for role + level |
| POST | `/api/interview/evaluate` | Submit answer for AI evaluation |
| POST | `/api/sessions` | Save completed session to MongoDB |
| GET  | `/api/sessions/:userId` | Retrieve session history |
| GET  | `/api/health` | Health check |

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js 18, JSX, CSS-in-JS |
| Backend | Node.js 18+, Express.js 4 |
| AI/NLP | OpenAI GPT-3.5 API |
| Database | MongoDB with Mongoose ODM |
| Speech | Web Speech API (browser native) |
| Styling | CSS Variables, custom animations |

---

## 🚀 Future Improvements

- [ ] JWT authentication & user accounts
- [ ] Video recording with facial expression analysis
- [ ] STAR method answer scoring
- [ ] Company-specific question packs
- [ ] Leaderboard and peer comparison
- [ ] Deploy to Vercel (frontend) + Railway (backend)

---

## 📄 License

MIT License

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)
- LinkedIn: [linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)

> ⭐ Star this repo if it was helpful!
