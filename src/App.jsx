import { useEffect, useMemo, useState } from "react";
import "./App.css";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function minLabel(m) {
  return `${m} min`;
}

function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function generatePlan({ task, mood, energy, minutes }) {
  const total = clamp(Number(minutes) || 0, 10, 240);

  const warmup = mood === "anxious" ? 5 : mood === "tired" ? 4 : 3;
  const cooldown = mood === "anxious" ? 4 : 3;

  let focusBlock = 25;
  if (energy === "low") focusBlock = 15;
  if (energy === "medium") focusBlock = 25;
  if (energy === "high") focusBlock = task === "creative" ? 35 : 30;

  const shortBreak = mood === "anxious" ? 5 : 4;
  const longBreak = mood === "anxious" ? 8 : 6;

  let remaining = total - warmup - cooldown;

  if (remaining < 10) {
    return [
      {
        type: "warmup",
        title: "Warm-up",
        minutes: warmup,
        prompt:
          mood === "anxious"
            ? "Box breathing (4-4-4-4) while music ramps up."
            : "Gentle ramp-in track. Set intention for the session.",
      },
      {
        type: "focus",
        title: "Focus Sprint",
        minutes: remaining,
        prompt: "One small, clear goal. No multitasking.",
      },
      {
        type: "cooldown",
        title: "Cool-down",
        minutes: cooldown,
        prompt: "Slow track + quick reflection: what moved forward?",
      },
    ];
  }

  const steps = [];

  steps.push({
    type: "warmup",
    title: "Warm-up",
    minutes: warmup,
    prompt:
      mood === "anxious"
        ? "Box breathing (4-4-4-4) + a steady, safe track."
        : "Ramp-in track. Pick ONE goal for this session.",
  });

  let focusCount = 0;

  while (remaining > 0) {
    const thisFocus = Math.min(focusBlock, remaining);
    if (thisFocus < 8) break;

    focusCount += 1;
    steps.push({
      type: "focus",
      title: `Focus Block ${focusCount}`,
      minutes: thisFocus,
      prompt:
        task === "studying"
          ? "Active recall: quiz yourself, do not just reread."
          : task === "writing"
          ? "Draft first. Do not edit yet."
          : task === "creative"
          ? "Flow mode: generate ideas fast, no judgment."
          : task === "mcat"
          ? "Do practice questions, then review mistakes."
          : "One thing at a time. Finish the smallest next step.",
    });

    remaining -= thisFocus;
    if (remaining <= 0) break;

    const isLong = focusCount % 3 === 0;
    const breakLen = Math.min(isLong ? longBreak : shortBreak, remaining);
    if (breakLen < 2) break;

    steps.push({
      type: "break",
      title: isLong ? "Long Break" : "Short Break",
      minutes: breakLen,
      prompt:
        mood === "anxious"
          ? "Breathing reset: inhale 4, exhale 6 for the whole break."
          : "Stand up, water, quick stretch. No scrolling.",
    });

    remaining -= breakLen;
  }

  steps.push({
    type: "cooldown",
    title: "Cool-down",
    minutes: cooldown,
    prompt:
      task === "studying" || task === "mcat"
        ? "Write 3 bullets: what you learned and what comes next."
        : "Quick reflection: what did you complete and what comes next?",
  });

  const planned = steps.reduce((sum, s) => sum + s.minutes, 0);
  const diff = total - planned;

  if (diff > 0) {
    steps[steps.length - 1] = {
      ...steps[steps.length - 1],
      minutes: steps[steps.length - 1].minutes + diff,
    };
  }

  return steps;
}

function StepCard({ step, isActive }) {
  return (
    <div className={`step-card ${isActive ? "active-step" : ""}`}>
      <div className="step-header">
        <div className="step-title">{step.title}</div>
        <div className="badge">
          {step.type.toUpperCase()} • {minLabel(step.minutes)}
        </div>
      </div>
      <div className="step-prompt">{step.prompt}</div>
    </div>
  );
}

export default function App() {
  const [task, setTask] = useState("studying");
  const [mood, setMood] = useState("anxious");
  const [energy, setEnergy] = useState("low");
  const [minutes, setMinutes] = useState(45);

  const [plan, setPlan] = useState(null);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);

  const inputs = useMemo(
    () => ({ task, mood, energy, minutes }),
    [task, mood, energy, minutes]
  );

  const totalPlanned = plan
    ? plan.reduce((sum, s) => sum + s.minutes, 0)
    : 0;

  const currentStep = plan ? plan[currentStepIndex] : null;

  useEffect(() => {
    if (!isRunning || !sessionStarted || !currentStep) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        if (currentStepIndex < plan.length - 1) {
          setCurrentStepIndex((prevIndex) => prevIndex + 1);
          return plan[currentStepIndex + 1].minutes * 60;
        }

        setIsRunning(false);
        return 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, sessionStarted, currentStep, currentStepIndex, plan]);

  function handleGeneratePlan() {
    const newPlan = generatePlan(inputs);
    setPlan(newPlan);
    setCurrentStepIndex(0);
    setSessionStarted(false);
    setIsRunning(false);
    setSecondsLeft(0);
  }

  function handleStartSession() {
    if (!plan || plan.length === 0) return;

    setSessionStarted(true);
    setCurrentStepIndex(0);
    setSecondsLeft(plan[0].minutes * 60);
    setIsRunning(true);
  }

  function handlePauseResume() {
    setIsRunning((prev) => !prev);
  }

  function handleResetSession() {
    if (!plan || plan.length === 0) return;

    setSessionStarted(false);
    setIsRunning(false);
    setCurrentStepIndex(0);
    setSecondsLeft(0);
  }

  function handleNextStep() {
    if (!plan) return;

    if (currentStepIndex < plan.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setSecondsLeft(plan[nextIndex].minutes * 60);
    } else {
      setIsRunning(false);
      setSecondsLeft(0);
    }
  }

  return (
    <div className="container">
      <header className="page-header">
        <div className="eyebrow">NeuroSciTunes</div>
        <h1>NeuroMix</h1>
        <p className="subtitle">
          Build a guided focus session based on mood, energy, task, and time.
        </p>
      </header>

      <div className="card">
        <h2>Inputs</h2>

        <div className="form-grid">
          <label>
            <span>Task</span>
            <select value={task} onChange={(e) => setTask(e.target.value)}>
              <option value="studying">Studying</option>
              <option value="writing">Writing</option>
              <option value="creative">Creative</option>
              <option value="admin">Admin / chores</option>
              <option value="mcat">MCAT</option>
            </select>
          </label>

          <label>
            <span>Mood</span>
            <select value={mood} onChange={(e) => setMood(e.target.value)}>
              <option value="anxious">Anxious</option>
              <option value="neutral">Neutral</option>
              <option value="tired">Tired</option>
              <option value="motivated">Motivated</option>
            </select>
          </label>

          <label>
            <span>Energy</span>
            <select value={energy} onChange={(e) => setEnergy(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          <label>
            <span>Minutes (10-240)</span>
            <input
              type="number"
              min={10}
              max={240}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
            />
          </label>
        </div>

        <div className="button-row">
          <button className="primary" onClick={handleGeneratePlan}>
            Generate Plan
          </button>
          <button
            className="secondary"
            onClick={() => {
              setPlan(null);
              setSessionStarted(false);
              setIsRunning(false);
              setCurrentStepIndex(0);
              setSecondsLeft(0);
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Session Plan</h2>

        {!plan ? (
          <p className="empty-text">
            Generate a plan to see your warm-up, focus blocks, breaks, and cool-down.
          </p>
        ) : (
          <>
            <p className="summary-text">
              Total planned: <strong>{totalPlanned} minutes</strong>
            </p>

            <div className="step-list">
              {plan.map((step, index) => (
                <StepCard
                  key={index}
                  step={step}
                  isActive={sessionStarted && index === currentStepIndex}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {plan && (
        <div className="card">
          <h2>Session Runner</h2>

          {!sessionStarted ? (
            <div className="runner-box">
              <p>Your plan is ready.</p>
              <button className="primary" onClick={handleStartSession}>
                Start Session
              </button>
            </div>
          ) : (
            <div className="runner-box">
              <div className="current-step-label">Current Step</div>
              <div className="current-step-title">
                {currentStep ? currentStep.title : "Session Complete"}
              </div>
              <div className="timer">{formatTime(secondsLeft)}</div>

              {currentStep && <p className="runner-prompt">{currentStep.prompt}</p>}

              <div className="button-row">
                <button className="primary" onClick={handlePauseResume}>
                  {isRunning ? "Pause" : "Resume"}
                </button>
                <button className="secondary" onClick={handleNextStep}>
                  Next Step
                </button>
                <button className="secondary" onClick={handleResetSession}>
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}