import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many requests, please slow down." },
  validate: { xForwardedForHeader: false },
});

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/api/", limiter);

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function buildLearningProfile(feedback) {
  if (!feedback || feedback.length === 0) return "";

  const total = feedback.length;
  const tooLong = feedback.filter(f => f.length === "Too long").length;
  const tooShort = feedback.filter(f => f.length === "Too short").length;
  const justRight = feedback.filter(f => f.length === "Just right").length;
  const focusBad = feedback.filter(f => f.focus === "Bad").length;
  const focusGreat = feedback.filter(f => f.focus === "Great").length;
  const musicBad = feedback.filter(f => f.music === "Bad").length;
  const musicGreat = feedback.filter(f => f.music === "Great").length;

  const modeFocus = {};
  feedback.forEach(f => {
    if (f.mode && f.focus === "Great") {
      modeFocus[f.mode] = (modeFocus[f.mode] || 0) + 1;
    }
  });
  const bestMode = Object.entries(modeFocus).sort((a, b) => b[1] - a[1])[0]?.[0];

  const notes = feedback
    .filter(f => f.note)
    .slice(0, 3)
    .map(f => `"${f.note}"`)
    .join(", ");

  const insights = [];

  if (tooLong / total > 0.5) insights.push("User consistently finds sessions too long — shorten focus blocks significantly");
  else if (tooShort / total > 0.5) insights.push("User consistently finds sessions too short — extend focus blocks or add more");
  else if (justRight / total > 0.5) insights.push("Current session length is working well for this user");

  if (focusBad / total > 0.4) insights.push("User struggles with focus — use shorter blocks, more breaks, and grounding prompts");
  else if (focusGreat / total > 0.4) insights.push("User focuses well — can handle longer uninterrupted blocks");

  if (musicBad / total > 0.4) insights.push("User has rated music poorly — suggest minimal or different sound styles");
  else if (musicGreat / total > 0.4) insights.push("User enjoys the music — current sound selection is working");

  if (bestMode) insights.push(`User performs best in ${bestMode} mode`);
  if (notes) insights.push(`Recent user notes: ${notes}`);

  if (insights.length === 0) return "";

  return `
The user has ${total} session${total === 1 ? "" : "s"} of feedback history. Here is what you have learned about them:

${insights.map(i => `- ${i}`).join("\n")}

Use these insights to personalize this plan. Do not mention these insights in the output — just apply them silently.
`;
}

app.get("/", (req, res) => {
  res.send("NeuroMix AI server running");
});

app.post("/api/generate-plan", async (req, res) => {
  try {
    const { task, mood, energy, minutes, mode, situation, recentFeedback } = req.body;
    const learningProfile = buildLearningProfile(recentFeedback);

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      max_output_tokens: 800,
      input: [
        {
          role: "system",
          content: `
You are an AI that creates personalized focus session plans for a productivity app called NeuroMix.
Return ONLY valid JSON. Do not include markdown fences. Do not include commentary.

The JSON must follow this exact shape:
{
  "plan": [
    {
      "type": "warmup",
      "title": "Warm-Up",
      "minutes": 5,
      "prompt": "Short coaching prompt",
      "soundTitle": "Short sound label",
      "soundDescription": "Short sound description"
    }
  ]
}

Rules:
- Valid step types: warmup, focus, break, cooldown
- Always start with warmup, always end with cooldown
- Include at least 1 focus block
- Total minutes should be close to the requested time
- Prompts should be specific, supportive, and match the user's mood and task
- For anxious mood: shorter focus blocks, more breaks, calming prompts
- For tired/low energy: gentle pacing, permission to go slow
- For motivated/high energy: longer focus blocks, ambitious prompts
- For deep work mode: extended focus blocks, minimal breaks
- For recovery mode: very short focus blocks, longer breaks
`
        },
        {
          role: "user",
          content: `
Create a personalized session plan for:
Task: ${task}
Mood: ${mood}
Energy: ${energy}
Minutes: ${minutes}
Mode: ${mode}
Situation: ${situation || "None provided"}
${learningProfile}
`
        }
      ]
    });

    const rawText = response.output_text?.trim() || "";
    console.log("RAW AI RESPONSE:", rawText);

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (parseError) {
      console.error("JSON parse failed:", parseError);
      return res.status(500).json({ error: "AI returned invalid JSON", raw: rawText });
    }

    if (!parsed.plan || !Array.isArray(parsed.plan) || parsed.plan.length === 0) {
      return res.status(500).json({ error: "AI returned an empty plan", raw: parsed });
    }

    res.json({ plan: parsed.plan, source: "openai" });

  } catch (err) {
    console.error("AI route error:", err);
    res.status(500).json({ error: "AI plan generation failed" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});