import { useMemo, useState } from "react";

/**
 * NeuroMix v1 — no backend, no AI.
 * We generate a session plan with rules based on:
 * - task type
 * - mood
 * - energy
 * - total minutes
 */

// Small helper: clamp a number between min & max
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

// Convert minutes to a readable label
function minLabel(m) {
  return `${m} min`;
}

// This is the "brain" of the app.
// It takes user inputs and returns a plan: an array of steps.
function generatePlan({ task, mood, energy, minutes }) {
  const total = clamp(Number(minutes) || 0, 10, 240);

  // 1) Pick warm-up length (more anxiety = longer warm-up)
  const warmup = mood === "anxious" ? 5 : mood === "tired" ? 4 : 3;

  // 2) Pick cool-down length (calm down & reflect)
  const cooldown = mood === "anxious" ? 4 : 3;

  // 3) Determine focus block size based on energy + task
  // Higher energy -> longer blocks
  // Creative tasks can handle slightly longer flowing blocks
  let focusBlock = 25;
  if (energy === "low") focusBlock = 15;
  if (energy === "medium") focusBlock = 25;
  if (energy === "high") focusBlock = task === "creative" ? 35 : 30;

  // 4) Break lengths: anxious gets more structured breathing breaks
  const shortBreak = mood === "anxious" ? 5 : 4;
  const longBreak = mood === "anxious" ? 8 : 6;

  // Total minutes left after warmup + cooldown
  let remaining = total - warmup - cooldown;

  // If time is very short, simplify
  if (remaining < 10) {
    return [
      {
        type: "warmup",
        title: "Warm-up",
        minutes: warmup,
        prompt:
          mood === "anxious"
            ? "Box breathing (4–4–4–4) while music ramps up."
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

  // Build plan steps
  const steps = [];

  steps.push({
    type: "warmup",
    title: "Warm-up",
    minutes: warmup,
    prompt:
      mood === "anxious"
        ? "Box breathing (4–4–4–4) + a steady, safe track."
        : "Ramp-in track. Pick ONE goal for this session.",
  });

  // Create repeating focus/break cycles
  // We'll try to fit as many focus blocks as we can.
  let focusCount = 0;

  while (remaining > 0) {
    // Focus block
    const thisFocus = Math.min(focusBlock, remaining);
    if (thisFocus < 8) break;

    focusCount += 1;
    steps.push({
      type: "focus",
      title: `Focus Block ${focusCount}`,
      minutes: thisFocus,
      prompt:
        task === "studying"
          ? "Active recall: quiz yourself, don’t just reread."
          : task === "writing"
          ? "Draft ugly. Don’t edit yet."
          : task === "creative"
          ? "Flow mode: generate ideas fast, no judgement."
          : "One thing at a time. Finish the smallest next step.",
    });

    remaining -= thisFocus;
    if (remaining <= 0) break;

    // Decide break length: every 3rd focus block gets a longer break
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
      task === "studying"
        ? "Write 3 bullets: what you learned + what’s next."
        : "Quick reflection: what did you complete and what’s next?",
  });

  // If we have leftover minutes (because of rounding), add it to cooldown
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

function StepCard({ step }) {
  const badge = step.type.toUpperCase();
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 14,
        background: "white",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontWeight: 700 }}>{step.title}</div>
        <div
          style={{
            fontSize: 12,
            padding: "4px 8px",
            borderRadius: 999,
            background: "#f3f4f6",
            border: "1px solid #e5e7eb",
          }}
        >
          {badge} • {minLabel(step.minutes)}
        </div>
      </div>
      <div style={{ marginTop: 8, color: "#374151", lineHeight: 1.4 }}>
        {step.prompt}
      </div>
    </div>
  );
}

export default function App() {
  const [task, setTask] = useState("studying");
  const [mood, setMood] = useState("anxious");
  const [energy, setEnergy] = useState("low");
  const [minutes, setMinutes] = useState(45);

  const [plan, setPlan] = useState(null);

  const inputs = useMemo(
    () => ({ task, mood, energy, minutes }),
    [task, mood, energy, minutes]
  );

  const totalPlanned = plan
    ? plan.reduce((sum, s) => sum + s.minutes, 0)
    : 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f9fafb",
        padding: 18,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
      }}
    >
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <header style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, color: "#6b7280" }}>NeuroSciTunes</div>
          <h1 style={{ margin: "6px 0 0", fontSize: 28 }}>NeuroMix</h1>
          <p style={{ marginTop: 8, color: "#374151", lineHeight: 1.5 }}>
            Tell me your task, mood, energy, and time. I’ll generate a guided
            session plan: warm-up → focus → breaks → cool-down.
          </p>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 16,
          }}
        >
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              padding: 16,
              background: "white",
            }}
          >
            <h2 style={{ margin: 0, fontSize: 16 }}>Inputs</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
                marginTop: 12,
              }}
            >
              <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
                Task
                <select
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  style={{ padding: 10, borderRadius: 10 }}
                >
                  <option value="studying">Studying</option>
                  <option value="writing">Writing</option>
                  <option value="creative">Creative</option>
                  <option value="admin">Admin / chores</option>
                </select>
              </label>

              <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
                Mood
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  style={{ padding: 10, borderRadius: 10 }}
                >
                  <option value="anxious">Anxious</option>
                  <option value="neutral">Neutral</option>
                  <option value="tired">Tired</option>
                  <option value="motivated">Motivated</option>
                </select>
              </label>

              <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
                Energy
                <select
                  value={energy}
                  onChange={(e) => setEnergy(e.target.value)}
                  style={{ padding: 10, borderRadius: 10 }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>

              <label style={{ display: "grid", gap: 6, fontSize: 14 }}>
                Minutes (10–240)
                <input
                  type="number"
                  min={10}
                  max={240}
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
                />
              </label>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              <button
                onClick={() => setPlan(generatePlan(inputs))}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid #111827",
                  background: "#111827",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Generate Plan
              </button>

              <button
                onClick={() => setPlan(null)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  background: "white",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Clear
              </button>

              <div style={{ color: "#6b7280", fontSize: 13, alignSelf: "center" }}>
                Current inputs: {task}, {mood}, {energy}, {minutes} minutes
              </div>
            </div>
          </div>

          <div>
            <h2 style={{ margin: "6px 0 10px", fontSize: 16 }}>Session Plan</h2>

            {!plan ? (
              <div
                style={{
                  border: "1px dashed #d1d5db",
                  borderRadius: 14,
                  padding: 16,
                  color: "#6b7280",
                  background: "white",
                }}
              >
                Generate a plan to see your warm-up, focus blocks, breaks, and
                cool-down here.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ color: "#374151", fontSize: 14 }}>
                  Total planned: <b>{totalPlanned} minutes</b>
                </div>

                {plan.map((step, idx) => (
                  <StepCard key={idx} step={step} />
                ))}
              </div>
            )}
          </div>
        </div>

        <footer style={{ marginTop: 24, color: "#6b7280", fontSize: 12 }}>
          v1 uses simple rules (not AI). Next step: add a “Start Session” timer
          and optional Spotify / audio integration.
        </footer>
      </div>
    </div>
  );
}