"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}
const cardStyle = {
  background: "#ffffff",
  borderRadius: "12px",
  padding: "20px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
};

const primaryBtn = {
  backgroundColor: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "10px 18px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 500,
};

const secondaryBtn = {
  backgroundColor: "#0f172a",
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: "8px",
  cursor: "pointer",
};


export default function InterviewPage() {
  // -------- DOMAIN & QUESTIONS --------
  const [domain, setDomain] = useState("");
  const [level, setLevel] = useState("mid");
  const [questions, setQuestions] = useState<string[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  // const [sessionId, setSessionId] = useState<string | null>(null);
  // const [sessionId, setSessionId] = useState<string | null>(null);



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

      setQuestions(data.questions);
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
    if (questions.length === 0) return;

    setTimeLeft(QUESTION_TIME);

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, questions.length, paused]);

  useEffect(() => {
  if (
    timeLeft <= 0 &&
    questions.length > 0 &&
    !loading &&
    !autoSubmitting
  ) {
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

  // -------- VOICE INPUT --------
  const startListening = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
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
} else {
  setTransitioning(true);

  setTimeout(() => {
    setCurrentIndex((prev) => prev + 1);
    setAnswer("");
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
    <div style={{
      padding: "6px 12px",
      borderRadius: "999px",
      background: timeLeft <= 10 ? "#fee2e2" : "#e0f2fe",
      color: timeLeft <= 10 ? "#b91c1c" : "#0369a1",
      fontWeight: 600
    }}>
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
  <div style={{
    ...cardStyle,
    marginTop: "24px"
  }}>
    <h3 style={{ marginBottom: "8px" }}>
      Interview Setup
    </h3>
    <p style={{ color: "#64748b", fontSize: "14px" }}>
      Choose a role and difficulty to begin
    </p>

          <h3>Enter your interview domain</h3>

          <input
            type="text"
            placeholder="e.g. AI Engineer, Full Stack Developer, Data Scientist"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            style={{ width: "100%", padding: "10px", marginTop: "10px" }}
          />

          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            style={{ marginTop: "10px", padding: "8px" }}
          >
            <option value="junior">Junior</option>
            <option value="mid">Mid</option>
            <option value="senior">Senior</option>
          </select>

          <button
  onClick={generateQuestions}
  disabled={loadingQuestions}
  style={{
    marginTop: "15px",
    padding: "10px 20px",
    opacity: loadingQuestions ? 0.6 : 1,
    cursor: loadingQuestions ? "not-allowed" : "pointer",
  }}
>
  {loadingQuestions ? "Generating..." : "Start Interview"}
</button>

{error && (
  <p style={{ color: "red", marginTop: "10px" }}>
    {error}
  </p>
  
)}
        </div>
      )}
      {completed && (
  <div
    style={{
      ...cardStyle,
      marginTop: "40px",
      textAlign: "center",
      backgroundColor: darkMode ? "#020617" : "#ffffff",
    }}
  >
    <h2 style={{ fontSize: "24px", fontWeight: 700 }}>
  Interview Complete <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#17cf1a"><path d="M240-40v-329L110-580l185-300h370l185 300-130 211v329l-240-80-240 80Zm80-111 160-53 160 53v-129H320v129Zm20-649L204-580l136 220h280l136-220-136-220H340Zm98 383L296-558l57-57 85 85 169-170 57 56-226 227ZM320-280h320-320Z"/></svg>
</h2>

<p style={{ color: "#94a3b8", marginTop: "6px" }}>
  You’ve completed a full AI-driven interview simulation.
</p>


    <p style={{ marginTop: "10px", color: "#64748b" }}>
      Great job! Here's a quick summary.
    </p>

    <h3 style={{ marginTop: "20px" }}>
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFF55"><path d="M480-644v236l96 74-36-122 90-64H518l-38-124ZM233-120l93-304L80-600h304l96-320 96 320h304L634-424l93 304-247-188-247 188Z"/></svg> Average Score:{" "}
      {(
        finalScores.reduce((a, b) => a + b, 0) /
        finalScores.length
      ).toFixed(1)}
      /10
    </h3>

    <div style={{ marginTop: "30px", display: "flex", gap: "12px", justifyContent: "center" }}>
      <button
        style={primaryBtn}
        onClick={() => (window.location.href = "/dashboard")}
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M520-600v-240h320v240H520ZM120-440v-400h320v400H120Zm400 320v-400h320v400H520Zm-400 0v-240h320v240H120Zm80-400h160v-240H200v240Zm400 320h160v-240H600v240Zm0-480h160v-80H600v80ZM200-200h160v-80H200v80Zm160-320Zm240-160Zm0 240ZM360-280Z"/></svg> Go to Dashboard
      </button>

      <button
        style={secondaryBtn}
        onClick={() => window.location.reload()}
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h240v80H200v560h560v-240h80v240q0 33-23.5 56.5T760-120H200Zm440-400v-120H520v-80h120v-120h80v120h120v80H720v120h-80Z"/></svg> Start New Interview
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
<div style={{
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "24px"
}}>
  <div style={{ display: "flex", gap: "10px" }}>
    <button onClick={pauseInterview} style={secondaryBtn}>
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M520-200v-560h240v560H520Zm-320 0v-560h240v560H200Zm400-80h80v-400h-80v400Zm-320 0h80v-400h-80v400Zm0-400v400-400Zm320 0v400-400Z"/></svg> Pause
    </button>

    <button onClick={resumeInterview} style={secondaryBtn}>
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M240-240v-480h80v480h-80Zm160 0 400-240-400-240v480Zm80-141v-198l165 99-165 99Zm0-99Z"/></svg> Resume
    </button>

    <button onClick={startListening} style={secondaryBtn}>
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M480-400q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm0-240Zm-40 520v-123q-104-14-172-93t-68-184h80q0 83 58.5 141.5T480-320q83 0 141.5-58.5T680-520h80q0 105-68 184t-172 93v123h-80Zm40-360q17 0 28.5-11.5T520-520v-240q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v240q0 17 11.5 28.5T480-480Z"/></svg>Speak
    </button>
    
  </div>

  <button
    onClick={handleNext}
    disabled={loading}
    style={{
      ...primaryBtn,
      opacity: loading ? 0.6 : 1
    }}
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
    style={{
      ...cardStyle,
      backgroundColor: darkMode ? "#020617" : "#ffffff",
      marginTop: "24px",
    }}
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



        <textarea
  placeholder="Speak or type your answer here..."
  value={answer}
  onChange={(e) => setAnswer(e.target.value)}
  style={{
    width: "100%",
    marginTop: "20px",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    fontSize: "15px",
    lineHeight: "1.6",
    resize: "vertical",
    backgroundColor: darkMode ? "#020617" : "#ffffff",
    color: darkMode ? "#ffffff" : "#000000",
  }}
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
