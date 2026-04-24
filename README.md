# InterviewGuide - AI Mock Interview Platform 

An **AI-powered mock interview platform** that simulates real technical interviews, evaluates answers using LLMs, and provides **structured feedback, scoring, and performance analytics** — all inside a modern, immersive interface.

> Built to help students and job seekers turn interview anxiety into confidence.

---

## Features

### AI Interview Experience
- Domain-based interview generation (Frontend, Backend, AI, etc.)
- Difficulty levels: Junior / Mid / Senior
- Real-time AI-generated interview questions
- Text-to-Speech question narration
- Optional speech-to-text answer input

### Smart Evaluation & Feedback
- AI-evaluated answers with:
  -  Score (0–10)
  -  Strengths
  -  Weaknesses
  -  Improved Answer
- Feedback generated per question
- Average score calculation per interview

###  Interview Dashboard
- View all past interviews
- Expand each interview to see:
  - Question
  - Your Answer
  - AI Feedback
- Performance analytics:
  - Average Score
  - Best Score
  - Interview Streak
  - Weekly Consistency
- Achievement badges for milestones

###  PDF Export
- Export interviews as **professionally formatted PDF reports**
- Includes:
  - Interview domain & date
  - Questions and answers
  - Strengths, weaknesses, and improved answers

###  Authentication
- Secure login & signup
- JWT-based authentication
- Protected dashboard routes

---

##  Tech Stack

### Frontend
- **Next.js (App Router)**
- **React**
- Tailwind CSS + custom animations
- Web Speech API (Text-to-Speech & Speech Recognition)

### Backend
- Next.js API Routes
- **Groq API (LLaMA 3.1)** for AI evaluation
- JWT authentication

### Database
- **MongoDB Atlas**
- **Prisma ORM**

---

## System Architecture

Frontend (Next.js)
↓
API Routes (/api)
↓
Groq LLM (Evaluation)
↓
MongoDB Atlas (Interview Storage)

Each interview answer is:
1. Sent to the AI model for evaluation
2. Parsed into structured feedback
3. Stored securely in MongoDB
4. Displayed in the dashboard with analytics

---
