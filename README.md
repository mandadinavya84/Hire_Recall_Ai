# HireRecall AI — Recruitment Memory Agent

> **"Every interview makes the next interview smarter."**

[![Hackathon Project](https://img.shields.io/badge/Hackathon-Hack__With__Hyd%202026-blue.svg)](https://github.com/)
[![Memory Engine](https://img.shields.io/badge/Memory-Vectorize%20Hindsight-purple.svg)](https://docs.hindsight.vectorize.io/)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite%20%2B%20Tailwind-cyan.svg)](https://vitejs.dev/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-slate.svg)](LICENSE)

---

## 1. Problem
In modern technical hiring, multiple interviewers evaluate a candidate across screening, system design, coding, and behavioral rounds. However:
- **Recruiter context gets lost between interview rounds:** Feedback and interviewer notes are scattered in disjoint ATS forms, Google Docs, or Slack messages.
- **Redundant Questioning:** Round 2 and Round 3 interviewers repeatedly ask generic, introductory questions that the candidate already aced in Round 1.
- **Unaddressed Gaps:** Key weaknesses observed in early rounds (such as database indexing, distributed edge cases, or bundling) are never systematically tracked or followed up.
- **Gut Feeling vs Objective Evidence:** Evaluations devolve into subjective impressions rather than data-driven progression tracking.

## 2. Solution
**HireRecall AI** is a Recruitment Memory Agent that uses **persistent Hindsight memory** to remember candidate interactions and continuously improve future interviews.

Instead of a stateless chatbot or isolated ATS form, HireRecall AI uses Vectorize Hindsight as its persistent cognitive memory layer:
- Remembers what candidate demonstrated in Round 1.
- Automatically instructs Round 2 interviewers on which proven skills to **bypass**.
- Targets Round 2 questions directly at **unresolved technical gaps**.
- Deepens Round 3 questions into production-scale architecture scenarios.
- Tracks candidate evolution across rounds (Solid, Active Gap, Improved, Not Evaluated).

---

## 3. How HireRecall AI Uses Hindsight

HireRecall integrates with Vectorize Hindsight via the official **`@vectorize-io/hindsight-client`** npm package. Hindsight is the actual persistent memory engine of the application:

1. **Retain → Stores Interview Experiences & Observations**
   - Retains structured candidate experiences (round number, interviewer, questions asked).
   - Retains fine-grained observations (sentiment-tagged strengths and gaps).
   - Retains candidate world facts (resume credentials, technical tags).
   - Scopes all data with strict candidate identity tags (`candidate_${candidateId}`).

2. **Recall → Retrieves Relevant Candidate History**
   - Queries Hindsight when preparing subsequent interview rounds.
   - Enforces candidate isolation (`tags: ['candidate_' + candidateId]`, `tagsMatch: 'any_strict'`).
   - Retrieves historical feedback, verified strengths, and critical gaps without keyword matching or local shortcuts.

3. **Reflect → Generates Recruiter-Oriented Reasoning**
   - Analyzes cross-round candidate evolution.
   - Synthesizes whether earlier gaps were resolved (transitioning from 🔴 Weak to 🟠 Improved).
   - Provides recruiters with holistic trajectory recommendations.

---

## 4. Architecture

```text
Recruiter / Interviewer
       ↓
  HireRecall AI
       ↓
Interview Feedback & Evidence
       ↓
REAL HINDSIGHT RETAIN (Official @vectorize-io/hindsight-client)
       ↓
Persistent Candidate Memory Bank (hirerecall_recruitment)
       ↓
REAL HINDSIGHT RECALL (Strict Candidate Isolation)
       ↓
Relevant Candidate Memories & Gaps
       ↓
AI Interview Planner (Personalized Next-Round Plan)
       ↓
Avoid Proven Skills | Target Critical Gaps | Escalate Scenario Depth
       ↓
New Interview Feedback Recorded
       ↓
REAL HINDSIGHT RETAIN
       ↓
Memory Improves & Evolves Over Time
```

### Data Separation
- **Application Database (SQLite / JSON Adapter):** Users, candidates, job roles, interview metadata, authentication tokens, UI state.
- **Vectorize Hindsight Memory Bank (`hirerecall_recruitment`):** Candidate interview memories, strengths, weaknesses, prior feedback, historical observations, cross-round reflections.

---

## 5. Environment & Configuration

Create or verify `backend/.env` (template provided in `.env.example`):

```env
# Server Configuration
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Hindsight Configuration (Official @vectorize-io/hindsight-client)
HINDSIGHT_MODE=remote
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
HINDSIGHT_BANK_ID=hirerecall_recruitment
HINDSIGHT_API_KEY=your_hindsight_api_key_here

# AI Intelligence Provider Configuration
AI_PROVIDER=embedded   # Options: embedded | gemini | openai
# GEMINI_API_KEY=      # Optional: Google Gemini API key
# OPENAI_API_KEY=      # Optional: OpenAI API key
```

---

## 6. Real Hindsight Memory Subsystem

HireRecall AI connects to **Vectorize Hindsight** as its real persistent memory engine via the official `@vectorize-io/hindsight-client` library.

### Primary Setup: Hindsight Cloud (Active)
In `backend/.env`:
```env
HINDSIGHT_MODE=remote
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
HINDSIGHT_BANK_ID=hirerecall_recruitment
HINDSIGHT_API_KEY=your_hindsight_api_key_here
```
With this setup, all candidate Retain, Recall, and Reflect calls communicate directly with the live Vectorize Hindsight Cloud service in the `hirerecall_recruitment` bank.

### Optional Alternative: Self-Hosted Hindsight
If you prefer running a local Hindsight instance instead of Hindsight Cloud:
- **Via Docker:**
  ```bash
  docker run -d --name hindsight -p 8888:8888 -p 9999:9999 \
    -e HINDSIGHT_API_LLM_API_KEY=$OPENAI_API_KEY \
    ghcr.io/vectorize-io/hindsight:latest
  ```
- **Via Python:**
  ```bash
  pip install hindsight-api
  hindsight-api
  ```
  And set `HINDSIGHT_BASE_URL=http://localhost:8888` in `backend/.env`.

### Verify Hindsight Connection
```bash
curl http://localhost:5000/api/hindsight/health
```
Returns:
```json
{
  "success": true,
  "connected": true,
  "mode": "remote",
  "engine": "Official Vectorize Hindsight API",
  "bank": "hirerecall_recruitment",
  "version": "0.10.1"
}
```

---

## 7. Running HireRecall AI

### 1. Install & Start Backend (Port 5000)
```bash
cd Hack_With_Hyd/backend
npm install
npm run dev
```
The backend starts at `http://localhost:5000`.

### 2. Install & Start Frontend (Port 3000)
```bash
cd Hack_With_Hyd/frontend
npm install
npm run dev
```
The frontend starts at `http://localhost:3000`.

---

## 8. Demo Flow

The end-to-end recruitment memory progression follows this exact cycle:

```text
Round 1 (Technical Screening)
  ↓ Retain into Hindsight (Candidate aced Python; struggled with MongoDB indexing)
Prepare Round 2
  ↓ Recall from Hindsight
Personalized Questions (Avoid Python syntax; test MongoDB indexing & explain plans)
  ↓ Conduct Round 2
Round 2 Feedback (Candidate improved in indexing; now weak in distributed consensus)
  ↓ Retain into Hindsight
Prepare Round 3
  ↓ Recall & Reflect from Hindsight
Improved Recommendation (Database indexing marked Improved; questions escalate to 50M records / ESR rules / distributed consensus)
```

### 3-Minute Walkthrough:
1. **Sign In:** Go to `http://localhost:3000/login` and click **"1-Click Hackathon Demo Login"** (Recruiter: Priya Sharma).
2. **Verify Live Status:** Notice the top navbar pill: **`● Hindsight Connected (hirerecall_recruitment)`**.
3. **Select Hero Candidate:** Click **"Demo Story: Rahul Sharma"** (Backend Developer).
4. **Prepare Next Interview:** Click **"🎯 Prepare Next Interview"**:
   - Observes recalled Round 1 memory.
   - Avoids basic Python (already proven).
   - Targets MongoDB indexing & query planning.
5. **Record Round 2 Feedback:** Submit feedback with improved indexing understanding.
6. **Watch Evolution:** Go to **Candidate Evolution** — observe Database Architecture move from 🔴 Weak to 🟠 **Improved**!
7. **Verify Candidate Isolation:** Switch to **Ananya Rao** (Frontend Developer) — observe her plan targets Webpack & React with **0% traces of Python or MongoDB**!

---

## 9. Automated 21-Step Verification Suite

To verify real Hindsight end-to-end:
```bash
cd Hack_With_Hyd/backend
npm test
# or: node test_flows.js
```
The suite executes the complete 21-step verification sequence:
1. Hindsight health check
2. Recruiter authentication
3. Candidate selection (Rahul)
4. Retain Round 1 feedback
5. Recall Rahul memories
6. Verify Round 1 memories exist in Real Hindsight
7. Generate Round 2 interview plan
8. Verify Round 2 targets R1 gaps & avoids proven topics
9. Retain Round 2 feedback (indexing improved)
10. Recall Rahul again
11. Generate Round 3 plan
12. Verify Round 3 questions deepen into ESR rules & 50M records scale
13. Candidate selection (Ananya)
14. Retain Ananya frontend memory
15. Recall Rahul memories
16. Verify ZERO leakage from Ananya into Rahul
17. Recall Ananya memories
18. Verify ZERO leakage from Rahul into Ananya
19. Test Before vs After comparison
20. Test Memory Explorer
21. Test chatbot memory retrieval
Prints **`REAL HINDSIGHT END-TO-END TEST PASSED`** upon 100% genuine success.

---

## 10. Ethical AI Guardrail
> **HireRecall AI assists human recruiters; it does NOT make automated hiring or rejection decisions.**  
> Hindsight retains evidence, tracks progression, and crafts intelligent questions. All hiring outcomes remain 100% human-directed.
