"use client";

import { useEffect, useState } from "react";
import { useRef } from "react";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}
const cardStyle = {
  background: "rgba(255,255,255,0.04)",
  backdropFilter: "blur(16px)",
  borderRadius: "18px",
  padding: "24px",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
};


const primaryBtn = {
  background: "linear-gradient(135deg, #7C3AED, #A855F7)",
  color: "#fff",
  border: "none",
  padding: "12px 20px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: 600,
  boxShadow: "0 0 25px rgba(124,58,237,0.4)",
  transition: "0.3s ease",
};

const secondaryBtn = {
  background: "rgba(255,255,255,0.05)",
  color: "#E5E7EB",
  border: "1px solid rgba(255,255,255,0.1)",
  padding: "10px 16px",
  borderRadius: "12px",
  cursor: "pointer",
  transition: "0.25s",
};





export default function InterviewPage() {
  // -------- DOMAIN & QUESTIONS --------
  const [domain, setDomain] = useState("");
  const [level, setLevel] = useState("mid");
  const [questions, setQuestions] = useState<string[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  // const [sessionId, setSessionId] = useState<string | null>(null);
  // const [sessionId, setSessionId] = useState<string | null>(null);

const canvasRef = useRef<HTMLCanvasElement | null>(null);
const audioContextRef = useRef<AudioContext | null>(null);
const analyserRef = useRef<AnalyserNode | null>(null);
const [audioLevel, setAudioLevel] = useState(0);
  // -------- INTERVIEW STATE --------
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paused, setPaused] = useState(false);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSubmitting, setAutoSubmitting] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
const [audioURL, setAudioURL] = useState<string | null>(null);
const [transitioning, setTransitioning] = useState(false);
const [completed, setCompleted] = useState(false);
const [finalScores, setFinalScores] = useState<number[]>([]);


  // -------- TIMER --------
  const QUESTION_TIME = 60;
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);

  // -------- GENERATE QUESTIONS --------
  
  const generateQuestions = async () => {
    
    // if (sessionId) return;
    if (!domain.trim()) {
  setError("Please enter a domain before starting the interview.");
  return;
}

    setLoadingQuestions(true);
    setError("");

    try {
      const res = await fetch("/api/ai/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, level }),
      });

      if (!res.ok) {
  const err = await res.json();
  throw new Error(err.error);
}

const data = await res.json();

      setQuestions(data.questions.slice(0, 5));
      setCurrentIndex(0);
      setAnswer("");
    } catch (err: any) {
  setError(
    err.message ||
    "AI service unavailable. Please try again later."
  );
  // setSessionId(crypto.randomUUID());
  setQuestions([]);

}
 finally {
      setLoadingQuestions(false);
    }
  };
  const speakQuestion = (text: string) => {
  if (!window.speechSynthesis) {
    alert("Text-to-speech not supported in this browser");
    return;
  }

  // Stop any previous speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  if (voice) {
  utterance.voice = voice;
}
  utterance.lang = "en-US";
  utterance.rate = 1;   // speed (0.8–1.1 is good)
  utterance.pitch = 1; // voice pitch

  utterance.onend = () => {
    startListening(); 
  };
  window.speechSynthesis.speak(utterance);
};

const pauseInterview = () => {
  setPaused(true);
  window.speechSynthesis.pause();
};

const resumeInterview = () => {
  setPaused(false);
  window.speechSynthesis.resume();
};


  // -------- CURRENT QUESTION --------
  const currentQuestion = questions[currentIndex];
  const isLastQuestion =
    questions.length > 0 &&
    currentIndex === questions.length - 1;

  // -------- TIMER LOGIC --------
 useEffect(() => {
  if (questions.length === 0 || paused || completed) return;

  const timer = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(timer);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [currentIndex, questions.length, paused, completed]);

useEffect(() => {
  if (timeLeft === 0 && !loading && !autoSubmitting && !completed) {
    setAutoSubmitting(true);
    handleNext();
  }
}, [timeLeft]);


  useEffect(() => {
  if (questions.length > 0 && currentQuestion) {
    speakQuestion(currentQuestion);
  }
}, [currentQuestion]);
useEffect(() => {
  const loadVoices = () => {
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) => v.lang === "en-US" && v.name.includes("Google")
    );
    setVoice(preferred || voices[0]);
  };

  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}, []);

useEffect(() => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    setDarkMode(true);
  }
}, []);
useEffect(() => {
  localStorage.setItem("theme", darkMode ? "dark" : "light");
}, [darkMode]);

useEffect(() => {
  if (questions.length === 0 || paused) return;

  setTimeLeft(QUESTION_TIME);

  const timer = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(timer);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [currentIndex, questions.length, paused]);
useEffect(() => {
  const checkAuth = async () => {
    const res = await fetch("/api/auth/me");
    if (!res.ok) {
      window.location.href = "/login";
    }
  };

  checkAuth();
}, []);

const visualize = () => {
  const analyser = analyserRef.current;
  if (!analyser) return;

  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  const update = () => {
    requestAnimationFrame(update);

    analyser.getByteFrequencyData(dataArray);

    // 🔥 get average volume
    const avg =
      dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

    setAudioLevel(avg);
  };

  update();
};
const [smoothedLevel, setSmoothedLevel] = useState(0);

useEffect(() => {
  const smoothing = setInterval(() => {
    setSmoothedLevel((prev) => prev + (audioLevel - prev) * 0.2);
  }, 50);

  return () => clearInterval(smoothing);
}, [audioLevel]);

useEffect(() => {
  if (domain.toLowerCase().includes("intern")) {
    setLevel("junior");
  } else if (domain.toLowerCase().includes("senior")) {
    setLevel("senior");
  }
}, [domain]);
  // -------- VOICE INPUT --------
  const startListening = () => {
  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();

  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);

  analyser.fftSize = 256;

  audioContextRef.current = audioContext;
  analyserRef.current = analyser;

  visualize(); // 🔥 start animation

  // existing recorder logic
  const recorder = new MediaRecorder(stream);
  const chunks: BlobPart[] = [];

  recorder.ondataavailable = (e) => chunks.push(e.data);
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: "audio/webm" });
    setAudioURL(URL.createObjectURL(blob));
  };

  recorder.start(1000);
  setMediaRecorder(recorder);
});

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setAnswer((prev) => prev + " " + transcript);
    };

    recognition.start();
  };

  // -------- SUBMIT ANSWER --------
  const handleNext = async () => {
    if (loading) return;
    if (!answer.trim()) {
      setError("Please enter an answer");
      return;
    }

    setError("");
    setLoading(true);

    try {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
  mediaRecorder.stop();
}
      const evalRes = await fetch("/api/ai/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion,
          answer,
        }),
      });

      const aiData = await evalRes.json();

      await fetch("/api/interview", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    // ✅ IMPORTANT
    domain,
    level,
    question: currentQuestion,
    answer,
    score: aiData.score,
    feedback: {
      strengths: aiData.strengths,
      weaknesses: aiData.weaknesses,
      improvedAnswer: aiData.improvedAnswer,
    },
  }),
});

setFinalScores((prev) => [...prev, aiData.score]);

      if (isLastQuestion) {
  setCompleted(true);
  return;
} else {
  setTransitioning(true);

  setTimeout(() => {
  setCurrentIndex((prev) => prev + 1);
  setAnswer("");
  setTimeLeft(QUESTION_TIME); // 🔥 ADD THIS
  setTransitioning(false);
}, 300);
}

    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
      setAutoSubmitting(false);
    }
  };

  return (
    
    <div className="hero">
      <div className="global-bg">

      <div className="light-ray ray-1" data-speed="0.05" />
      <div className="light-ray ray-2" data-speed="0.08" />
      <div className="light-ray ray-3" data-speed="0.1" />
      </div>
        
      <div className="content">
        <div style={{
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "24px"
}}>
  <div>
    <h1 style={{ fontSize: "26px", fontWeight: 700 }}>
      AI Mock Interview
    </h1>
    <p style={{ color: "#94a3b8", fontSize: "14px" }}>
      Domain-based, timed interview with AI feedback
    </p>
  </div>

  {questions.length > 0 && !completed && (
    <div className={`timer ${timeLeft <= 10 ? "danger" : ""}`}>
  ⏱ {timeLeft}s
</div>
  )}
</div>

    <div
      style={{
        maxWidth: "700px",
        margin: "40px auto",
      }}
    >

      {/* <h1 style={{ fontSize: "28px", fontWeight: 700 }}>
  🎤 AI Mock Interview
</h1>
<p style={{ color: "#64748b", marginTop: "4px" }}>
  Practice real interview questions with AI feedback
</p> */}


      {/* -------- DOMAIN INPUT -------- */}
        {questions.length === 0 && (
  <div className="setup-card">

    <div className="setup-header">
      <h2>Interview Setup</h2>
      <p className="muted">
        Choose your role and difficulty to begin
      </p>
    </div>

    <div className="setup-form">

      {/* DOMAIN */}
      <div className="form-group">
        <label>Interview Domain</label>
        <div className="quick-roles">
  {["Frontend Developer", "Backend Developer", "AI Engineer", "Data Scientist"].map((role) => (
    <button
      key={role}
      className="role-chip"
      onClick={() => setDomain(role)}
    >
      {role}
    </button>
  ))}
</div>
        <input
  type="text"
  placeholder="Try: AI Engineer, Product Manager, SDE..."
  value={domain}
  onChange={(e) => setDomain(e.target.value)}
  className="input-field"
/>
      </div>

      {/* LEVEL */}
      <div className="form-group">
  <label>Difficulty Level</label>

  <select
    value={level}
    onChange={(e) => setLevel(e.target.value)}
    className="select-field"
  >
    <option value="junior">Junior</option>
    <option value="mid">Mid</option>
    <option value="senior">Senior</option>
  </select>

  <p className="level-hint">
    {level === "junior" && "Basic concepts and fundamentals"}
    {level === "mid" && "Real-world problem solving"}
    {level === "senior" && "System design & deep knowledge"}
  </p>
</div>

      {/* BUTTON */}
      <button
  onClick={generateQuestions}
  disabled={loadingQuestions || !domain}
  className="primary-btn full-width"
>
  {loadingQuestions ? "Generating AI Questions..." : "Start Interview"}
</button>


      {/* ERROR */}
      {error && (
        <p className="error-text">{error}</p>
      )}

    </div>
  </div>
)}
    {completed && (
  <div className="completion-card">

    {/* HEADER */}
    <div className="completion-header">
      <div className="success-icon">✓</div>

      <h2>Interview Completed</h2>

      <p className="muted">
        You’ve successfully completed your AI mock interview
      </p>
    </div>

    {/* SCORE */}
    <div className="score-box">
      <p className="score-label">Average Score</p>

      <h1 className="score-value">
        {(
          finalScores.reduce((a, b) => a + b, 0) /
          finalScores.length
        ).toFixed(1)}
        <span>/10</span>
      </h1>
    </div>

    {/* MESSAGE */}
    <p className="completion-subtext">
      Great job! Keep practicing to improve consistency and confidence.
    </p>

    {/* ACTIONS */}
    <div className="completion-actions">
      <button
        className="primary-btn"
        onClick={() => (window.location.href = "/dashboard")}
      >
        📊 View Dashboard
      </button>

      <button
        className="secondary-btn"
        onClick={() => window.location.reload()}
      >
        🔁 Try Again
      </button>
    </div>

  </div>
)}

      {/* -------- INTERVIEW UI -------- */}
      {questions.length > 0 && !completed && (
        <div>

          <p style={{ color: "#666" }}>
            Domain: <strong>{domain}</strong> | Level:{" "}
            <strong>{level}</strong> | Question{" "}
            {currentIndex + 1} of {questions.length}
          </p>
<div className="controls-bar">

  <div className="controls-left">
    <button onClick={pauseInterview} className="secondary-btn">⏸ Pause</button>
    <button onClick={resumeInterview} className="secondary-btn">▶ Resume</button>
    <button onClick={startListening} className="secondary-btn">🎤 Speak</button>
  </div>

  <button
    onClick={handleNext}
    disabled={loading}
    className="primary-btn"
  >
    {loading
      ? "Evaluating..."
      : isLastQuestion
      ? "Finish Interview"
      : "Next Question"}
  </button>

</div>


<select
  onChange={(e) => {
    const voices = window.speechSynthesis.getVoices();
    setVoice(voices[Number(e.target.value)]);
  }}
  style={{backgroundColor: "transparent", color: "white"}}
>
  {window.speechSynthesis.getVoices().map((v, i) => (
    <option key={i} value={i}>
      {v.name}
    </option>
  ))}
</select>

<div className="question-wrapper">
          <div
  key={currentIndex}
    className={`question-card ${
    transitioning ? "fade-out" : "fade-in"
  }`}
    
>
  <p style={{
  fontSize: "13px",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "#64748b",
  marginBottom: "6px"
}}>
  Question {currentIndex + 1} of {questions.length}
</p>

  <p style={{ fontSize: "16px", lineHeight: "1.6" }}>
    {currentQuestion}
  </p>

  <button
    onClick={() => speakQuestion(currentQuestion)}
    style={{ ...secondaryBtn, marginTop: "12px" }}
  >
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="m400-400 240-160-240-160v320ZM80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm126-240h594v-480H160v525l46-45Zm-46 0v-480 480Z"/></svg> Read Question
  </button>
</div>
</div>
{mediaRecorder && (
  <div className="voice-orb-wrapper">
    <div
      className="voice-orb"
      style={{
        transform: `scale(${1 + smoothedLevel * 0.005})`
      }}
    />
  </div>
)}


        <textarea
  placeholder="Speak or type your answer here..."
  value={answer}
  onChange={(e) => setAnswer(e.target.value)}
  className="answer-box"
/>



          {/* {audioURL && (
  <div style={{ marginTop: "10px" }}>
    <p>🎧 Your Recorded Answer:</p>
    <audio controls src={audioURL} />
  </div>
)} */}

        </div>
      )}
    </div>

    
  </div>
  </div>
  );
}
