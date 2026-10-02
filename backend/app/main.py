import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import openai

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI(title="AI Interview Prep Studio - Pro Plus")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StartRequest(BaseModel):
    role: str
    topic: str
    difficulty: str = "Intermediate"

class EvalRequest(BaseModel):
    role: str
    topic: str
    question: str
    user_answer: str

@app.get("/")
def home():
    return {"status": "AI Engine Active"}

@app.post("/api/start")
async def start_session(req: StartRequest):
    if not openai.api_key or "your_openai" in openai.api_key:
        return {
            "session_id": "demo-123",
            "question": f"[{req.difficulty}] How would you design a scalable, low-latency caching strategy for {req.topic} as a {req.role}?",
            "hints": ["Mention cache eviction policies (LRU/LFU)", "Discuss cache invalidation strategies", "Highlight Redis vs Memcached trade-offs"]
        }

    prompt = f"Generate ONE realistic, challenging technical interview question for a {req.role} focusing on {req.topic} at {req.difficulty} level. Return ONLY the question text."
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )
        question = response.choices[0].message.content.strip()
        return {
            "session_id": "live-session", 
            "question": question,
            "hints": ["Use the STAR method", "Provide specific architectural metrics", "Explain edge-case error handling"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/evaluate")
async def evaluate(req: EvalRequest):
    answer_text = req.user_answer.strip()
    words = answer_text.split()
    word_count = len(words)

    # 1. GUARDRAIL: Reject raw code snippets or ultra-short input
    code_indicators = ["</div>", "</p>", "export default", "return (", "className=", "<script>"]
    is_code = any(indicator in answer_text for indicator in code_indicators)

    if is_code or word_count < 8:
        return {
            "overall_score": 1,
            "accuracy_score": 1,
            "clarity_score": 1,
            "depth_score": 1,
            "strengths": ["Submitted an answer."],
            "improvements": [
                "Submission contains raw code tags or insufficient detail.",
                "Elaborate step-by-step using technical terms and STAR methodology."
            ],
            "model_answer": f"A comprehensive response for {req.role} should outline architectural steps in {req.topic}, discuss trade-offs, and detail quantitative outcomes."
        }

    # 2. ONLINE OPENAI EVALUATION
    if openai.api_key and "your_openai" not in openai.api_key:
        prompt = f"""
        Role: {req.role}
        Topic: {req.topic}
        Question: {req.question}
        User Answer: {req.user_answer}

        Perform a strict technical evaluation.
        Return STRICTLY JSON format:
        {{
          "overall_score": <integer 1-10>,
          "accuracy_score": <integer 1-10>,
          "clarity_score": <integer 1-10>,
          "depth_score": <integer 1-10>,
          "strengths": ["<strength 1>", "<strength 2>"],
          "improvements": ["<actionable improvement 1>", "<actionable improvement 2>"],
          "model_answer": "<A high-quality sample answer expected for this role>"
        }}
        """
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
            )
            return json.loads(response.choices[0].message.content.strip())
        except Exception:
            pass

    # 3. SMART OFFLINE EVALUATION
    tech_keywords = ["index", "query", "postgresql", "latency", "vector", "embedding", "rag", "database", "cache", "performance", "explain", "btree", "hnsw", "redis", "architecture", "tradeoff", "scale"]
    found = list(set([w.lower() for w in words if w.lower() in tech_keywords]))
    score = min(10, max(2, len(found) * 2 + (word_count // 20)))

    return {
        "overall_score": score,
        "accuracy_score": score,
        "clarity_score": min(10, score + 1),
        "depth_score": max(1, score - 1),
        "strengths": [
            f"Incorporated key industry terms: {', '.join(found[:3]) if found else 'General concept'}",
            "Structured response length effectively."
        ],
        "improvements": [
            "Detail operational metrics (e.g., latency reduction %, throughput throughput).",
            "Discuss failure modes and fallback mechanisms."
        ],
        "model_answer": f"An exemplary answer for {req.topic} outlines system constraints, step-by-step resolution, and concrete production metrics."
    }