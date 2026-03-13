require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const Anthropic = require("@anthropic-ai/sdk");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3001;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.use(cors());
app.use(express.json({ limit: "50kb" }));

// ── Serve React build in production ─────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/dist")));
}

// ── ANALYZE endpoint ─────────────────────────────────────────────────────────
app.post("/api/analyze", async (req, res) => {
  const { resume, jobDescription } = req.body;
  if (!resume || !jobDescription) {
    return res.status(400).json({ error: "Resume and job description are required." });
  }

  const systemPrompt = `You are a brutally honest career advisor and ATS expert. You analyze job fit with precision and zero corporate fluff.

Given a candidate's resume and a job description, respond ONLY with valid JSON (no markdown, no backticks, no preamble).

Return this exact JSON structure:
{
  "grade": "B+",
  "overall_fit": "One sentence verdict on overall fit",
  "ats_score": 72,
  "ats_matched_keywords": ["keyword1", "keyword2"],
  "ats_missing_keywords": ["keyword1", "keyword2"],
  "why_it_works": ["Specific strength 1", "Specific strength 2", "Specific strength 3"],
  "real_gaps": ["Honest gap 1", "Honest gap 2", "Honest gap 3"],
  "level_check": "Is this role above/at/below candidate level? Compensation trajectory?",
  "location_flag": "Any location/remote concerns or 'No issues'",
  "verdict": "2-3 sentence final verdict. Should they apply? Why or why not?",
  "learning_topics": [
    {
      "topic": "Topic name",
      "reason": "Why this gap matters for the role",
      "youtube_query": "best search query to find YouTube tutorials on this"
    }
  ],
  "interview_questions": [
    {
      "gap": "The gap this question probes",
      "question": "Likely interview question",
      "answer_angle": "How candidate should answer given their actual background"
    }
  ]
}

Rules:
- grade: A/B/C/D/F with optional +/- 
- ats_score: 0-100 integer based on keyword overlap
- ats_matched_keywords: top 8-12 keywords from JD found in resume
- ats_missing_keywords: top 5-8 critical keywords from JD missing from resume
- why_it_works: 3-4 items, be specific not generic
- real_gaps: 3-4 items, be honest and direct
- learning_topics: 3-5 items covering the most important gaps
- interview_questions: 4-6 questions they will likely face because of gaps
- Never fabricate experience. Never be sycophantic.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{
        role: "user",
        content: `RESUME:\n${resume}\n\nJOB DESCRIPTION:\n${jobDescription}`
      }]
    });

    const raw = response.content[0].text.trim();
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);
  } catch (err) {
    console.error("Analyze error:", err.message);
    res.status(500).json({ error: "Analysis failed. Check your API key and try again." });
  }
});

// ── YOUTUBE endpoint ─────────────────────────────────────────────────────────
app.post("/api/youtube", async (req, res) => {
  const { topics } = req.body;
  if (!topics || !Array.isArray(topics)) {
    return res.status(400).json({ error: "Topics array required." });
  }

  const YOUTUBE_KEY = process.env.YOUTUBE_API_KEY;
  if (!YOUTUBE_KEY) {
    return res.json({ videos: {} });
  }

  try {
    const results = {};
    for (const topic of topics.slice(0, 5)) {
      const resp = await axios.get("https://www.googleapis.com/youtube/v3/search", {
        params: {
          key: YOUTUBE_KEY,
          q: topic.youtube_query,
          part: "snippet",
          type: "video",
          maxResults: 3,
          relevanceLanguage: "en",
          videoDuration: "medium"
        }
      });
      results[topic.topic] = resp.data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.medium.url,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`
      }));
    }
    res.json({ videos: results });
  } catch (err) {
    console.error("YouTube error:", err.message);
    res.json({ videos: {} });
  }
});

// ── COVER LETTER endpoint ─────────────────────────────────────────────────────
app.post("/api/cover-letter", async (req, res) => {
  const { resume, jobDescription, analysis } = req.body;
  if (!resume || !jobDescription) {
    return res.status(400).json({ error: "Resume and job description required." });
  }

  const prompt = `Write a compelling, honest cover letter for this candidate applying to this role.

CANDIDATE RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}

${analysis ? `FIT ANALYSIS CONTEXT:
- Grade: ${analysis.grade}
- Strengths: ${analysis.why_it_works?.join(", ")}
- Gaps to address: ${analysis.real_gaps?.join(", ")}` : ""}

Rules:
- 3 tight paragraphs. No fluff. No "I am writing to express my interest."
- Open with the strongest hook — the most compelling match between candidate and role.
- Second paragraph: specific achievements with real numbers/metrics from their resume.
- Third paragraph: acknowledge one gap honestly and pivot to why they're still the right bet.
- Sign off confidently, not desperately.
- Never fabricate experience or metrics.
- Tone: confident, direct, human. Not corporate.

Output ONLY the cover letter text. No subject line. No "Dear Hiring Manager" header. Start directly with the hook.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }]
    });
    res.json({ letter: response.content[0].text.trim() });
  } catch (err) {
    console.error("Cover letter error:", err.message);
    res.status(500).json({ error: "Cover letter generation failed." });
  }
});

// ── Shared helper for interview prep sections ─────────────────────────────────
async function runPrepSection(systemPrompt, resume, jobDescription, maxTokens = 2000) {
  const response = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: `RESUME:\n${resume}\n\nJOB DESCRIPTION:\n${jobDescription}` }]
  });
  const raw = response.content[0].text.trim().replace(/```json|```/g, "").trim();
  return JSON.parse(raw);
}

// ── SECTION 1: Decode the Role ────────────────────────────────────────────────
app.post("/api/prep/decode", async (req, res) => {
  const { resume, jobDescription } = req.body;
  if (!resume || !jobDescription) return res.status(400).json({ error: "Missing fields." });
  try {
    const data = await runPrepSection(`You are PrepRight. Respond ONLY with valid JSON, no markdown, no backticks.
Return exactly: { "what_they_really_want": "2-3 sentences on what problem this company is actually trying to solve by hiring this person", "success_looks_like": "What the ideal candidate delivers in the first 90 days", "hidden_priorities": ["Priority reading between the lines 1", "Priority 2", "Priority 3"], "culture_signals": ["Culture signal from the JD 1", "Signal 2"] }
Be specific to this JD. No generic answers.`, resume, jobDescription, 1000);
    res.json(data);
  } catch (e) { console.error("decode error:", e.message); res.status(500).json({ error: e.message }); }
});

// ── SECTION 2: Fit Scoring ────────────────────────────────────────────────────
app.post("/api/prep/fit", async (req, res) => {
  const { resume, jobDescription } = req.body;
  if (!resume || !jobDescription) return res.status(400).json({ error: "Missing fields." });
  try {
    const data = await runPrepSection(`You are PrepRight. Respond ONLY with valid JSON, no markdown, no backticks.
Return: { "scores": [ { "requirement": "requirement (max 8 words)", "score": 8, "evidence": "1 sentence", "gap_briefing": null } ] }
Rules: Extract exactly 6 requirements. Score 1-10. For scores 8+, gap_briefing is null. For scores 7 or below: gap_briefing = { "blunt_assessment": "1 sentence - what is missing and why it hurts", "prep_plan": "2 concrete steps max", "bridge_story": "1 sentence - closest experience + framing", "landmine_question": "The one question this gap exposes", "model_answer": "2 sentences max - honest without self-destructing" }. Be terse. Every field short.`, resume, jobDescription, 2000);
    res.json(data);
  } catch (e) { console.error("fit error:", e.message); res.status(500).json({ error: e.message }); }
});

// ── SECTION 3: Knowledge Domains ─────────────────────────────────────────────
app.post("/api/prep/knowledge", async (req, res) => {
  const { resume, jobDescription } = req.body;
  if (!resume || !jobDescription) return res.status(400).json({ error: "Missing fields." });
  try {
    const data = await runPrepSection(`You are PrepRight. Respond ONLY with valid JSON, no markdown, no backticks.
Return exactly: { "domains": [ { "domain": "Domain name", "why_it_matters": "Why this will come up in THIS specific interview", "key_concepts": ["Concept 1", "Concept 2", "Concept 3"], "data_points": ["Stat or fact to cite", "Another data point"], "opening_frame": "Exact sentence to open your answer when this domain comes up" } ] }
Identify 4-5 domains most likely to be tested for this specific role. Be specific, not generic.`, resume, jobDescription, 2000);
    res.json(data);
  } catch (e) { console.error("knowledge error:", e.message); res.status(500).json({ error: e.message }); }
});

// ── SECTION 4: CERT Stories ───────────────────────────────────────────────────
app.post("/api/prep/stories", async (req, res) => {
  const { resume, jobDescription } = req.body;
  if (!resume || !jobDescription) return res.status(400).json({ error: "Missing fields." });
  try {
    const data = await runPrepSection(`You are PrepRight. Respond ONLY with valid JSON, no markdown, no backticks.
Return exactly: { "stories": [ { "title": "Story title", "context": "The situation and what was at stake", "execution": "Exactly what YOU did — specific actions only", "result": "Measurable outcome with numbers", "transfer": "How this story maps directly to this role" } ] }
Generate 4-5 CERT stories drawn ONLY from the candidate's actual resume. Never fabricate experience. Map each story to a specific requirement in the JD.`, resume, jobDescription, 2000);
    res.json(data);
  } catch (e) { console.error("stories error:", e.message); res.status(500).json({ error: e.message }); }
});

// ── SECTION 5: Mock Q&A ───────────────────────────────────────────────────────
app.post("/api/prep/mockqa", async (req, res) => {
  const { resume, jobDescription } = req.body;
  if (!resume || !jobDescription) return res.status(400).json({ error: "Missing fields." });
  try {
    const data = await runPrepSection(`You are PrepRight. Respond ONLY with valid JSON, no markdown, no backticks.
Return exactly: { "tell_me_about_yourself": "Full 90-second model answer tailored to this specific role — opens strong, covers arc, lands on why this role", "behavioral": [ { "question": "Behavioral question", "model_answer": "CERT-structured answer using only real background from resume" } ], "technical": [ { "question": "Technical or domain-specific question", "model_answer": "Crisp, specific answer" } ] }
behavioral: 4 questions. technical: 3 questions. All answers must use only the candidate's real background. Never fabricate.`, resume, jobDescription, 2500);
    res.json(data);
  } catch (e) { console.error("mockqa error:", e.message); res.status(500).json({ error: e.message }); }
});

// ── SECTION 6: Questions to Ask ───────────────────────────────────────────────
app.post("/api/prep/questions", async (req, res) => {
  const { resume, jobDescription } = req.body;
  if (!resume || !jobDescription) return res.status(400).json({ error: "Missing fields." });
  try {
    const data = await runPrepSection(`You are PrepRight. Respond ONLY with valid JSON, no markdown, no backticks.
Return exactly: { "questions": [ { "question": "Smart question to ask the interviewer", "why": "Why this question signals strategic thinking", "layer": "hiring manager | skip level | peer | HR" } ] }
Generate 6 questions. Tailor them to this specific role and company. Not generic — questions that show you've thought deeply about the role.`, resume, jobDescription, 1000);
    res.json(data);
  } catch (e) { console.error("questions error:", e.message); res.status(500).json({ error: e.message }); }
});

// ── SECTION 7: Hard Questions ─────────────────────────────────────────────────
app.post("/api/prep/hard", async (req, res) => {
  const { resume, jobDescription } = req.body;
  if (!resume || !jobDescription) return res.status(400).json({ error: "Missing fields." });
  try {
    const data = await runPrepSection(`You are PrepRight. Respond ONLY with valid JSON, no markdown, no backticks.
Return exactly: { "hard_questions": [ { "question": "The hard question as interviewer would ask it", "why_they_ask": "What they are really testing", "model_answer": "Honest answer that doesn't self-destruct" } ] }
Include exactly these 5 questions tailored to this candidate and role: (1) Why leaving current role, (2) Biggest weakness, (3) Why this company over others, (4) A failure or mistake, (5) The hardest gap question specific to this JD. Be honest, not encouraging.`, resume, jobDescription, 1500);
    res.json(data);
  } catch (e) { console.error("hard error:", e.message); res.status(500).json({ error: e.message }); }
});

// ── SECTION 8: Reference Card ─────────────────────────────────────────────────
app.post("/api/prep/refcard", async (req, res) => {
  const { resume, jobDescription } = req.body;
  if (!resume || !jobDescription) return res.status(400).json({ error: "Missing fields." });
  try {
    const data = await runPrepSection(`You are PrepRight. Respond ONLY with valid JSON, no markdown, no backticks.
Return exactly: { "my_headline": "One sentence capturing who this person is for this specific role", "top_3_strengths": ["Strength 1", "Strength 2", "Strength 3"], "gap_to_own": "The one gap to acknowledge honestly if pressed — and how to frame it", "my_ask": "The one thing you want them to remember after you leave", "opening_line": "Exact first sentence when they say tell me about yourself", "closing_line": "Exact last sentence before leaving the room", "three_things_to_remember": ["Thing 1", "Thing 2", "Thing 3"] }
This is the one-page card they read 5 minutes before walking in. Make it crisp, specific, and confidence-building.`, resume, jobDescription, 1000);
    res.json(data);
  } catch (e) { console.error("refcard error:", e.message); res.status(500).json({ error: e.message }); }
});

// ── Catch-all for React router ───────────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/dist/index.html"));
  });
}

app.listen(PORT, () => console.log(`Job Fit Analyzer running on port ${PORT}`));