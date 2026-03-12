import { useEffect, useMemo, useState } from "react";
import "./App.css";

import warmupAmbient from "./assets/warmup_ambient.mp3";
import focusFlow from "./assets/focus_flow.mp3";
import deepFocus from "./assets/deep_focus.mp3";
import breakReset from "./assets/break_reset.mp3";
import calmReset from "./assets/calm_reset.mp3";
import cooldownPiano from "./assets/cooldown_piano.mp3";

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

function formatSavedDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

function getFavoriteMode(completedSessions) {
  if (!completedSessions.length) return "None yet";

  const counts = completedSessions.reduce((acc, session) => {
    const mode = session.modeLabel || "Unknown";
    acc[mode] = (acc[mode] || 0) + 1;
    return acc;
  }, {});

  let favorite = "None yet";
  let max = 0;

  for (const mode in counts) {
    if (counts[mode] > max) {
      max = counts[mode];
      favorite = mode;
    }
  }

  return favorite;
}

function getTotalFocusMinutes(completedSessions) {
  return completedSessions.reduce((sum, session) => {
    const focusMinutes = session.plan
      .filter((step) => step.type === "focus")
      .reduce((stepSum, step) => stepSum + step.minutes, 0);

    return sum + focusMinutes;
  }, 0);
}

  function getSoundForStep({ stepType, mode, mood, task, text }) {
    if (stepType === "warmup") {
      if (mode === "recovery") {
        return {
          soundTitle: "Soft Reset Soundscape",
          soundDescription:
            "Slow ambient textures with gentle movement to help your nervous system settle.",
          audioFile: calmReset,
        };
      }

      if (mood === "anxious" || text.includes("overwhelmed")) {
        return {
          soundTitle: "Steady Ambient Pad",
          soundDescription:
            "Minimal, stable sound with no sharp transitions so your mind can downshift safely.",
          audioFile: warmupAmbient,
        };
      }

      return {
        soundTitle: "Focus Warm-Up Track",
        soundDescription:
          "Light instrumental audio that helps you transition into work without overstimulation.",
        audioFile: warmupAmbient,
      };
    }

    if (stepType === "focus") {
      if (task === "creative") {
        return {
          soundTitle: "Flow-State Instrumental",
          soundDescription:
            "Melodic but non-distracting audio that supports ideation and sustained creative momentum.",
          audioFile: focusFlow,
        };
      }

      if (task === "mcat" || text.includes("exam") || text.includes("test")) {
        return {
          soundTitle: "Precision Focus Pulse",
          soundDescription:
            "Tight, low-distraction sound designed for problem solving and practice-question intensity.",
          audioFile: deepFocus,
        };
      }

      if (mode === "deepwork") {
        return {
          soundTitle: "Deep Work Drone",
          soundDescription:
            "Long-form minimal audio with almost no variation to protect deep cognitive effort.",
          audioFile: deepFocus,
        };
      }

      if (mode === "gentle") {
        return {
          soundTitle: "Low-Pressure Focus Bed",
          soundDescription:
            "Soft instrumental texture that supports concentration without feeling harsh or intense.",
          audioFile: focusFlow,
        };
      }

      return {
        soundTitle: "Low-Distraction Instrumental",
        soundDescription:
          "Steady background sound with no lyrical pull, built to reduce mental fragmentation.",
        audioFile: focusFlow,
      };
    }

    if (stepType === "break") {
      if (mode === "recovery") {
        return {
          soundTitle: "Long Exhale Reset",
          soundDescription:
            "Breathing-friendly audio with more space, ideal for releasing tension between blocks.",
          audioFile: calmReset,
        };
      }

      return {
        soundTitle: "Breathing Reset Soundscape",
        soundDescription:
          "A short decompression cue for stepping away, resetting, and avoiding doom scrolling.",
        audioFile: breakReset,
      };
    }

    return {
      soundTitle: "Soft Reflection Piano",
      soundDescription:
        "Gentle closing audio to help you review what you completed and exit the session cleanly.",
      audioFile: cooldownPiano,
    };
  }

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

function StepCard({
  step,
  isActive,
  isEditing,
  onEditToggle,
  onFieldChange,
  onSaveEdit,
  onCancelEdit,
}) {
  return (
    <div className={`step-card ${isActive ? "active-step" : ""}`}>
      <div className="step-header">
        <div className="step-title">{step.title}</div>
        <div className="badge">
          {step.type.toUpperCase()} • {minLabel(step.minutes)}
        </div>
      </div>

      {!isEditing ? (
        <>
          <div className="step-prompt">{step.prompt}</div>
          <div className="step-sound-chip">Sound: {step.soundTitle}</div>

          <div className="button-row compact-row">
            <button className="secondary" onClick={onEditToggle}>
              Edit Step
            </button>
          </div>
        </>
      ) : (
        <div className="edit-panel">
          <label>
            <span>Minutes</span>
            <input
              type="number"
              min={1}
              max={120}
              value={step.minutes}
              onChange={(e) => onFieldChange("minutes", e.target.value)}
            />
          </label>

          <label>
            <span>Prompt</span>
            <textarea
              className="situation-box"
              rows={4}
              value={step.prompt}
              onChange={(e) => onFieldChange("prompt", e.target.value)}
            />
          </label>

          <label>
            <span>Sound Title</span>
            <input
              type="text"
              value={step.soundTitle}
              onChange={(e) => onFieldChange("soundTitle", e.target.value)}
            />
          </label>

          <label>
            <span>Sound Description</span>
            <textarea
              className="situation-box"
              rows={3}
              value={step.soundDescription}
              onChange={(e) => onFieldChange("soundDescription", e.target.value)}
            />
          </label>

          <div className="button-row compact-row">
            <button className="primary" onClick={onSaveEdit}>
              Save Changes
            </button>
            <button className="secondary" onClick={onCancelEdit}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function RecentSessionCard({ session, onLoad }) {
  return (
    <div className="recent-card">
      <div className="recent-top">
        <div className="recent-title">
          {session.task} • {session.mood} • {session.minutes} min
        </div>
        <div className="recent-date">{formatSavedDate(session.createdAt)}</div>
      </div>

      <div className="recent-mode">{session.modeLabel || "Lock In"}</div>

      {session.situation ? (
        <div className="recent-situation">{session.situation}</div>
      ) : (
        <div className="recent-situation muted">No situation added</div>
      )}

      <div className="recent-meta">{session.plan.length} steps</div>

      <button className="secondary" onClick={() => onLoad(session)}>
        Load Session
      </button>
    </div>
  );
}

function FavoriteSessionCard({ session, onLoad, onRemove }) {
  return (
    <div className="favorite-card">
      <div className="recent-top">
        <div className="recent-title">
          {session.task} • {session.mood} • {session.minutes} min
        </div>
        <div className="recent-date">{formatSavedDate(session.favoritedAt)}</div>
      </div>

      <div className="recent-mode">{session.modeLabel || "Lock In"}</div>

      {session.situation ? (
        <div className="recent-situation">{session.situation}</div>
      ) : (
        <div className="recent-situation muted">No situation added</div>
      )}

      <div className="recent-meta">{session.plan.length} steps</div>

      <div className="button-row compact-row">
        <button className="secondary" onClick={() => onLoad(session)}>
          Load
        </button>
        <button className="danger-button" onClick={() => onRemove(session.id)}>
          Remove
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [task, setTask] = useState("studying");
  const [mood, setMood] = useState("anxious");
  const [energy, setEnergy] = useState("low");
  const [minutes, setMinutes] = useState(45);
  const [mode, setMode] = useState("lockin");
  const [situation, setSituation] = useState("");

  const [plan, setPlan] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [favoriteSessions, setFavoriteSessions] = useState([]);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [showCompletedBanner, setShowCompletedBanner] = useState(false);
  const [showFavoritedBanner, setShowFavoritedBanner] = useState(false);

  const [editingStepIndex, setEditingStepIndex] = useState(null);
  const [draftStep, setDraftStep] = useState(null);

  const modeOptions = {
    lockin: {
      label: "Lock In",
      description: "Longer focus blocks with tighter breaks.",
    },
    gentle: {
      label: "Gentle Start",
      description: "Lower pressure and easier momentum.",
    },
    deepwork: {
      label: "Deep Work",
      description: "Longer uninterrupted cognitive effort.",
    },
    recovery: {
      label: "Recovery Mode",
      description: "Softer pacing with more recovery time.",
    },
  };

  const inputs = useMemo(
    () => ({ task, mood, energy, minutes, situation, mode }),
    [task, mood, energy, minutes, situation, mode]
  );

  const totalPlanned = plan
    ? plan.reduce((sum, s) => sum + Number(s.minutes || 0), 0)
    : 0;

  const currentStep = plan ? plan[currentStepIndex] : null;

  const totalSessionSeconds = plan
    ? plan.reduce((sum, step) => sum + Number(step.minutes || 0) * 60, 0)
    : 0;

  const secondsCompletedBeforeCurrent = plan
    ? plan
        .slice(0, currentStepIndex)
        .reduce((sum, step) => sum + Number(step.minutes || 0) * 60, 0)
    : 0;

  const currentStepTotalSeconds = currentStep ? Number(currentStep.minutes || 0) * 60 : 0;

  const progressPercent =
    totalSessionSeconds > 0
      ? Math.min(
          100,
          Math.round(
            ((secondsCompletedBeforeCurrent +
              (currentStepTotalSeconds - secondsLeft)) /
              totalSessionSeconds) *
              100
          )
        )
      : 0;

  const totalCompletedSessions = completedSessions.length;
  const totalFocusMinutes = getTotalFocusMinutes(completedSessions);
  const favoriteMode = getFavoriteMode(completedSessions);

  useEffect(() => {
    const savedInputs = localStorage.getItem("neuromix_inputs");
    const savedPlan = localStorage.getItem("neuromix_plan");
    const savedRecent = localStorage.getItem("neuromix_recent_sessions");
    const savedFavorites = localStorage.getItem("neuromix_favorite_sessions");
    const savedCompleted = localStorage.getItem("neuromix_completed_sessions");

    if (savedInputs) {
      const parsedInputs = JSON.parse(savedInputs);
      setTask(parsedInputs.task || "studying");
      setMood(parsedInputs.mood || "anxious");
      setEnergy(parsedInputs.energy || "low");
      setMinutes(parsedInputs.minutes || 45);
      setSituation(parsedInputs.situation || "");
      setMode(parsedInputs.mode || "lockin");
    }

    if (savedPlan) {
      setPlan(JSON.parse(savedPlan));
    }

    if (savedRecent) {
      setRecentSessions(JSON.parse(savedRecent));
    }

    if (savedFavorites) {
      setFavoriteSessions(JSON.parse(savedFavorites));
    }

    if (savedCompleted) {
      setCompletedSessions(JSON.parse(savedCompleted));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("neuromix_inputs", JSON.stringify(inputs));
  }, [inputs]);

  useEffect(() => {
    if (plan) {
      localStorage.setItem("neuromix_plan", JSON.stringify(plan));
    } else {
      localStorage.removeItem("neuromix_plan");
    }
  }, [plan]);

  useEffect(() => {
    localStorage.setItem(
      "neuromix_recent_sessions",
      JSON.stringify(recentSessions)
    );
  }, [recentSessions]);

  useEffect(() => {
    localStorage.setItem(
      "neuromix_favorite_sessions",
      JSON.stringify(favoriteSessions)
    );
  }, [favoriteSessions]);

  useEffect(() => {
    localStorage.setItem(
      "neuromix_completed_sessions",
      JSON.stringify(completedSessions)
    );
  }, [completedSessions]);

  useEffect(() => {
    if (!isRunning || !sessionStarted || !currentStep) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        if (currentStepIndex < plan.length - 1) {
          setCurrentStepIndex((prevIndex) => prevIndex + 1);
          return Number(plan[currentStepIndex + 1].minutes || 0) * 60;
        }

        handleCompleteSession();
        return 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, sessionStarted, currentStep, currentStepIndex, plan]);

  function buildSessionObject(sessionIdKey = "id") {
    return {
      [sessionIdKey]: Date.now(),
      task,
      mood,
      energy,
      minutes,
      mode,
      modeLabel: modeOptions[mode].label,
      situation,
      plan,
    };
  }

  function handleGeneratePlan() {
    const newPlan = generatePlan(inputs);
    setPlan(newPlan);
    setCurrentStepIndex(0);
    setSessionStarted(false);
    setIsRunning(false);
    setSecondsLeft(0);
    setShowCompletedBanner(false);
    setShowFavoritedBanner(false);
    setEditingStepIndex(null);
    setDraftStep(null);

    const newSession = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      task,
      mood,
      energy,
      minutes,
      mode,
      modeLabel: modeOptions[mode].label,
      situation,
      plan: newPlan,
    };

    setRecentSessions((prev) => [newSession, ...prev].slice(0, 5));
  }

  function handleLoadSession(session) {
    setTask(session.task);
    setMood(session.mood);
    setEnergy(session.energy);
    setMinutes(session.minutes);
    setSituation(session.situation || "");
    setMode(session.mode || "lockin");
    setPlan(session.plan);
    setCurrentStepIndex(0);
    setSessionStarted(false);
    setIsRunning(false);
    setSecondsLeft(0);
    setShowCompletedBanner(false);
    setShowFavoritedBanner(false);
    setEditingStepIndex(null);
    setDraftStep(null);
  }

  function handleFavoriteCurrentSession() {
    if (!plan) return;

    const alreadyExists = favoriteSessions.some(
      (session) =>
        session.task === task &&
        session.mood === mood &&
        session.energy === energy &&
        Number(session.minutes) === Number(minutes) &&
        session.mode === mode &&
        session.situation === situation
    );

    if (alreadyExists) {
      setShowFavoritedBanner(true);
      return;
    }

    const favoriteSession = {
      ...buildSessionObject("id"),
      favoritedAt: new Date().toISOString(),
    };

    setFavoriteSessions((prev) => [favoriteSession, ...prev].slice(0, 10));
    setShowFavoritedBanner(true);
  }

  function handleRemoveFavorite(id) {
    setFavoriteSessions((prev) => prev.filter((session) => session.id !== id));
  }

  function handleStartSession() {
    if (!plan || plan.length === 0) return;
    setSessionStarted(true);
    setCurrentStepIndex(0);
    setSecondsLeft(Number(plan[0].minutes || 0) * 60);
    setIsRunning(true);
    setShowCompletedBanner(false);
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
    setShowCompletedBanner(false);
  }

  function handleNextStep() {
    if (!plan) return;

    if (currentStepIndex < plan.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setSecondsLeft(Number(plan[nextIndex].minutes || 0) * 60);
    } else {
      handleCompleteSession();
    }
  }

  function handleCompleteSession() {
    if (!plan) return;

    setIsRunning(false);
    setSessionStarted(false);
    setSecondsLeft(0);
    setShowCompletedBanner(true);

    const completedSession = {
      ...buildSessionObject("id"),
      completedAt: new Date().toISOString(),
    };

    setCompletedSessions((prev) => [completedSession, ...prev].slice(0, 20));
  }

  function handleClear() {
    setPlan(null);
    setSituation("");
    setSessionStarted(false);
    setIsRunning(false);
    setCurrentStepIndex(0);
    setSecondsLeft(0);
    setShowCompletedBanner(false);
    setShowFavoritedBanner(false);
    setEditingStepIndex(null);
    setDraftStep(null);
    localStorage.removeItem("neuromix_plan");
  }

  function handleClearRecentSessions() {
    setRecentSessions([]);
    localStorage.removeItem("neuromix_recent_sessions");
  }

  function handleClearFavoriteSessions() {
    setFavoriteSessions([]);
    localStorage.removeItem("neuromix_favorite_sessions");
  }

  function handleClearCompletedSessions() {
    setCompletedSessions([]);
    localStorage.removeItem("neuromix_completed_sessions");
  }

  function handleEditStep(index) {
    if (!plan) return;
    setEditingStepIndex(index);
    setDraftStep({ ...plan[index] });
  }

  function handleDraftStepChange(field, value) {
    setDraftStep((prev) => ({
      ...prev,
      [field]: field === "minutes" ? value : value,
    }));
  }

  function handleSaveStepEdit() {
    if (editingStepIndex === null || !draftStep || !plan) return;

    const normalizedMinutes = clamp(Number(draftStep.minutes) || 1, 1, 120);

    const updatedPlan = [...plan];
    updatedPlan[editingStepIndex] = {
      ...draftStep,
      minutes: normalizedMinutes,
    };

    setPlan(updatedPlan);

    if (sessionStarted && editingStepIndex === currentStepIndex) {
      setSecondsLeft(normalizedMinutes * 60);
    }

    setEditingStepIndex(null);
    setDraftStep(null);
  }

  function handleCancelStepEdit() {
    setEditingStepIndex(null);
    setDraftStep(null);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="logo">
            NeuroSci<span className="logo-accent">Tunes</span>
          </div>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <div className="eyebrow">Where Music Meets the Mind</div>
          <h1>Build focus sessions designed for your brain state</h1>
          <p className="subtitle">
            NeuroMix helps you turn overwhelm into action by generating a guided
            session based on your mood, energy, mode, task, available time, and what’s actually going on.
          </p>

          <div className="hero-actions">
            <button
              className="hero-btn hero-btn-light"
              onClick={() => {
                document
                  .getElementById("session-builder")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Build a Session
            </button>
          </div>
        </section>

        <section className="card stats-card">
          <div className="section-row">
            <h2>Your Progress</h2>
            {completedSessions.length > 0 && (
              <button className="secondary" onClick={handleClearCompletedSessions}>
                Clear Completed
              </button>
            )}
          </div>

          <div className="quick-stats">
            <div className="stat-box">
              <div className="stat-label">Completed Sessions</div>
              <div className="stat-value">{totalCompletedSessions}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Total Focus Minutes</div>
              <div className="stat-value">{totalFocusMinutes}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Favorite Mode</div>
              <div className="stat-value">{favoriteMode}</div>
            </div>
          </div>
        </section>

        <div className="grid">
          <section className="card" id="session-builder">
            <h2>Session Builder</h2>
            <p className="section-copy">
              Choose your mode, then tell NeuroMix how you feel, what you need
              to do, and how much time you have.
            </p>

            <div className="mode-grid">
              {Object.entries(modeOptions).map(([key, option]) => (
                <button
                  key={key}
                  type="button"
                  className={`mode-card ${mode === key ? "mode-card-active" : ""}`}
                  onClick={() => setMode(key)}
                >
                  <div className="mode-title">{option.label}</div>
                  <div className="mode-description">{option.description}</div>
                </button>
              ))}
            </div>

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
                <span>Minutes</span>
                <input
                  type="number"
                  min={10}
                  max={240}
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                />
              </label>
            </div>

            <label style={{ marginTop: 14 }}>
              <span>Describe your situation</span>
              <textarea
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="Example: I’m overwhelmed and need to study biochem for 45 minutes without spiraling."
                rows={4}
                className="situation-box"
              />
            </label>

            <div className="button-row">
              <button className="primary" onClick={handleGeneratePlan}>
                Generate Plan
              </button>
              <button className="secondary" onClick={handleClear}>
                Clear
              </button>
            </div>
          </section>

          <section className="card">
            <h2>Quick Overview</h2>
            <p className="section-copy">
              NeuroMix now uses modes to shape the structure of your session, not
              just the text prompts.
            </p>

            <div className="quick-stats">
              <div className="stat-box">
                <div className="stat-label">Mode</div>
                <div className="stat-value">{modeOptions[mode].label}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Task</div>
                <div className="stat-value">{task}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Time</div>
                <div className="stat-value">{minutes} min</div>
              </div>
            </div>

            <p className="mini-text" style={{ marginTop: 16 }}>
              {modeOptions[mode].description}
            </p>

            <p className="mini-text" style={{ marginTop: 12 }}>
              {situation
                ? `Situation: ${situation}`
                : "Add a situation to make your session plan feel more personal and context-aware."}
            </p>
          </section>
        </div>

        <section className="card" style={{ marginTop: 18 }}>
          <div className="section-row">
            <h2>Favorite Sessions</h2>
            {favoriteSessions.length > 0 && (
              <button className="secondary" onClick={handleClearFavoriteSessions}>
                Clear Favorites
              </button>
            )}
          </div>

          {favoriteSessions.length === 0 ? (
            <p className="empty-text">
              No favorites yet. Generate a session and save one you want to reuse.
            </p>
          ) : (
            <div className="recent-grid">
              {favoriteSessions.map((session) => (
                <FavoriteSessionCard
                  key={session.id}
                  session={session}
                  onLoad={handleLoadSession}
                  onRemove={handleRemoveFavorite}
                />
              ))}
            </div>
          )}
        </section>

        <section className="card" style={{ marginTop: 18 }}>
          <div className="section-row">
            <h2>Recent Sessions</h2>
            {recentSessions.length > 0 && (
              <button className="secondary" onClick={handleClearRecentSessions}>
                Clear History
              </button>
            )}
          </div>

          {recentSessions.length === 0 ? (
            <p className="empty-text">
              No saved sessions yet. Generate a plan and it will appear here.
            </p>
          ) : (
            <div className="recent-grid">
              {recentSessions.map((session) => (
                <RecentSessionCard
                  key={session.id}
                  session={session}
                  onLoad={handleLoadSession}
                />
              ))}
            </div>
          )}
        </section>

        <section className="card" style={{ marginTop: 18 }}>
          <div className="section-row">
            <h2>Generated Session Plan</h2>
            {plan && (
              <button className="primary" onClick={handleFavoriteCurrentSession}>
                Save to Favorites
              </button>
            )}
          </div>

          {showFavoritedBanner && (
            <div className="favorited-banner">
              Session saved to favorites.
            </div>
          )}

          {!plan ? (
            <p className="empty-text">
              Generate a plan to see your warm-up, focus blocks, breaks, and cool-down.
            </p>
          ) : (
            <>
              <p className="summary-text">
                Total planned: <strong>{totalPlanned} minutes</strong>
              </p>

              <p className="mini-text">
                Current mode: <strong>{modeOptions[mode].label}</strong>
              </p>

              {situation && (
                <p className="mini-text">
                  Based on your situation: <strong>{situation}</strong>
                </p>
              )}

              <div className="step-list">
                {plan.map((step, index) => (
                  <StepCard
                    key={index}
                    step={editingStepIndex === index ? draftStep : step}
                    isActive={sessionStarted && index === currentStepIndex}
                    isEditing={editingStepIndex === index}
                    onEditToggle={() => handleEditStep(index)}
                    onFieldChange={handleDraftStepChange}
                    onSaveEdit={handleSaveStepEdit}
                    onCancelEdit={handleCancelStepEdit}
                  />
                ))}
              </div>
            </>
          )}
        </section>

        {plan && (
          <section className="card" style={{ marginTop: 18 }}>
            <h2>Session Runner</h2>

            {showCompletedBanner && (
              <div className="completed-banner">Session complete. Nice work.</div>
            )}

            {!sessionStarted ? (
              <div className="runner-box">
                <p className="runner-prompt">
                  Your {modeOptions[mode].label.toLowerCase()} session is ready.
                  Start when you’re ready to lock in.
                </p>
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

                <div className="progress-wrap">
                  <div
                    className="progress-bar"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <p className="mini-text">Progress: {progressPercent}%</p>

                {currentStep && (
                  <>
                    <p className="runner-prompt">{currentStep.prompt}</p>

                    <div className="sound-card">
                      <div className="sound-label">Now Playing</div>
                      <div className="sound-title">{currentStep.soundTitle}</div>
                      <div className="sound-description">
                        {currentStep.soundDescription}
                      </div>

                      <audio
                        className="audio-player"
                        controls
                        loop
                        autoPlay
                        key={currentStepIndex}
                      >
                        <source src={currentStep.audioFile} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  </>
                )}

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
          </section>
        )}

        <section className="footer">
          <h3 className="footer-title">About NeuroSciTunes</h3>
          <p className="footer-copy">
            NeuroSciTunes explores the relationship between neuroscience, music,
            focus, memory, and emotion. NeuroMix is the interactive side of that
            vision: helping people use structure, sound, and intention to do
            better work.
          </p>
        </section>
      </main>
    </div>
  );
}