import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

import { DndContext, closestCenter } from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import warmupAmbient from "./assets/warmup/warmup_ambient.mp3";
import warmupSoft from "./assets/warmup/warmup_soft_1.mp3";
import warmupSoft2 from "./assets/warmup/warmup_soft_2.mp3";
import warmupMorningLight from "./assets/warmup/warmup_morning_light.mp3";
import warmupGentleRise from "./assets/warmup/warmup_gentle_rise.mp3";
import warmupSlowOpen from "./assets/warmup/warmup_slow_open.mp3";

import focusFlow from "./assets/focus/focus_flow.mp3";
import creativeFlow1 from "./assets/creative/creative_flow_1.mp3";
import creativeFlow2 from "./assets/creative/creative_flow_2.mp3";
import creativeSpark from "./assets/creative/creative_spark.mp3";
import creativeDrift from "./assets/creative/creative_drift.mp3";
import creativeOpenSpace from "./assets/creative/creative_open_space.mp3";

import deepFocus from "./assets/focus/deep_focus.mp3";
import deepFocus2 from "./assets/focus/deep_focus_2.mp3";
import focusDrone1 from "./assets/focus/focus_drone_1.mp3";
import focusDrone2 from "./assets/focus/focus_drone_2.mp3";
import focusDrone3 from "./assets/focus/focus_drone_3.mp3";
import focusDeepPulse from "./assets/focus/focus_deep_pulse.mp3";
import focusDarkRoom from "./assets/focus/focus_dark_room.mp3";
import focusLowHum from "./assets/focus/focus_low_hum.mp3";

import breakReset from "./assets/break/break_reset.mp3";
import breakBreathing1 from "./assets/break/break_breathing_1.mp3";
import breakBreathing2 from "./assets/break/break_breathing_2.mp3";
import breakSoftPause from "./assets/break/break_soft_pause.mp3";
import breakExhale from "./assets/break/break_exhale.mp3";
import breakFloat from "./assets/break/break_float.mp3";

import calmReset from "./assets/recovery/calm_reset.mp3";
import calmReset2 from "./assets/recovery/calm_reset_2.mp3";
import recoveryGentle from "./assets/recovery/recovery_gentle.mp3";
import recoveryDeepRest from "./assets/recovery/recovery_deep_rest.mp3";
import recoverySoftReturn from "./assets/recovery/recovery_soft_return.mp3";

import cooldownPiano from "./assets/cooldown/cooldown_piano.mp3";
import cooldownReflection from "./assets/cooldown/cooldown_reflection.mp3";
import cooldownSlowClose from "./assets/cooldown/cooldown_slow_close.mp3";
import cooldownSoftEnd from "./assets/cooldown/cooldown_soft_end.mp3";
import cooldownGratitude from "./assets/cooldown/cooldown_gratitude.mp3";
import cooldownStill from "./assets/cooldown/cooldown_still.mp3";

const audioFileMap = {
  warmup: warmupAmbient,
  focus: deepFocus,
  break: breakReset,
  cooldown: cooldownPiano,
  recovery: calmReset,
};

function hydrateAiPlan(plan = []) {
  return plan.map((step, index) => ({
    id: step.id || `ai-step-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    type: step.type || "focus",
    title: step.title || `Step ${index + 1}`,
    minutes: Number(step.minutes || 5),
    prompt: step.prompt || "Stay focused on the current step.",
    soundTitle: step.soundTitle || "Focus Sound",
    soundDescription:
      step.soundDescription || "Carefully selected audio for this step.",
    audioFile: step.audioFile || audioFileMap[step.type] || deepFocus,
  }));
}

const soundLibrary = {
  warmup: [
    { title: "Focus Warm-Up Track", description: "Light instrumental audio to transition into work.", file: warmupAmbient },
    { title: "Soft Reset Soundscape", description: "Gentle ambient pads to calm the nervous system.", file: warmupSoft },
    { title: "Calm Entry Atmosphere", description: "Low stimulation ambient sound for easing into focus.", file: warmupSoft2 },
    { title: "Morning Light", description: "Soft, hopeful pads to open your mind for the session ahead.", file: warmupMorningLight },
    { title: "Gentle Rise", description: "A slow upward drift of sound to gradually build presence.", file: warmupGentleRise },
    { title: "Slow Open", description: "Minimal ambient texture to ease into the session without pressure.", file: warmupSlowOpen },
  ],
  focusDeep: [
    { title: "Deep Work Drone", description: "Minimal audio with almost no variation for deep work.", file: deepFocus },
    { title: "Focus Drone II", description: "Steady ambient texture designed for cognitive endurance.", file: deepFocus2 },
    { title: "Cognitive Tunnel", description: "Subtle tonal bed for sustained analytical thinking.", file: focusDrone1 },
    { title: "Precision Pulse", description: "Low-distraction rhythmic ambience for problem solving.", file: focusDrone2 },
    { title: "Focus Drone III", description: "A third drone variation for extended deep work sessions.", file: focusDrone3 },
    { title: "Deep Pulse", description: "Slow rhythmic undercurrent to anchor long concentration blocks.", file: focusDeepPulse },
    { title: "Dark Room", description: "Dark, minimal atmosphere designed for total cognitive immersion.", file: focusDarkRoom },
    { title: "Low Hum", description: "A steady low-frequency tone that keeps attention anchored.", file: focusLowHum },
  ],
  focusCreative: [
    { title: "Flow-State Instrumental", description: "Melodic but unobtrusive music for creative thinking.", file: focusFlow },
    { title: "Creative Flow", description: "Soft synth textures to encourage ideation.", file: creativeFlow2 },
    { title: "Creative Spark", description: "Bright, open ambient sound to ignite creative momentum.", file: creativeSpark },
    { title: "Creative Drift", description: "Floating melodic pads for free-form idea generation.", file: creativeDrift },
    { title: "Open Space", description: "Expansive ambient texture that gives ideas room to breathe.", file: creativeOpenSpace },
  ],
  break: [
    { title: "Breathing Reset", description: "A short decompression cue for stepping away.", file: breakReset },
    { title: "Exhale Space", description: "Open ambient textures for mental reset.", file: breakBreathing1 },
    { title: "Quiet Reset", description: "Minimal atmospheric break soundscape.", file: breakBreathing2 },
    { title: "Soft Pause", description: "A gentle mid-session pause to release tension.", file: breakSoftPause },
    { title: "Exhale", description: "Breathing-friendly tones designed around a long exhale rhythm.", file: breakExhale },
    { title: "Float", description: "Light, spacious sound to help the mind drift and recover.", file: breakFloat },
  ],
  recovery: [
    { title: "Soft Recovery", description: "Slow ambient textures for nervous system reset.", file: calmReset },
    { title: "Deep Calm", description: "Gentle tonal layers designed to reduce tension.", file: calmReset2 },
    { title: "Recovery Gentle", description: "Soft, supportive sound for sessions after difficult days.", file: recoveryGentle },
    { title: "Deep Rest", description: "Very slow ambient texture for full nervous system recovery.", file: recoveryDeepRest },
    { title: "Soft Return", description: "A gradual, warm re-entry sound after extended rest.", file: recoverySoftReturn },
  ],
  cooldown: [
    { title: "Reflection Piano", description: "Gentle piano to close the session.", file: cooldownPiano },
    { title: "Session Reflection", description: "Warm ambient close for reviewing what you accomplished.", file: cooldownReflection },
    { title: "Slow Close", description: "A gradual fade-out sound to signal the end of deep work.", file: cooldownSlowClose },
    { title: "Soft End", description: "Minimal and peaceful closing texture.", file: cooldownSoftEnd },
    { title: "Gratitude", description: "Warm, affirming sound to close with a sense of completion.", file: cooldownGratitude },
    { title: "Still", description: "Pure stillness — minimal sound to let the session settle.", file: cooldownStill },
  ],
};

function pickRandomExcluding(arr, excludeFile = null) {
  if (!arr || arr.length === 0) return null;
  const filtered = excludeFile
    ? arr.filter((item) => item.file !== excludeFile)
    : arr;
  const pool = filtered.length > 0 ? filtered : arr;
  return pool[Math.floor(Math.random() * pool.length)];
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
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

function toDateKey(dateInput) {
  const date = new Date(dateInput);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatShortDayLabel(dateInput) {
  const date = new Date(dateInput);
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

function getLast7DaysData(completedSessions) {
  const countsByDay = completedSessions.reduce((acc, session) => {
    const key = toDateKey(session.completedAt);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const days = [];
  const today = new Date();

  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = toDateKey(d);

    days.push({
      key,
      label: formatShortDayLabel(d),
      count: countsByDay[key] || 0,
      isToday: i === 0,
    });
  }

  return days;
}

function getCurrentStreak(completedSessions) {
  if (!completedSessions.length) return 0;

  const uniqueDays = [
    ...new Set(completedSessions.map((s) => toDateKey(s.completedAt))),
  ].sort();
  const daySet = new Set(uniqueDays);

  let streak = 0;
  const cursor = new Date();

  while (true) {
    const key = toDateKey(cursor);
    if (daySet.has(key)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function getBestStreak(completedSessions) {
  if (!completedSessions.length) return 0;

  const uniqueDays = [
    ...new Set(completedSessions.map((s) => toDateKey(s.completedAt))),
  ].sort();

  if (!uniqueDays.length) return 0;

  let best = 1;
  let current = 1;

  for (let i = 1; i < uniqueDays.length; i += 1) {
    const prev = new Date(uniqueDays[i - 1]);
    const curr = new Date(uniqueDays[i]);
    const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }

  return best;
}

function getSessionsToday(completedSessions) {
  const todayKey = toDateKey(new Date());
  return completedSessions.filter(
    (s) => toDateKey(s.completedAt) === todayKey
  ).length;
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
      .reduce((stepSum, step) => stepSum + Number(step.minutes || 0), 0);

    return sum + focusMinutes;
  }, 0);
}

function getAverageCompletedMinutes(completedSessions) {
  if (!completedSessions.length) return 0;

  const total = completedSessions.reduce(
    (sum, session) => sum + Number(session.minutes || 0),
    0
  );

  return Math.round(total / completedSessions.length);
}

function getRecommendedMinutes(
  completedSessions,
  currentTask,
  currentMood,
  currentEnergy
) {
  if (!completedSessions.length) return 45;

  const matchingSessions = completedSessions.filter(
    (session) =>
      session.task === currentTask &&
      session.mood === currentMood &&
      session.energy === currentEnergy
  );

  const source =
    matchingSessions.length >= 2 ? matchingSessions : completedSessions;

  const avg =
    source.reduce((sum, session) => sum + Number(session.minutes || 0), 0) /
    source.length;

  if (avg <= 25) return 25;
  if (avg <= 40) return 30;
  if (avg <= 55) return 45;
  if (avg <= 75) return 60;
  if (avg <= 105) return 90;
  return 120;
}

function getRecommendedMode(completedSessions, currentTask) {
  if (!completedSessions.length) return null;

  const taskMatches = completedSessions.filter(
    (session) => session.task === currentTask
  );
  const source = taskMatches.length ? taskMatches : completedSessions;

  const counts = source.reduce((acc, session) => {
    acc[session.mode] = (acc[session.mode] || 0) + 1;
    return acc;
  }, {});

  let bestMode = null;
  let bestCount = 0;

  for (const mode in counts) {
    if (counts[mode] > bestCount) {
      bestCount = counts[mode];
      bestMode = mode;
    }
  }

  return bestMode;
}

function getRecommendationReason(
  completedSessions,
  currentTask,
  currentMood,
  currentEnergy
) {
  if (!completedSessions.length) {
    return "Start with a balanced session length and adjust as you build history.";
  }

  const matchingSessions = completedSessions.filter(
    (session) =>
      session.task === currentTask &&
      session.mood === currentMood &&
      session.energy === currentEnergy
  );

  if (matchingSessions.length >= 2) {
    return `Based on your completed ${currentTask} sessions when feeling ${currentMood} with ${currentEnergy} energy.`;
  }

  return "Based on your overall completed session history so far.";
}

async function generateAIPlan(inputs) {
  try {
    const feedbackSummary = (inputs.recentFeedback || [])
      .slice(0, 3)
      .map((f, i) => {
        const parts = [`Session ${i + 1}:`];
        if (f.length) parts.push(`length was ${f.length}`);
        if (f.focus) parts.push(`focus quality was ${f.focus}`);
        if (f.music) parts.push(`music fit was ${f.music}`);
        if (f.note) parts.push(`note: "${f.note}"`);
        return parts.join(", ");
      })
      .join("\n");

    const response = await fetch("/api/generate-plan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-secret": "neuromixsecret2026",
      },
      body: JSON.stringify({ ...inputs, feedbackSummary }),
    });
    if (!response.ok) {
      throw new Error("AI backend request failed");
    }
    const data = await response.json();
    const hydratedPlan = hydrateAiPlan(data.plan || []);
    if (!hydratedPlan.length) {
      return {
        plan: generatePlan(inputs),
        source: "smart-fallback",
        message: "AI returned an empty plan, so NeuroMix used Smart Plan instead.",
      };
    }
    return {
      plan: hydratedPlan,
      source: data.source || "openai",
      message: "",
    };
  } catch (err) {
    console.error("AI error:", err);
    return {
      plan: generatePlan(inputs),
      source: "smart-fallback",
      message: "AI mode failed, so NeuroMix used Smart Plan instead.",
    };
  }
}

function getRandomSoundForStep(
  stepType,
  mode,
  mood,
  task,
  text = "",
  excludeFile = null
) {
  let pool = soundLibrary.cooldown;
  if (stepType === "warmup") {
    pool = soundLibrary.warmup;
  } else if (stepType === "focus") {
    if (task === "creative") {
      pool = soundLibrary.focusCreative;
    } else if (
      task === "mcat" ||
      mode === "deepwork" ||
      text.includes("exam") ||
      text.includes("test")
    ) {
      pool = soundLibrary.focusDeep;
    } else {
      pool = [...soundLibrary.focusCreative, ...soundLibrary.focusDeep];
    }
  } else if (stepType === "break") {
    pool = soundLibrary.break;
  } else if (stepType === "cooldown") {
    pool = soundLibrary.cooldown;
  }
  return pickRandomExcluding(pool, excludeFile);
}

function getSoundForStep({ stepType, mode, mood, task, text, excludeFile = null }) {
  const selected = getRandomSoundForStep(
    stepType,
    mode,
    mood,
    task,
    text,
    excludeFile
  );
  return {
    soundTitle: selected.title,
    soundDescription: selected.description,
    audioFile: selected.file,
  };
}

function createStepTemplate(stepType, mode, mood, task, text = "") {
  const baseSound = getSoundForStep({ stepType, mode, mood, task, text });

  const defaults = {
    warmup: {
      title: "Warm-up",
      minutes: 5,
      prompt: "Settle in, breathe, and define your goal for this session.",
    },
    focus: {
      title: "Focus Block",
      minutes: 25,
      prompt: "Work on one clear target without switching tasks.",
    },
    break: {
      title: "Break",
      minutes: 5,
      prompt: "Step away, breathe, stretch, and avoid scrolling.",
    },
    cooldown: {
      title: "Cool-down",
      minutes: 5,
      prompt: "Reflect on progress and decide your next step.",
    },
  };

  return {
    id: `${stepType}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: stepType,
    ...defaults[stepType],
    ...baseSound,
  };
}

function generatePlan({
  task,
  mood,
  energy,
  minutes,
  situation,
  mode,
  planStyle,
  adaptiveTiming,
}) {
  const total = clamp(Number(minutes) || 0, 10, 240);
  const text = (situation || "").toLowerCase();

  let warmup =
    mood === "anxious" || text.includes("overwhelmed")
      ? 5
      : mood === "tired"
      ? 4
      : 3;

  let cooldown = mood === "anxious" ? 4 : 3;

  let focusBlock = 25;
  if (energy === "low") focusBlock = 15;
  if (energy === "medium") focusBlock = 25;
  if (energy === "high") {
    focusBlock = task === "creative" ? 35 : task === "mcat" ? 35 : 30;
  }

  let shortBreak = mood === "anxious" ? 5 : 4;
  let longBreak = mood === "anxious" ? 8 : 6;

  if (adaptiveTiming) {
    focusBlock = adaptiveTiming.focusBlock;
    shortBreak = adaptiveTiming.shortBreak;
    longBreak = adaptiveTiming.longBreak;
  }

  if (planStyle === "cars") {
    focusBlock = 30;
    shortBreak = 5;
    longBreak = 7;
  }

  if (planStyle === "mcatProblemSolving") {
    focusBlock = Math.max(focusBlock, 35);
    shortBreak = 4;
    longBreak = 6;
  }

  if (planStyle === "activeRecall") {
    focusBlock = Math.min(Math.max(focusBlock, 25), 35);
    shortBreak = 5;
    longBreak = 8;
  }

  if (planStyle === "memorization") {
    focusBlock = Math.min(focusBlock, 20);
    shortBreak = Math.max(shortBreak, 5);
    longBreak = Math.max(longBreak, 8);
  }

  if (planStyle === "reviewMistakes") {
    focusBlock = Math.min(focusBlock, 20);
    shortBreak = Math.max(shortBreak, 5);
    longBreak = Math.max(longBreak, 8);
    cooldown += 3;
  }

  if (planStyle === "writing") {
    focusBlock = Math.max(focusBlock, 30);
    shortBreak = 4;
    longBreak = 6;
  }

  if (planStyle === "overwhelmedReset") {
    warmup += 2;
    focusBlock = Math.min(focusBlock, 12);
    shortBreak = Math.max(shortBreak, 6);
    longBreak = Math.max(longBreak, 8);
    cooldown += 2;
  }

  if (text.includes("overwhelmed")) {
    focusBlock = Math.min(focusBlock, 20);
  }

  if (text.includes("exam") || text.includes("mcat") || text.includes("test")) {
    focusBlock = Math.max(focusBlock, 25);
  }

  if (mode === "lockin") {
    focusBlock += 5;
    shortBreak = Math.max(3, shortBreak - 1);
    longBreak = Math.max(5, longBreak - 1);
  }

  if (mode === "gentle") {
    warmup += 2;
    focusBlock = Math.min(focusBlock, 20);
    shortBreak += 1;
  }

  if (mode === "deepwork") {
    focusBlock += 10;
    shortBreak = Math.max(3, shortBreak - 1);
    longBreak = Math.max(5, longBreak - 1);
  }

  if (mode === "recovery") {
    warmup += 2;
    cooldown += 2;
    focusBlock = Math.min(focusBlock, 15);
    shortBreak += 2;
    longBreak += 2;
  }

  focusBlock = clamp(focusBlock, 10, 50);
  shortBreak = clamp(shortBreak, 3, 10);
  longBreak = clamp(longBreak, 5, 15);

  let remaining = total - warmup - cooldown;
  const steps = [];

  let warmupPrompt =
    "Use a ramp-in track and define the single goal of this session.";

  if (text.includes("overwhelmed")) {
    warmupPrompt =
      "Take a slow ramp-in. Breathe, lower the pressure, and choose one tiny first step.";
  } else if (mood === "anxious") {
    warmupPrompt = "Use box breathing and a steady track to settle your mind.";
  }

  if (mode === "gentle") {
    warmupPrompt +=
      " Keep this session easy to enter. The goal is simply to begin.";
  }

  if (mode === "lockin") {
    warmupPrompt += " Strip away distractions and commit to one target.";
  }

  if (mode === "recovery") {
    warmupPrompt += " Give yourself permission to move slowly and reset.";
  }

  steps.push({
    id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: "warmup",
    title: "Warm-up",
    minutes: warmup,
    prompt: warmupPrompt,
    ...getSoundForStep({ stepType: "warmup", mode, mood, task, text }),
  });

  if (remaining < 10) {
    steps.push({
      id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: "focus",
      title: "Focus Sprint",
      minutes: Math.max(1, remaining),
      prompt: "Choose one small clear goal. No multitasking.",
      ...getSoundForStep({ stepType: "focus", mode, mood, task, text }),
    });

    steps.push({
      id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: "cooldown",
      title: "Cool-down",
      minutes: cooldown,
      prompt: "Reflect on what moved forward and what comes next.",
      ...getSoundForStep({ stepType: "cooldown", mode, mood, task, text }),
    });

    return steps;
  }

  let focusCount = 0;

  while (remaining > 0) {
    const thisFocus = Math.min(focusBlock, remaining);
    if (thisFocus < 8) break;

    focusCount += 1;

    let focusPrompt = "Do one thing at a time and finish the smallest next step.";

    if (task === "studying") {
      focusPrompt = "Use active recall. Quiz yourself instead of rereading.";
    } else if (task === "writing") {
      focusPrompt = "Draft first. Edit later.";
    } else if (task === "creative") {
      focusPrompt = "Stay in flow mode. Generate ideas without judging them.";
    } else if (task === "mcat") {
      focusPrompt = "Do practice questions, then review what you got wrong.";
    }

    if (planStyle === "cars") {
      focusPrompt =
        "Read actively, stay present with the passage, and avoid rushing ahead.";
    } else if (planStyle === "mcatProblemSolving") {
      focusPrompt =
        "Work through each question carefully, then review the logic behind every answer choice.";
    } else if (planStyle === "activeRecall") {
      focusPrompt =
        "Test yourself out loud, retrieve from memory, and only then check your notes.";
    } else if (planStyle === "memorization") {
      focusPrompt =
        "Keep the pace light and consistent. Prioritize recall over rereading.";
    } else if (planStyle === "reviewMistakes") {
      focusPrompt =
        "Review missed questions calmly. Focus on why the right answer is right and why your original choice was wrong.";
    } else if (planStyle === "writing") {
      focusPrompt =
        "Keep drafting. Do not stop to perfect sentences while momentum is building.";
    } else if (planStyle === "overwhelmedReset") {
      focusPrompt =
        "Choose one tiny task and finish only that. The goal is to re-enter, not be perfect.";
    }

    if (text.includes("biochem")) {
      focusPrompt +=
        " Focus on mechanisms, pathways, and testing yourself out loud.";
    }

    if (text.includes("paper") || text.includes("essay")) {
      focusPrompt += " Prioritize forward momentum over perfect wording.";
    }

    if (text.includes("overwhelmed")) {
      focusPrompt += " Keep the bar low: just complete this block.";
    }

    if (mode === "lockin") {
      focusPrompt += " Stay strict. No app switching and no passive drifting.";
    }

    if (mode === "deepwork") {
      focusPrompt +=
        " Protect depth. Avoid interruptions and stay with the problem longer.";
    }

    if (mode === "gentle") {
      focusPrompt += " Do not chase perfection. Just create momentum.";
    }

    if (mode === "recovery") {
      focusPrompt += " Work softly. The goal is progress without burning out.";
    }

    steps.push({
      id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: "focus",
      title: `Focus Block ${focusCount}`,
      minutes: thisFocus,
      prompt: focusPrompt,
      ...getSoundForStep({ stepType: "focus", mode, mood, task, text }),
    });

    remaining -= thisFocus;
    if (remaining <= 0) break;

    const isLong = focusCount % 3 === 0;
    const breakLen = Math.min(isLong ? longBreak : shortBreak, remaining);
    if (breakLen < 2) break;

    let breakPrompt =
      mood === "anxious" || text.includes("overwhelmed")
        ? "Do a breathing reset. Inhale for 4, exhale for 6. No scrolling."
        : "Stand up, drink water, and stretch. No scrolling.";

    if (mode === "lockin") {
      breakPrompt =
        "Reset quickly. Move, breathe, and get back in without opening distracting apps.";
    }

    if (mode === "deepwork") {
      breakPrompt =
        "Keep the break clean and brief. Protect your mental momentum.";
    }

    if (mode === "recovery") {
      breakPrompt =
        "Take a fuller reset. Breathe, unclench, stretch, and let your system settle.";
    }

    steps.push({
      id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: "break",
      title: isLong ? "Long Break" : "Short Break",
      minutes: breakLen,
      prompt: breakPrompt,
      ...getSoundForStep({ stepType: "break", mode, mood, task, text }),
    });

    remaining -= breakLen;
  }

  let cooldownPrompt =
    task === "studying" || task === "mcat"
      ? "Write 3 bullets: what you learned and what to do next."
      : "Reflect on what you finished and what your next step is.";

  if (text.includes("overwhelmed")) {
    cooldownPrompt =
      "Acknowledge what you completed. Shrink the next step so it feels easy to restart later.";
  }

  if (mode === "lockin") {
    cooldownPrompt += " Note exactly where you'll resume next time.";
  }

  if (mode === "gentle") {
    cooldownPrompt += " Give yourself credit for starting.";
  }

  if (mode === "recovery") {
    cooldownPrompt += " End softly and avoid immediately jumping into more stress.";
  }

  if (planStyle === "reviewMistakes") {
    cooldownPrompt =
      "Write down the patterns behind your mistakes and one thing you will watch for next time.";
  }

  if (planStyle === "cars") {
    cooldownPrompt =
      "Note what pulled your attention away and what helped you stay engaged with the passage.";
  }

  if (planStyle === "memorization") {
    cooldownPrompt =
      "List the terms or concepts that still feel weak so your next review session starts cleanly.";
  }

  if (planStyle === "writing") {
    cooldownPrompt =
      "Write the exact next sentence, paragraph, or section you should begin with next time.";
  }

  if (planStyle === "overwhelmedReset") {
    cooldownPrompt =
      "Acknowledge that you started. Make the next entry point feel as small and easy as possible.";
  }

  steps.push({
    id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: "cooldown",
    title: "Cool-down",
    minutes: cooldown,
    prompt: cooldownPrompt,
    ...getSoundForStep({ stepType: "cooldown", mode, mood, task, text }),
  });

  const planned = steps.reduce((sum, s) => sum + Number(s.minutes || 0), 0);
  const diff = total - planned;

  if (diff > 0) {
    steps[steps.length - 1] = {
      ...steps[steps.length - 1],
      minutes: Number(steps[steps.length - 1].minutes || 0) + diff,
    };
  }

  return steps;
}


function migrateSessionCollection(collection = []) {
  return collection.map((session) => ({
    ...session,
    plan: hydrateAiPlan(session.plan || []),
  }));
}

function SortableStepCard({
  id,
  step,
  isActive,
  isEditing,
  onEdit,
  onDelete,
  onFieldChange,
  onSave,
  onCancel,
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`step-card ${isActive ? "active-step" : ""}`}
    >
      <div className="drag-handle" {...attributes} {...listeners}>
        ☰
      </div>

      {!isEditing ? (
        <>
          <div className="step-header">
            <div className="step-title">{step.title}</div>

            <div className="badge">
              {step.type.toUpperCase()} • {step.minutes} min
            </div>
          </div>

          <div className="step-prompt">{step.prompt}</div>

          <div className="step-sound-chip">Sound: {step.soundTitle}</div>

          <div className="button-row compact-row">
            <button className="secondary" onClick={onEdit}>
              Edit
            </button>

            <button className="danger-button" onClick={onDelete}>
              Delete
            </button>
          </div>
        </>
      ) : (
        <div className="edit-panel">
          <label>
            <span>Type</span>

            <select
              value={step.type}
              onChange={(e) => onFieldChange("type", e.target.value)}
            >
              <option value="warmup">Warmup</option>
              <option value="focus">Focus</option>
              <option value="break">Break</option>
              <option value="cooldown">Cooldown</option>
            </select>
          </label>

          <label>
            <span>Title</span>

            <input
              value={step.title}
              onChange={(e) => onFieldChange("title", e.target.value)}
            />
          </label>

          <label>
            <span>Minutes</span>

            <input
              type="number"
              value={step.minutes}
              onChange={(e) => onFieldChange("minutes", e.target.value)}
            />
          </label>

          <label>
            <span>Prompt</span>

            <textarea
              rows={3}
              value={step.prompt}
              onChange={(e) => onFieldChange("prompt", e.target.value)}
            />
          </label>

          <div className="button-row compact-row">
            <button className="primary" onClick={onSave}>
              Save
            </button>

            <button className="secondary" onClick={onCancel}>
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

      {session.templateName && (
        <div className="recent-situation">Template: {session.templateName}</div>
      )}

      {session.generationMode && (
        <div className="recent-situation">
          Generation: {session.generationMode === "ai" ? "AI Plan" : "Smart Plan"}
        </div>
      )}

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

      {session.templateName && (
        <div className="recent-situation">Template: {session.templateName}</div>
      )}

      {session.generationMode && (
        <div className="recent-situation">
          Generation: {session.generationMode === "ai" ? "AI Plan" : "Smart Plan"}
        </div>
      )}

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

function PresetCard({ preset, onLoad, onRemove }) {
  return (
    <div className="preset-card">
      <div className="recent-top">
        <div className="recent-title">{preset.name}</div>
        <div className="recent-date">{formatSavedDate(preset.createdAt)}</div>
      </div>

      <div className="recent-mode">{preset.modeLabel}</div>

      <div className="recent-situation">
        {preset.task} • {preset.mood} • {preset.energy} • {preset.minutes} min
      </div>

      {preset.templateName && (
        <div className="recent-situation">Template: {preset.templateName}</div>
      )}

      <div className="recent-situation">
        Generation: {preset.generationMode === "ai" ? "AI Plan" : "Smart Plan"}
      </div>

      <div className="recent-situation">
        Adaptive Timing: {preset.useAdaptiveTiming === false ? "Off" : "On"}
      </div>

      <div className="recent-situation">
        Notifications: {preset.notificationsEnabled ? "On" : "Off"}
      </div>

      {preset.situation ? (
        <div className="recent-situation">{preset.situation}</div>
      ) : (
        <div className="recent-situation muted">No situation added</div>
      )}

      <div className="button-row compact-row">
        <button className="secondary" onClick={() => onLoad(preset)}>
          Load Preset
        </button>
        <button className="danger-button" onClick={() => onRemove(preset.id)}>
          Remove
        </button>
      </div>
    </div>
  );
}

const studyTemplates = [
  {
    id: "mcat-cp",
    name: "MCAT C/P",
    description: "Focused problem solving for chem/phys practice.",
    task: "mcat",
    mood: "neutral",
    energy: "medium",
    minutes: 90,
    mode: "deepwork",
    planStyle: "mcatProblemSolving",
    situation:
      "I need to work through MCAT chemistry and physics practice questions carefully and review mistakes.",
  },
  {
    id: "mcat-cars",
    name: "MCAT CARS",
    description: "Reading-heavy session with calm sustained attention.",
    task: "mcat",
    mood: "neutral",
    energy: "medium",
    minutes: 60,
    mode: "lockin",
    planStyle: "cars",
    situation:
      "I need to stay focused while reading MCAT CARS passages and avoid zoning out.",
  },
  {
    id: "mcat-bb",
    name: "MCAT B/B",
    description: "Biology and biochem practice with active recall.",
    task: "mcat",
    mood: "anxious",
    energy: "medium",
    minutes: 90,
    mode: "deepwork",
    planStyle: "activeRecall",
    situation:
      "I need to study biology and biochemistry for the MCAT using active recall and practice questions.",
  },
  {
    id: "mcat-ps",
    name: "MCAT P/S",
    description: "Psych and soc memorization plus review.",
    task: "mcat",
    mood: "tired",
    energy: "low",
    minutes: 45,
    mode: "gentle",
    planStyle: "memorization",
    situation:
      "I need to review psychology and sociology terms for the MCAT without getting overwhelmed.",
  },
  {
    id: "review-mistakes",
    name: "Review Mistakes",
    description: "Go through missed questions without spiraling.",
    task: "mcat",
    mood: "anxious",
    energy: "low",
    minutes: 45,
    mode: "gentle",
    planStyle: "reviewMistakes",
    situation:
      "I need to review missed questions, understand why I got them wrong, and stay calm.",
  },
  {
    id: "anki",
    name: "Anki / Flashcards",
    description: "Low-friction memorization block.",
    task: "studying",
    mood: "tired",
    energy: "low",
    minutes: 30,
    mode: "gentle",
    planStyle: "memorization",
    situation:
      "I need to get through flashcards with consistency and not overcomplicate the session.",
  },
  {
    id: "essay-writing",
    name: "Essay Writing",
    description: "Draft-first writing session.",
    task: "writing",
    mood: "neutral",
    energy: "medium",
    minutes: 60,
    mode: "lockin",
    planStyle: "writing",
    situation:
      "I need to write without overthinking and focus on getting words on the page first.",
  },
  {
    id: "overwhelmed-reset",
    name: "Overwhelmed Reset",
    description: "A soft re-entry when starting feels hard.",
    task: "studying",
    mood: "anxious",
    energy: "low",
    minutes: 25,
    mode: "recovery",
    planStyle: "overwhelmedReset",
    situation:
      "I feel overwhelmed and need a very manageable session that helps me just begin.",
  },
];

function getAdaptiveTimingProfile(completedSessions, currentTask, currentMood, currentEnergy, currentMode) {
  const fallback = {
    focusBlock: 25,
    shortBreak: 5,
    longBreak: 8,
    reason: "Using a balanced default timing profile.",
  };
  if (!completedSessions.length) return fallback;
  const matchingSessions = completedSessions.filter(
    (session) =>
      session.task === currentTask &&
      session.mood === currentMood &&
      session.energy === currentEnergy &&
      session.mode === currentMode
  );
  const source =
    matchingSessions.length >= 2
      ? matchingSessions
      : completedSessions.filter((session) => session.task === currentTask).length >= 2
      ? completedSessions.filter((session) => session.task === currentTask)
      : completedSessions;
  const avgMinutes =
    source.reduce((sum, session) => sum + Number(session.minutes || 0), 0) / source.length;
  let focusBlock = 25;
  let shortBreak = 5;
  let longBreak = 8;
  let reason = "Based on your overall session history.";
  if (matchingSessions.length >= 2) {
    reason = `Based on your completed ${currentTask} sessions when feeling ${currentMood} with ${currentEnergy} energy in ${currentMode}.`;
  } else if (completedSessions.filter((session) => session.task === currentTask).length >= 2) {
    reason = `Based on your recent completed ${currentTask} sessions.`;
  }
  if (avgMinutes <= 25) {
    focusBlock = 12;
    shortBreak = 4;
    longBreak = 6;
  } else if (avgMinutes <= 40) {
    focusBlock = 20;
    shortBreak = 5;
    longBreak = 7;
  } else if (avgMinutes <= 60) {
    focusBlock = 25;
    shortBreak = 5;
    longBreak = 8;
  } else if (avgMinutes <= 90) {
    focusBlock = 30;
    shortBreak = 5;
    longBreak = 8;
  } else {
    focusBlock = 35;
    shortBreak = 5;
    longBreak = 10;
  }
  if (currentMood === "anxious") {
    focusBlock = Math.max(10, focusBlock - 5);
    shortBreak = Math.min(8, shortBreak + 1);
    longBreak = Math.min(12, longBreak + 1);
  }
  if (currentMood === "tired") {
    focusBlock = Math.max(10, focusBlock - 5);
    shortBreak = Math.min(8, shortBreak + 1);
  }
  if (currentEnergy === "low") {
    focusBlock = Math.max(10, focusBlock - 5);
    shortBreak = Math.min(8, shortBreak + 1);
  }
  if (currentEnergy === "high") {
    focusBlock = Math.min(40, focusBlock + 5);
  }
  if (currentMode === "lockin") {
    focusBlock = Math.min(45, focusBlock + 5);
    shortBreak = Math.max(3, shortBreak - 1);
    longBreak = Math.max(5, longBreak - 1);
  }
  if (currentMode === "gentle") {
    focusBlock = Math.min(focusBlock, 20);
    shortBreak = Math.min(8, shortBreak + 1);
    longBreak = Math.min(12, longBreak + 1);
  }
  if (currentMode === "deepwork") {
    focusBlock = Math.min(50, focusBlock + 10);
    shortBreak = Math.max(3, shortBreak - 1);
    longBreak = Math.max(5, longBreak - 1);
  }
  if (currentMode === "recovery") {
    focusBlock = Math.min(focusBlock, 15);
    shortBreak = Math.min(10, shortBreak + 2);
    longBreak = Math.min(15, longBreak + 2);
  }
  return {
    focusBlock: clamp(Math.round(focusBlock), 10, 50),
    shortBreak: clamp(Math.round(shortBreak), 3, 10),
    longBreak: clamp(Math.round(longBreak), 5, 15),
    reason,
  };
}

export default function App() {
  const [task, setTask] = useState("studying");
  const [mood, setMood] = useState("anxious");
  const [energy, setEnergy] = useState("low");
  const [minutes, setMinutes] = useState(45);
  const [mode, setMode] = useState("lockin");
  const [situation, setSituation] = useState("");
  const [presetName, setPresetName] = useState("");

  const [plan, setPlan] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [favoriteSessions, setFavoriteSessions] = useState([]);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [presets, setPresets] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [showCompletedBanner, setShowCompletedBanner] = useState(false);
  const [showFavoritedBanner, setShowFavoritedBanner] = useState(false);
  const [showPresetBanner, setShowPresetBanner] = useState(false);

  const [audioVolume, setAudioVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);

  const [editingIndex, setEditingIndex] = useState(null);
  const [draftStep, setDraftStep] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [planGenerationMode, setPlanGenerationMode] = useState("smart");
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [planError, setPlanError] = useState("");
  const [useAdaptiveTiming, setUseAdaptiveTiming] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState("default");
  const [showFeedbackCard, setShowFeedbackCard] = useState(false);
  const [feedbackLength, setFeedbackLength] = useState(null);
  const [feedbackFocus, setFeedbackFocus] = useState(null);
  const [feedbackMusic, setFeedbackMusic] = useState(null);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [feedbackHistory, setFeedbackHistory] = useState([]);

  const audioRef = useRef(null);

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

  const selectedTemplate = useMemo(
    () =>
      studyTemplates.find((template) => template.id === selectedTemplateId) ||
      null,
    [selectedTemplateId]
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

  const currentStepTotalSeconds = currentStep
    ? Number(currentStep.minutes || 0) * 60
    : 0;

  const elapsedInCurrentStep = sessionStarted
    ? Math.max(0, currentStepTotalSeconds - secondsLeft)
    : 0;

  const progressPercent =
    totalSessionSeconds > 0
      ? Math.min(
          100,
          Math.round(
            ((secondsCompletedBeforeCurrent + elapsedInCurrentStep) /
              totalSessionSeconds) *
              100
          )
        )
      : 0;

  const totalCompletedSessions = completedSessions.length;
  const totalFocusMinutes = getTotalFocusMinutes(completedSessions);
  const favoriteMode = getFavoriteMode(completedSessions);
  const currentStreak = getCurrentStreak(completedSessions);
  const bestStreak = getBestStreak(completedSessions);
  const sessionsToday = getSessionsToday(completedSessions);
  const last7Days = getLast7DaysData(completedSessions);

  const averageCompletedMinutes =
    getAverageCompletedMinutes(completedSessions);

  const recommendedMinutes = getRecommendedMinutes(
    completedSessions,
    task,
    mood,
    energy
  );

  const recommendedMode = getRecommendedMode(completedSessions, task);

  const recommendationReason = getRecommendationReason(
    completedSessions,
    task,
    mood,
    energy
  );

  const adaptiveTimingProfile = getAdaptiveTimingProfile(
    completedSessions,
    task,
    mood,
    energy,
    mode
  );

  useEffect(() => {
    const savedInputs = localStorage.getItem("neuromix_inputs");
    const savedPlan = localStorage.getItem("neuromix_plan");
    const savedRecent = localStorage.getItem("neuromix_recent_sessions");
    const savedFavorites = localStorage.getItem("neuromix_favorite_sessions");
    const savedCompleted = localStorage.getItem("neuromix_completed_sessions");
    const savedPresets = localStorage.getItem("neuromix_presets");
    const savedNotificationsEnabled = localStorage.getItem("neuromix_notifications_enabled");
    const savedFeedbackHistory = localStorage.getItem("neuromix_feedback_history");

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
      const parsed = JSON.parse(savedPlan);
      setPlan(hydrateAiPlan(parsed));
    }

    if (savedRecent) {
      setRecentSessions(migrateSessionCollection(JSON.parse(savedRecent)));
    }

    if (savedFavorites) {
      setFavoriteSessions(migrateSessionCollection(JSON.parse(savedFavorites)));
    }

    if (savedCompleted) {
      setCompletedSessions(migrateSessionCollection(JSON.parse(savedCompleted)));
    }

    if (savedPresets) {
      setPresets(JSON.parse(savedPresets));
    }

    if (savedNotificationsEnabled) {
      setNotificationsEnabled(savedNotificationsEnabled === "true");
    }
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
    if (savedFeedbackHistory) {
      setFeedbackHistory(JSON.parse(savedFeedbackHistory));
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
    localStorage.setItem("neuromix_presets", JSON.stringify(presets));
  }, [presets]);

  useEffect(() => {
    localStorage.setItem(
      "neuromix_notifications_enabled",
      JSON.stringify(notificationsEnabled)
    );
  }, [notificationsEnabled]);

  useEffect(() => {
    localStorage.setItem(
      "neuromix_feedback_history",
      JSON.stringify(feedbackHistory)
    );
  }, [feedbackHistory]);

  useEffect(() => {
    if (!notificationsEnabled) return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    const todayKey = toDateKey(new Date());
    const completedToday = completedSessions.some(
      (session) => toDateKey(session.completedAt) === todayKey
    );
    if (completedToday) return;
    const reminderKey = `neuromix_reminder_sent_${todayKey}`;
    const alreadySent = localStorage.getItem(reminderKey);
    if (alreadySent) return;
    const timeout = setTimeout(() => {
      new Notification("Keep your NeuroMix streak alive", {
        body: `You have ${currentStreak} day${currentStreak === 1 ? "" : "s"} in a row. Start a short session today.`,
      });
      localStorage.setItem(reminderKey, "true");
    }, 4000);
    return () => clearTimeout(timeout);
  }, [notificationsEnabled, completedSessions, currentStreak]);

  useEffect(() => {
    if (!isRunning || !sessionStarted || !currentStep) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = audioVolume;
  }, [audioVolume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentStep) return;

    audio.pause();
    audio.load();
    audio.volume = audioVolume;
    audio.muted = isMuted;

    if (sessionStarted && isRunning) {
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    }
  }, [currentStepIndex, currentStep?.audioFile, sessionStarted, isRunning]);

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
      selectedTemplateId,
      templateName: selectedTemplate?.name || null,
      generationMode: planGenerationMode,
      plan,
    };
  }

  async function handleGeneratePlan() {
    setIsGeneratingPlan(true);
    setPlanError("");
    setShowCompletedBanner(false);
    setShowFavoritedBanner(false);
    setEditingIndex(null);
    setDraftStep(null);

    const planInputs = {
      ...inputs,
      planStyle: selectedTemplate?.planStyle || null,
      adaptiveTiming: useAdaptiveTiming ? adaptiveTimingProfile : null,
      recentFeedback: feedbackHistory.slice(0, 10),
    };

    try {
      let newPlan = null;

      if (planGenerationMode === "ai") {
        const result = await generateAIPlan(planInputs);
        newPlan = result.plan;
        if (result.message) {
          setPlanError(result.message);
        }
      } else {
        newPlan = generatePlan(planInputs);
      }

      if (!newPlan || newPlan.length === 0) {
        newPlan = generatePlan(planInputs);
        setPlanError("No usable AI plan was returned, so Smart Plan was used instead.");
      }

      setPlan(newPlan);
      setCurrentStepIndex(0);
      setSessionStarted(false);
      setIsRunning(false);
      setSecondsLeft(0);

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
        selectedTemplateId,
        templateName: selectedTemplate?.name || null,
        generationMode: planGenerationMode,
        plan: newPlan,
      };

      setRecentSessions((prev) => [newSession, ...prev].slice(0, 5));
    } catch (error) {
      console.error(error);
      setPlanError("Something went wrong while generating your plan.");
    } finally {
      setIsGeneratingPlan(false);
    }
  }

  function handleLoadSession(session) {
    const migratedPlan = hydrateAiPlan(session.plan || []);
    setTask(session.task);
    setMood(session.mood);
    setEnergy(session.energy);
    setMinutes(session.minutes);
    setSituation(session.situation || "");
    setMode(session.mode || "lockin");
    setSelectedTemplateId(session.selectedTemplateId || null);
    if (!migratedPlan.length) {
      const rebuiltPlan = generatePlan({
        task: session.task || "studying",
        mood: session.mood || "neutral",
        energy: session.energy || "medium",
        minutes: session.minutes || 45,
        situation: session.situation || "",
        mode: session.mode || "lockin",
        planStyle: null,
        adaptiveTiming: null,
      });
      setPlan(rebuiltPlan);
    } else {
      setPlan(migratedPlan);
    }
    setPlanGenerationMode(session.generationMode || "smart");
    setCurrentStepIndex(0);
    setSessionStarted(false);
    setIsRunning(false);
    setSecondsLeft(0);
    setShowCompletedBanner(false);
    setShowFavoritedBanner(false);
    setEditingIndex(null);
    setDraftStep(null);
  }

  function handleSavePreset() {
    const trimmedName = presetName.trim();
    if (!trimmedName) return;

    const preset = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      name: trimmedName,
      task,
      mood,
      energy,
      minutes,
      mode,
      modeLabel: modeOptions[mode].label,
      situation,
      selectedTemplateId,
      templateName: selectedTemplate?.name || null,
      generationMode: planGenerationMode,
      useAdaptiveTiming,
      notificationsEnabled,
    };

    setPresets((prev) => [preset, ...prev].slice(0, 12));
    setPresetName("");
    setShowPresetBanner(true);
  }

  function handleLoadPreset(preset) {
    setTask(preset.task);
    setMood(preset.mood);
    setEnergy(preset.energy);
    setMinutes(preset.minutes);
    setMode(preset.mode);
    setSituation(preset.situation || "");
    setSelectedTemplateId(preset.selectedTemplateId || null);
    setPlanGenerationMode(preset.generationMode || "smart");
    setUseAdaptiveTiming(
      typeof preset.useAdaptiveTiming === "boolean" ? preset.useAdaptiveTiming : true
    );
    if (typeof preset.notificationsEnabled === "boolean") {
      setNotificationsEnabled(preset.notificationsEnabled);
    }
    setShowPresetBanner(false);
  }

  function handleRemovePreset(id) {
    setPresets((prev) => prev.filter((preset) => preset.id !== id));
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

    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
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
    setShowFeedbackCard(true);
    setFeedbackLength(null);
    setFeedbackFocus(null);
    setFeedbackMusic(null);
    setFeedbackNote("");

    const completedSession = {
      ...buildSessionObject("id"),
      completedAt: new Date().toISOString(),
    };

    setCompletedSessions((prev) => [completedSession, ...prev].slice(0, 20));

    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
  }

  function handleClear() {
    setPlan(null);
    setSituation("");
    setSelectedTemplateId(null);
    setSessionStarted(false);
    setIsRunning(false);
    setCurrentStepIndex(0);
    setSecondsLeft(0);
    setShowCompletedBanner(false);
    setShowFavoritedBanner(false);
    setEditingIndex(null);
    setDraftStep(null);
    setPlanError("");
    localStorage.removeItem("neuromix_plan");

    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
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

  function handleClearPresets() {
    setPresets([]);
    localStorage.removeItem("neuromix_presets");
  }

  function handleEditStep(index) {
    if (!plan) return;
    setEditingIndex(index);
    setDraftStep({ ...plan[index] });
  }

  function handleStepFieldChange(field, value) {
    setDraftStep((prev) => {
      if (!prev) return prev;

      let updated = { ...prev, [field]: value };

      if (field === "type") {
        const replacement = createStepTemplate(
          value,
          mode,
          mood,
          task,
          (situation || "").toLowerCase()
        );

        updated = {
          ...replacement,
          minutes: prev.minutes,
        };
      }

      return updated;
    });
  }

  function handleSaveStep() {
    if (!plan || editingIndex === null || !draftStep) return;

    const updatedPlan = [...plan];
    updatedPlan[editingIndex] = {
      ...draftStep,
      minutes: clamp(Number(draftStep.minutes) || 1, 1, 120),
    };

    setPlan(updatedPlan);
    setEditingIndex(null);
    setDraftStep(null);
  }

  function handleCancelEdit() {
    setEditingIndex(null);
    setDraftStep(null);
  }

  function handleDeleteStep(index) {
    if (!plan || plan.length <= 1) return;

    const updatedPlan = plan.filter((_, i) => i !== index);
    setPlan(updatedPlan);

    if (currentStepIndex >= updatedPlan.length) {
      setCurrentStepIndex(Math.max(0, updatedPlan.length - 1));
    }

    if (editingIndex === index) {
      setEditingIndex(null);
      setDraftStep(null);
    }
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setPlan((prev) => {
      const oldIndex = prev.findIndex((step) => step.id === active.id);
      const newIndex = prev.findIndex((step) => step.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  function handleApplyRecommendation() {
    setMinutes(recommendedMinutes);

    if (recommendedMode) {
      setMode(recommendedMode);
    }
  }

  function handleApplyTemplate(template) {
    setTask(template.task);
    setMood(template.mood);
    setEnergy(template.energy);
    setMinutes(template.minutes);
    setMode(template.mode);
    setSituation(template.situation);
    setSelectedTemplateId(template.id);
    setShowPresetBanner(false);
  }

  async function handleEnableNotifications() {
    if (!("Notification" in window)) {
      setPlanError("This browser does not support notifications.");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === "granted") {
        setNotificationsEnabled(true);
        setPlanError("");
      } else {
        setNotificationsEnabled(false);
        setPlanError("Notification permission was not granted.");
      }
    } catch (error) {
      console.error(error);
      setPlanError("Unable to enable notifications.");
    }
  }

  function handleSendTestNotification() {
    if (!("Notification" in window)) {
      setPlanError("This browser does not support notifications.");
      return;
    }
    if (Notification.permission !== "granted") {
      setPlanError("Enable notifications first.");
      return;
    }
    new Notification("NeuroMix Reminder", {
      body: "Your focus session is ready. Start a short session and keep your streak alive.",
    });
  }

  function handleSubmitFeedback() {
    const feedback = {
      id: Date.now(),
      submittedAt: new Date().toISOString(),
      task,
      mood,
      energy,
      mode,
      minutes,
      length: feedbackLength,
      focus: feedbackFocus,
      music: feedbackMusic,
      note: feedbackNote.trim(),
    };

    setFeedbackHistory((prev) => [feedback, ...prev].slice(0, 20));

    setCompletedSessions((prev) => {
      if (!prev.length) return prev;
      const updated = [...prev];
      updated[0] = { ...updated[0], feedback };
      return updated;
    });

    setShowFeedbackCard(false);
  }

  function handleSkipFeedback() {
    setShowFeedbackCard(false);
  }

  function handleShuffleCurrentSound() {
    if (!plan || !currentStep) return;
    const updatedPlan = [...plan];
    const newSound = getSoundForStep({
      stepType: currentStep.type,
      mode,
      mood,
      task,
      text: (situation || "").toLowerCase(),
      excludeFile: currentStep.audioFile,
    });
    updatedPlan[currentStepIndex] = {
      ...updatedPlan[currentStepIndex],
      soundTitle: newSound.soundTitle,
      soundDescription: newSound.soundDescription,
      audioFile: newSound.audioFile,
    };
    setPlan(updatedPlan);
  }

  function handleAddStep(stepType) {
    const newStep = createStepTemplate(
      stepType,
      mode,
      mood,
      task,
      (situation || "").toLowerCase()
    );

    setPlan((prev) => (prev ? [...prev, newStep] : [newStep]));
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
            session based on your mood, energy, mode, task, available time, and
            what's actually going on.
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

          <div className="quick-stats four-up">
            <div className="stat-box">
              <div className="stat-label">Current Streak</div>
              <div className="stat-value">{currentStreak}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Best Streak</div>
              <div className="stat-value">{bestStreak}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Sessions Today</div>
              <div className="stat-value">{sessionsToday}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Favorite Mode</div>
              <div className="stat-value">{favoriteMode}</div>
            </div>
          </div>

          <div className="quick-stats two-up" style={{ marginTop: 10 }}>
            <div className="stat-box">
              <div className="stat-label">Completed Sessions</div>
              <div className="stat-value">{totalCompletedSessions}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Total Focus Minutes</div>
              <div className="stat-value">{totalFocusMinutes}</div>
            </div>
          </div>

          <div className="activity-strip">
            <div className="activity-title">Last 7 Days</div>
            <div className="activity-grid">
              {last7Days.map((day) => (
                <div
                  key={day.key}
                  className={`activity-day ${day.count > 0 ? "active-day" : ""} ${
                    day.isToday ? "today-day" : ""
                  }`}
                >
                  <div className="activity-label">{day.label}</div>
                  <div className="activity-count">{day.count}</div>
                </div>
              ))}
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

            <div className="template-section">
              <div className="template-section-header">
                <h3 className="template-title">Study Templates</h3>
                <p className="template-subtitle">
                  Quick-start sessions for MCAT prep, writing, review, and
                  low-energy study blocks.
                </p>
              </div>

              <div className="template-grid">
                {studyTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    className={`template-card ${
                      selectedTemplateId === template.id
                        ? "template-card-active"
                        : ""
                    }`}
                    onClick={() => handleApplyTemplate(template)}
                  >
                    <div className="template-card-title">{template.name}</div>
                    <div className="template-card-description">
                      {template.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="generation-toggle">
              <div className="generation-toggle-label">Plan Generation</div>

              <div className="generation-toggle-row">
                <button
                  type="button"
                  className={`generation-pill ${
                    planGenerationMode === "smart"
                      ? "generation-pill-active"
                      : ""
                  }`}
                  onClick={() => setPlanGenerationMode("smart")}
                >
                  Smart Plan
                </button>

                <button
                  type="button"
                  className={`generation-pill ${
                    planGenerationMode === "ai"
                      ? "generation-pill-active"
                      : ""
                  }`}
                  onClick={() => setPlanGenerationMode("ai")}
                >
                  AI Plan
                </button>
              </div>

              <p className="mini-text" style={{ marginTop: 10 }}>
                Smart Plan uses your built-in NeuroMix logic. AI Plan is
                structured for a future GPT-powered generator and currently
                falls back safely.
              </p>
            </div>

            <div className="mode-grid">
              {Object.entries(modeOptions).map(([key, option]) => (
                <button
                  key={key}
                  type="button"
                  className={`mode-card ${
                    mode === key ? "mode-card-active" : ""
                  }`}
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
                <select
                  value={energy}
                  onChange={(e) => setEnergy(e.target.value)}
                >
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
                placeholder="Example: I'm overwhelmed and need to study biochem for 45 minutes without spiraling."
                rows={4}
                className="situation-box"
              />
            </label>

            <div className="preset-builder">
              <label>
                <span>Preset Name</span>
                <input
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="Example: MCAT Deep Work 90"
                />
              </label>

              <div className="button-row compact-row">
                <button className="secondary" onClick={handleSavePreset}>
                  Save Preset
                </button>
              </div>
            </div>

            <div className="button-row">
              <button
                className="primary"
                onClick={handleGeneratePlan}
                disabled={isGeneratingPlan}
              >
                {isGeneratingPlan
                  ? "Generating..."
                  : planGenerationMode === "ai"
                  ? "Generate AI Plan"
                  : "Generate Plan"}
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

            {selectedTemplate && (
              <p className="mini-text" style={{ marginTop: 12 }}>
                Template: <strong>{selectedTemplate.name}</strong>
              </p>
            )}

            <p className="mini-text" style={{ marginTop: 12 }}>
              Generation Mode:{" "}
              <strong>
                {planGenerationMode === "ai" ? "AI Plan" : "Smart Plan"}
              </strong>
            </p>

            <div className="recommendation-card">
              <div className="recommendation-label">Neuro Recommendation</div>

              <div className="recommendation-main">
                Try <strong>{recommendedMinutes} minutes</strong>
                {recommendedMode ? (
                  <>
                    {" "}
                    in <strong>{modeOptions[recommendedMode].label}</strong>
                  </>
                ) : null}
              </div>

              <p className="mini-text" style={{ marginTop: 8 }}>
                {recommendationReason}
              </p>

              {completedSessions.length > 0 && (
                <p className="mini-text" style={{ marginTop: 8 }}>
                  Average completed session length:{" "}
                  <strong>{averageCompletedMinutes} min</strong>
                </p>
              )}

              <div className="button-row compact-row" style={{ marginTop: 12 }}>
                <button className="secondary" onClick={handleApplyRecommendation}>
                  Apply Recommendation
                </button>
              </div>
            </div>

            <div className="adaptive-card">
              <div className="recommendation-label">Adaptive Timing</div>
              <div className="adaptive-main">
                <strong>{adaptiveTimingProfile.focusBlock} min</strong> focus •{" "}
                <strong>{adaptiveTimingProfile.shortBreak} min</strong> short break •{" "}
                <strong>{adaptiveTimingProfile.longBreak} min</strong> long break
              </div>
              <p className="mini-text" style={{ marginTop: 8 }}>
                {adaptiveTimingProfile.reason}
              </p>
              <div className="button-row compact-row" style={{ marginTop: 12 }}>
                <button
                  className="secondary"
                  onClick={() => setUseAdaptiveTiming((prev) => !prev)}
                >
                  {useAdaptiveTiming ? "Adaptive Timing On" : "Adaptive Timing Off"}
                </button>
              </div>
            </div>

            <div className="adaptive-card">
              <div className="recommendation-label">Streak Reminders</div>
              <div className="adaptive-main">
                Notifications:{" "}
                <strong>
                  {notificationsEnabled && notificationPermission === "granted"
                    ? "On"
                    : "Off"}
                </strong>
              </div>
              <p className="mini-text" style={{ marginTop: 8 }}>
                Get a reminder to start a session if you have not completed one today.
              </p>
              <div className="button-row compact-row" style={{ marginTop: 12 }}>
                <button className="secondary" onClick={handleEnableNotifications}>
                  Enable Notifications
                </button>
                <button className="secondary" onClick={handleSendTestNotification}>
                  Send Test Reminder
                </button>
              </div>
            </div>

            {showPresetBanner && (
              <div className="favorited-banner" style={{ marginTop: 14 }}>
                Preset saved.
              </div>
            )}
          </section>
        </div>

        <section className="card" style={{ marginTop: 18 }}>
          <div className="section-row">
            <h2>Saved Presets</h2>
            {presets.length > 0 && (
              <button className="secondary" onClick={handleClearPresets}>
                Clear Presets
              </button>
            )}
          </div>

          {presets.length === 0 ? (
            <p className="empty-text">
              No presets yet. Save a setup you use often.
            </p>
          ) : (
            <div className="recent-grid">
              {presets.map((preset) => (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  onLoad={handleLoadPreset}
                  onRemove={handleRemovePreset}
                />
              ))}
            </div>
          )}
        </section>

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
              No favorites yet. Generate a session and save one you want to
              reuse.
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
            <h2>Session Feedback History</h2>
            {feedbackHistory.length > 0 && (
              <button
                className="secondary"
                onClick={() => {
                  setFeedbackHistory([]);
                  localStorage.removeItem("neuromix_feedback_history");
                }}
              >
                Clear Feedback
              </button>
            )}
          </div>

          {feedbackHistory.length === 0 ? (
            <p className="empty-text">
              No feedback yet. Complete a session and rate it — the AI uses this to improve future plans.
            </p>
          ) : (
            <div className="recent-grid">
              {feedbackHistory.map((f) => (
                <div key={f.id} className="feedback-history-card">
                  <div className="recent-top">
                    <div className="recent-title">
                      {f.task} • {f.mood} • {f.minutes} min
                    </div>
                    <div className="recent-date">{formatSavedDate(f.submittedAt)}</div>
                  </div>
                  <div className="recent-mode">{f.mode}</div>
                  <div className="feedback-history-ratings">
                    {f.length && (
                      <span className={`feedback-rating-chip ${f.length === "Just right" ? "chip-good" : "chip-warn"}`}>
                        Length: {f.length}
                      </span>
                    )}
                    {f.focus && (
                      <span className={`feedback-rating-chip ${f.focus === "Great" ? "chip-good" : f.focus === "Bad" ? "chip-bad" : "chip-warn"}`}>
                        Focus: {f.focus}
                      </span>
                    )}
                    {f.music && (
                      <span className={`feedback-rating-chip ${f.music === "Great" ? "chip-good" : f.music === "Bad" ? "chip-bad" : "chip-warn"}`}>
                        Music: {f.music}
                      </span>
                    )}
                  </div>
                  {f.note && (
                    <p className="feedback-history-note">"{f.note}"</p>
                  )}
                </div>
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
            <div className="favorited-banner">Session saved to favorites.</div>
          )}

          {planError && <div className="plan-info-banner">{planError}</div>}

          {!plan ? (
            <p className="empty-text">
              Generate a plan to see your warm-up, focus blocks, breaks, and
              cool-down.
            </p>
          ) : (
            <>
              <div className="section-row" style={{ marginTop: 10 }}>
                <p className="summary-text">
                  Total planned: <strong>{totalPlanned} minutes</strong>
                </p>

                <div className="add-step-row">
                  <button
                    className="secondary"
                    onClick={() => handleAddStep("warmup")}
                  >
                    + Warm-up
                  </button>
                  <button
                    className="secondary"
                    onClick={() => handleAddStep("focus")}
                  >
                    + Focus
                  </button>
                  <button
                    className="secondary"
                    onClick={() => handleAddStep("break")}
                  >
                    + Break
                  </button>
                  <button
                    className="secondary"
                    onClick={() => handleAddStep("cooldown")}
                  >
                    + Cool-down
                  </button>
                </div>
              </div>

              <p className="mini-text">
                Current mode: <strong>{modeOptions[mode].label}</strong>
              </p>

              {situation && (
                <p className="mini-text">
                  Based on your situation: <strong>{situation}</strong>
                </p>
              )}

              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={plan.map((step) => step.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="step-list">
                    {plan.map((step, index) => (
                      <SortableStepCard
                        key={step.id}
                        id={step.id}
                        step={editingIndex === index ? draftStep : step}
                        isActive={sessionStarted && index === currentStepIndex}
                        isEditing={editingIndex === index}
                        onEdit={() => handleEditStep(index)}
                        onDelete={() => handleDeleteStep(index)}
                        onFieldChange={handleStepFieldChange}
                        onSave={handleSaveStep}
                        onCancel={handleCancelEdit}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </>
          )}
        </section>

        {plan && (
          <section className="card" style={{ marginTop: 18 }}>
            <h2>Session Runner</h2>

            {showCompletedBanner && (
              <div className="completed-banner">Session complete. Nice work.</div>
            )}

            {showFeedbackCard && (
              <div className="feedback-card">
                <div className="feedback-title">How did that go?</div>

                <div className="feedback-group">
                  <div className="feedback-label">Session length</div>
                  <div className="feedback-options">
                    {["Too short", "Just right", "Too long"].map((opt) => (
                      <button
                        key={opt}
                        className={`feedback-pill ${feedbackLength === opt ? "feedback-pill-active" : ""}`}
                        onClick={() => setFeedbackLength(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="feedback-group">
                  <div className="feedback-label">Focus quality</div>
                  <div className="feedback-options">
                    {["Bad", "Okay", "Great"].map((opt) => (
                      <button
                        key={opt}
                        className={`feedback-pill ${feedbackFocus === opt ? "feedback-pill-active" : ""}`}
                        onClick={() => setFeedbackFocus(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="feedback-group">
                  <div className="feedback-label">Music fit</div>
                  <div className="feedback-options">
                    {["Bad", "Okay", "Great"].map((opt) => (
                      <button
                        key={opt}
                        className={`feedback-pill ${feedbackMusic === opt ? "feedback-pill-active" : ""}`}
                        onClick={() => setFeedbackMusic(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="feedback-group">
                  <div className="feedback-label">Optional note</div>
                  <textarea
                    className="situation-box"
                    rows={2}
                    placeholder="e.g. breaks were too short, warmup helped, got distracted..."
                    value={feedbackNote}
                    onChange={(e) => setFeedbackNote(e.target.value)}
                  />
                </div>

                <div className="button-row compact-row">
                  <button className="primary" onClick={handleSubmitFeedback}>
                    Save Feedback
                  </button>
                  <button className="secondary" onClick={handleSkipFeedback}>
                    Skip
                  </button>
                </div>
              </div>
            )}

            {!sessionStarted ? (
              <div className="runner-box">
                <p className="runner-prompt">
                  Your {modeOptions[mode].label.toLowerCase()} session is ready.
                  Start when you're ready to lock in.
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

                      <audio ref={audioRef} className="audio-player" loop>
                        <source src={currentStep.audioFile} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>

                      <div className="audio-controls">
                        <button
                          className="secondary"
                          onClick={() => {
                            const newMuted = !isMuted;
                            setIsMuted(newMuted);
                            if (audioRef.current) {
                              audioRef.current.muted = newMuted;
                            }
                          }}
                        >
                          {isMuted ? "Unmute" : "Mute"}
                        </button>

                        <button
                          className="secondary"
                          onClick={handleShuffleCurrentSound}
                        >
                          Next Sound
                        </button>

                        <label className="volume-control">
                          <span>Volume</span>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={audioVolume}
                            onChange={(e) => {
                              const vol = Number(e.target.value);
                              setAudioVolume(vol);
                              if (audioRef.current) {
                                audioRef.current.volume = vol;
                              }
                            }}
                          />
                        </label>
                      </div>
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