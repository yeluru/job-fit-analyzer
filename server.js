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

// ── Catch-all for React router ───────────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/dist/index.html"));
  });
}

app.listen(PORT, () => console.log(`Job Fit Analyzer running on port ${PORT}`));
