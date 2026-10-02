Markdown
# 🤖 AI-Powered Technical Interview Preparation System

An end-to-end full-stack web application designed to simulate technical mock interviews with strict multi-criteria AI evaluation, voice integration, and real-time performance analytics.

![Repository Stars](https://img.shields.io/github/stars/VISHALMEENIA/ai-interview-prep-system?style=social)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ Features

- **🎯 Role & Domain Specificity**: Generate target questions customized by job role, experience level (Junior, Intermediate, Senior/Lead), and technical domain.
- **🎤 Speech-to-Text (STT) & Audio Guidance**: Dictate responses using built-in browser speech recognition or use Text-to-Speech to listen to interview questions aloud.
- **📊 Multi-Criteria Scoring Engine**: Evaluates responses across three core metrics:
  - **Technical Accuracy**: Verifies correctness and relevant industry concepts.
  - **Communication Clarity**: Assesses structure, readability, and organization.
  - **Problem-Solving Depth**: Evaluates edge cases, system trade-offs, and scaling considerations.
- **🛡️ Guardrails & Strict Quality Control**: Filters out low-effort input, raw code snippets, and off-topic submissions, assigning low scores when answers lack technical depth.
- **⏱️ Practice Session History & Timer**: Live session timer with persistent historical tracking of past practice rounds and score progress.
- **💡 STAR Method Assistance**: Integrated guidelines to structure technical responses (Situation, Task, Action, Result).

---

## 🛠️️ Tech Stack

### **Backend**
- **Framework**: FastAPI (Python)
- **AI Integration**: OpenAI API (`gpt-3.5-turbo`)
- **Server**: Uvicorn
- **Validation**: Pydantic

### **Frontend**
- **Framework**: React + Vite
- **Styling**: Tailwind CSS v4 (Glassmorphic dark theme)
- **Voice APIs**: Web Speech API (Speech Recognition & Speech Synthesis)

---

## 📁 Project Structure

```text
ai-interview-prep/
├── backend/
│   ├── app/
│   │   └── main.py          # FastAPI application & evaluation engine
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # API Keys (Git ignored)
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Studio UI, voice integration, scorecard
│   │   └── index.css        # Tailwind styling & animations
│   ├── package.json
│   └── vite.config.js
└── .gitignore
🚀 Getting Started
Prerequisites
Node.js (v18+)

Python (3.10+)

OpenAI API Key (optional; includes fallback mode)

1. Backend Setup
Bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv

# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn openai python-dotenv pydantic

# Create .env file and add your OpenAI API key
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env

# Run FastAPI server
uvicorn app.main:app --reload
The backend server will run at http://127.0.0.1:8000.

2. Frontend Setup
Bash
# Navigate to frontend directory in a new terminal
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
The frontend application will be live at http://localhost:5173.

📜 License
Distributed under the MIT License.


---

### Push Updated README to GitHub

Once saved, commit and push it to your repository:

```powershell
cd D:\ai-interview-prep
git add README.md
git commit -m "docs: add comprehensive README documentation"
git push origin main
