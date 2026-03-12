import { useState, useCallback } from "react";

// ── Constants ────────────────────────────────────────────────────────────────
const TABS = ["Fit Score", "ATS Check", "What to Learn", "Interview Prep", "Cover Letter"];

const SAMPLE_RESUME = `Ravi Yeluru | Gainesville, VA | 703-717-1010 | rkyeluru@gmail.com

SUMMARY
Senior engineering leader with 20+ years delivering large-scale platforms across retail, financial services, and government.

EXPERIENCE

Engineering Lead — Federal Government (IRS) | Aug 2023–Present
• Lead cross-functional teams delivering secure federal platforms for 100M+ taxpayer interactions
• Own $15M technology portfolio, AWS cloud modernization, CI/CD pipelines
• Reduced deployment lead times by 50%, incident resolution by 35% via Splunk/CloudWatch

Director of Software Engineering — Walmart Global Tech | Apr 2019–Dec 2022
• Led 60+ engineers building CPC (Cloud Powered Checkout), replacing NCR chain-wide
• Managed $100M budget, delivered $20M annual savings, 40% deployment cycle reduction
• GitHub Actions, Kubernetes, GitOps, Docker, Terraform, data governance

Senior Software Engineering Manager — Fannie Mae | Mar 2015–Mar 2019
• Modernized Desktop Underwriter from Struts to Angular/Java microservices
• Served 1,800+ lenders, $8M budget, FHFA regulated environment

Technical Lead — Freddie Mac | Jun 2011–Mar 2015
• Led Loan Product Advisor ecosystem integrations and release management

EDUCATION
Executive MBA — George Mason University
MS Statistics — Andhra University

SKILLS
Java, Spring Boot, React, TypeScript, Angular, AWS, Docker, Kubernetes, Terraform,
CI/CD, GitHub Actions, Jenkins, GitOps, LLMs, LangChain, LangGraph, RAG,
MongoDB, PostgreSQL, Oracle, Splunk, HIPAA, FHFA compliance`;

// ── Helpers ──────────────────────────────────────────────────────────────────
function gradeColor(grade = "") {
  if (grade.startsWith("A")) return "#22c55e";
  if (grade.startsWith("B")) return "#3b82f6";
  if (grade.startsWith("C")) return "#f59e0b";
  return "#ef4444";
}

function atsColor(score) {
  if (score >= 75) return "#22c55e";
  if (score >= 55) return "#f59e0b";
  return "#ef4444";
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 12, padding: "24px 28px", ...style
    }}>
      {children}
    </div>
  );
}

function SectionLabel({ children, color = "var(--dim)" }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, letterSpacing: "0.18em",
      textTransform: "uppercase", color, marginBottom: 12,
      fontFamily: "'DM Sans', sans-serif"
    }}>
      {children}
    </div>
  );
}

function Tag({ text, type = "neutral" }) {
  const colors = {
    green:   { bg: "#14532d22", border: "#16a34a44", text: "#4ade80" },
    red:     { bg: "#7f1d1d22", border: "#dc262644", text: "#f87171" },
    blue:    { bg: "#1e3a5f22", border: "#3b82f644", text: "#60a5fa" },
    neutral: { bg: "var(--surface2)", border: "var(--border)", text: "var(--muted)" }
  };
  const c = colors[type] || colors.neutral;
  return (
    <span style={{
      display: "inline-block", padding: "4px 10px",
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 20, fontSize: 12, color: c.text,
      margin: "3px", fontFamily: "'DM Sans', sans-serif"
    }}>{text}</span>
  );
}

function BulletList({ items, color = "var(--blue)", icon = "›" }) {
  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {items.map((item, i) => (
        <li key={i} style={{
          display: "flex", gap: 10, marginBottom: 10,
          fontSize: 14, color: "var(--text)", lineHeight: 1.6
        }}>
          <span style={{ color, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{icon}</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

// ── Tab: Fit Score ────────────────────────────────────────────────────────────
function TabFitScore({ data }) {
  const gc = gradeColor(data.grade);
  return (
    <div className="fade-up">
      {/* Grade + Verdict */}
      <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{
          width: 100, height: 100, borderRadius: 16, flexShrink: 0,
          background: gc + "18", border: `2px solid ${gc}44`,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ fontSize: 42, fontWeight: 800, color: gc, lineHeight: 1, fontFamily: "'DM Sans', sans-serif" }}>
            {data.grade}
          </div>
          <div style={{ fontSize: 11, color: "var(--dim)", marginTop: 2 }}>FIT GRADE</div>
        </div>
        <Card style={{ flex: 1, minWidth: 200 }}>
          <SectionLabel>Overall Verdict</SectionLabel>
          <p style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.6 }}>{data.overall_fit}</p>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card>
          <SectionLabel color="#22c55e">✓ Why It Works</SectionLabel>
          <BulletList items={data.why_it_works || []} color="#22c55e" icon="✓" />
        </Card>
        <Card>
          <SectionLabel color="#ef4444">✗ Real Gaps</SectionLabel>
          <BulletList items={data.real_gaps || []} color="#ef4444" icon="✗" />
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card>
          <SectionLabel color="#a855f7">⬆ Level Check</SectionLabel>
          <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.6 }}>{data.level_check}</p>
        </Card>
        <Card>
          <SectionLabel color="#3b82f6">📍 Location</SectionLabel>
          <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.6 }}>{data.location_flag}</p>
        </Card>
      </div>

      <div style={{
        background: "#1e3a5f", border: "1px solid #1d4ed8",
        borderRadius: 12, padding: "20px 24px"
      }}>
        <SectionLabel color="#60a5fa">Final Verdict</SectionLabel>
        <p style={{ fontSize: 15, color: "var(--text)", lineHeight: 1.8 }}>{data.verdict}</p>
      </div>
    </div>
  );
}

// ── Tab: ATS Check ────────────────────────────────────────────────────────────
function TabATS({ data }) {
  const score = data.ats_score || 0;
  const color = atsColor(score);
  const matched = data.ats_matched_keywords || [];
  const missing = data.ats_missing_keywords || [];

  return (
    <div className="fade-up">
      <Card style={{ marginBottom: 16 }}>
        <SectionLabel>ATS Compatibility Score</SectionLabel>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ position: "relative", width: 100, flexShrink: 0 }}>
            <svg viewBox="0 0 100 100" style={{ width: 100, height: 100, transform: "rotate(-90deg)" }}>
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border)" strokeWidth="10" />
              <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - score / 100)}`}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1s ease" }}
              />
            </svg>
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center"
            }}>
              <span style={{ fontSize: 24, fontWeight: 800, color, fontFamily: "'DM Sans', sans-serif" }}>{score}</span>
              <span style={{ fontSize: 10, color: "var(--dim)" }}>/ 100</span>
            </div>
          </div>
          <div>
            <p style={{ fontSize: 15, color: "var(--text)", marginBottom: 8 }}>
              {score >= 75
                ? "Strong ATS pass — most keyword filters will let this through."
                : score >= 55
                ? "Moderate — likely to pass some filters but will be flagged by strict ATS."
                : "High risk of ATS rejection. Add missing keywords before applying."}
            </p>
            <p style={{ fontSize: 13, color: "var(--dim)" }}>
              Based on keyword density and match between resume and JD language.
            </p>
          </div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <SectionLabel color="#22c55e">✓ Keywords Found ({matched.length})</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {matched.map(kw => <Tag key={kw} text={kw} type="green" />)}
          </div>
        </Card>
        <Card>
          <SectionLabel color="#ef4444">✗ Keywords Missing ({missing.length})</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {missing.map(kw => <Tag key={kw} text={kw} type="red" />)}
          </div>
          {missing.length > 0 && (
            <p style={{ fontSize: 13, color: "var(--dim)", marginTop: 12, lineHeight: 1.6 }}>
              Add these naturally to your resume where truthful. Don't stuff — weave them in.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

// ── Tab: What to Learn ────────────────────────────────────────────────────────
function TabLearn({ data, videos }) {
  const topics = data.learning_topics || [];

  return (
    <div className="fade-up">
      {topics.length === 0 && (
        <Card><p style={{ color: "var(--muted)" }}>No learning topics identified — strong overall match.</p></Card>
      )}
      {topics.map((topic, i) => (
        <div key={i} style={{ marginBottom: 24 }}>
          <Card style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, background: "#1d4ed822",
                border: "1px solid #3b82f644", display: "flex", alignItems: "center",
                justifyContent: "center", flexShrink: 0,
                fontSize: 13, fontWeight: 700, color: "var(--blue)"
              }}>{i + 1}</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                  {topic.topic}
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
                  {topic.reason}
                </div>
              </div>
            </div>
          </Card>

          {/* YouTube Videos */}
          {videos[topic.topic] && videos[topic.topic].length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {videos[topic.topic].map(v => (
                <a key={v.id} href={v.url} target="_blank" rel="noopener noreferrer"
                  style={{ textDecoration: "none" }}>
                  <div style={{
                    background: "var(--surface)", border: "1px solid var(--border)",
                    borderRadius: 10, overflow: "hidden",
                    transition: "border-color 0.2s",
                    cursor: "pointer"
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "var(--blue)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                  >
                    <div style={{ position: "relative" }}>
                      <img src={v.thumbnail} alt={v.title}
                        style={{ width: "100%", height: 90, objectFit: "cover", display: "block" }} />
                      <div style={{
                        position: "absolute", inset: 0,
                        background: "rgba(0,0,0,0.3)",
                        display: "flex", alignItems: "center", justifyContent: "center"
                      }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%",
                          background: "rgba(255,0,0,0.9)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12, paddingLeft: 2
                        }}>▶</div>
                      </div>
                    </div>
                    <div style={{ padding: "10px 12px" }}>
                      <div style={{
                        fontSize: 12, color: "var(--text)", lineHeight: 1.4,
                        fontWeight: 500, marginBottom: 4,
                        display: "-webkit-box", WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical", overflow: "hidden"
                      }}>{v.title}</div>
                      <div style={{ fontSize: 11, color: "var(--dim)" }}>{v.channel}</div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}

          {videos[topic.topic] === undefined && (
            <div style={{
              padding: "12px 16px", background: "var(--surface2)",
              borderRadius: 8, fontSize: 13, color: "var(--dim)",
              border: "1px solid var(--border)"
            }}>
              Search YouTube for: <span style={{ color: "var(--blue)" }}>"{topic.youtube_query}"</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Tab: Interview Prep ────────────────────────────────────────────────────────
function TabInterview({ data }) {
  const questions = data.interview_questions || [];
  const [open, setOpen] = useState(null);

  return (
    <div className="fade-up">
      <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 20, lineHeight: 1.6 }}>
        These are the questions you'll likely face because of gaps between your profile and this role. 
        Click each to see how to answer from your actual experience.
      </p>
      {questions.map((q, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <div
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              background: open === i ? "var(--surface2)" : "var(--surface)",
              border: `1px solid ${open === i ? "var(--blue-dim)" : "var(--border)"}`,
              borderRadius: open === i ? "10px 10px 0 0" : 10,
              padding: "16px 20px", cursor: "pointer",
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              gap: 12, transition: "all 0.2s"
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: "var(--blue)", fontWeight: 600, marginBottom: 6,
                letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Gap: {q.gap}
              </div>
              <div style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.5, fontWeight: 500 }}>
                "{q.question}"
              </div>
            </div>
            <span style={{ color: "var(--dim)", flexShrink: 0, fontSize: 18, marginTop: 2 }}>
              {open === i ? "−" : "+"}
            </span>
          </div>
          {open === i && (
            <div style={{
              background: "#1e3a5f18", border: "1px solid var(--blue-dim)",
              borderTop: "none", borderRadius: "0 0 10px 10px",
              padding: "20px 20px"
            }}>
              <div style={{ fontSize: 11, color: "#60a5fa", fontWeight: 700, marginBottom: 10,
                letterSpacing: "0.1em", textTransform: "uppercase" }}>
                How to answer
              </div>
              <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.7 }}>{q.answer_angle}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Tab: Cover Letter ─────────────────────────────────────────────────────────
function TabCoverLetter({ resume, jobDescription, analysis }) {
  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setLoading(true);
    setLetter("");
    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobDescription, analysis })
      });
      const data = await res.json();
      setLetter(data.letter || "");
    } catch (e) {
      setLetter("Failed to generate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fade-up">
      {!letter && !loading && (
        <Card style={{ textAlign: "center", padding: "40px 28px" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✉️</div>
          <h3 style={{ fontSize: 20, color: "var(--text)", marginBottom: 8 }}>Cover Letter Generator</h3>
          <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7, marginBottom: 24, maxWidth: 480, margin: "0 auto 24px" }}>
            A tailored cover letter written from your actual experience. No fluff, no "I am writing to express my interest." 
            Opens with your strongest hook, closes with confidence.
          </p>
          <button onClick={generate} style={{
            padding: "13px 36px",
            background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
            color: "#fff", border: "none", borderRadius: 8,
            fontSize: 15, fontWeight: 600, cursor: "pointer",
            boxShadow: "0 4px 20px rgba(59,130,246,0.3)"
          }}>
            Generate Cover Letter
          </button>
        </Card>
      )}

      {loading && (
        <Card style={{ textAlign: "center", padding: "48px" }}>
          <div className="spinner" style={{ margin: "0 auto 16px" }} />
          <p style={{ color: "var(--muted)", fontSize: 14 }}>Writing your cover letter...</p>
        </Card>
      )}

      {letter && !loading && (
        <>
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 12, padding: "32px 36px", marginBottom: 16,
            fontFamily: "Georgia, serif", fontSize: 15, color: "var(--text)",
            lineHeight: 1.9, whiteSpace: "pre-wrap"
          }}>
            {letter}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={copy} style={{
              padding: "10px 24px", background: copied ? "#14532d" : "var(--surface2)",
              border: "1px solid var(--border)", borderRadius: 8, color: copied ? "#4ade80" : "var(--muted)",
              cursor: "pointer", fontSize: 13, fontWeight: 500, transition: "all 0.2s"
            }}>
              {copied ? "✓ Copied!" : "Copy to Clipboard"}
            </button>
            <button onClick={generate} style={{
              padding: "10px 24px", background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
              border: "none", borderRadius: 8, color: "#fff",
              cursor: "pointer", fontSize: 13, fontWeight: 600
            }}>
              Regenerate
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [videos, setVideos] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loadSample, setLoadSample] = useState(false);

  const analyze = useCallback(async () => {
    if (!resume.trim() || !jd.trim()) return;
    setLoading(true);
    setAnalysis(null);
    setVideos({});
    setError(null);
    setActiveTab(0);

    try {
      // Step 1: Analyze
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobDescription: jd })
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data = await res.json();
      setAnalysis(data);

      // Step 2: Fetch YouTube videos for learning topics (non-blocking)
      if (data.learning_topics?.length > 0) {
        fetch("/api/youtube", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topics: data.learning_topics })
        })
          .then(r => r.json())
          .then(vd => setVideos(vd.videos || {}))
          .catch(() => {});
      }
    } catch (e) {
      setError("Analysis failed. Check that your server is running and API key is set.");
    } finally {
      setLoading(false);
    }
  }, [resume, jd]);

  const reset = () => {
    setAnalysis(null);
    setVideos({});
    setError(null);
    setJd("");
    setResume("");
    setLoadSample(false);
  };

  const canAnalyze = resume.trim().length > 50 && jd.trim().length > 100;

  // ── Input Screen ─────────────────────────────────────────────────────────
  if (!analysis && !loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
        {/* Header */}
        <div style={{
          background: "var(--surface)", borderBottom: "1px solid var(--border)",
          padding: "20px 40px", display: "flex", alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--blue)", letterSpacing: "0.2em",
              textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>
              PrepRight
            </div>
            <h1 style={{ fontSize: 24, color: "var(--text)", fontWeight: 700 }}>
              Job Fit Analyzer
            </h1>
          </div>
          <div style={{ fontSize: 13, color: "var(--dim)" }}>
            Honest AI analysis. No fluff.
          </div>
        </div>

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 40px" }}>
          {error && (
            <div style={{
              background: "#450a0a", border: "1px solid #7f1d1d",
              borderRadius: 8, padding: "14px 18px", color: "#fca5a5",
              fontSize: 14, marginBottom: 20
            }}>{error}</div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            {/* Resume */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)",
                  letterSpacing: "0.05em" }}>YOUR RESUME</label>
                <button
                  onClick={() => { setResume(SAMPLE_RESUME); setLoadSample(true); }}
                  style={{
                    fontSize: 12, color: "var(--blue)", background: "none",
                    border: "none", cursor: "pointer", textDecoration: "underline"
                  }}>
                  Load sample
                </button>
              </div>
              <textarea
                value={resume}
                onChange={e => setResume(e.target.value)}
                placeholder="Paste your resume here — summary, experience, education, skills..."
                style={{
                  width: "100%", height: 340, padding: 16,
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: 10, color: "var(--text)", outline: "none",
                  resize: "vertical",
                  transition: "border-color 0.2s"
                }}
                onFocus={e => e.target.style.borderColor = "var(--blue-dim)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
            </div>

            {/* JD */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600,
                color: "var(--muted)", letterSpacing: "0.05em", marginBottom: 8 }}>
                JOB DESCRIPTION
              </label>
              <textarea
                value={jd}
                onChange={e => setJd(e.target.value)}
                placeholder="Paste the full job description — title, responsibilities, requirements, everything..."
                style={{
                  width: "100%", height: 340, padding: 16,
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: 10, color: "var(--text)", outline: "none",
                  resize: "vertical",
                  transition: "border-color 0.2s"
                }}
                onFocus={e => e.target.style.borderColor = "var(--blue-dim)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 13, color: "var(--dim)" }}>
              {canAnalyze ? "Ready to analyze →" : "Paste your resume and a job description to begin"}
            </div>
            <button
              onClick={analyze}
              disabled={!canAnalyze}
              style={{
                padding: "14px 40px",
                background: canAnalyze ? "linear-gradient(135deg, #1d4ed8, #3b82f6)" : "var(--surface2)",
                color: canAnalyze ? "#fff" : "var(--dim)",
                border: "none", borderRadius: 8, cursor: canAnalyze ? "pointer" : "not-allowed",
                fontSize: 15, fontWeight: 600, letterSpacing: "0.02em",
                boxShadow: canAnalyze ? "0 4px 24px rgba(59,130,246,0.35)" : "none",
                transition: "all 0.2s"
              }}
            >
              Analyze Fit →
            </button>
          </div>

          {/* Features */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12, marginTop: 48
          }}>
            {[
              { icon: "🎯", title: "Fit Score", desc: "Letter grade + honest breakdown of strengths and gaps" },
              { icon: "🤖", title: "ATS Check", desc: "Keyword match score, found vs missing keywords" },
              { icon: "📚", title: "What to Learn", desc: "Gap-based learning plan with YouTube tutorials" },
              { icon: "💬", title: "Interview Prep", desc: "Likely questions from your gaps + how to answer them" },
            ].map(f => (
              <div key={f.title} style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 10, padding: "18px 16px"
              }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{f.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: "var(--dim)", lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Loading Screen ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "var(--bg)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 20
      }}>
        <div className="spinner" />
        <div style={{ fontSize: 16, color: "var(--muted)" }}>Analyzing your fit...</div>
        <div style={{ fontSize: 13, color: "var(--dim)", maxWidth: 300, textAlign: "center", lineHeight: 1.6 }}>
          Reading the JD, scoring ATS keywords, identifying gaps, preparing interview questions.
        </div>
      </div>
    );
  }

  // ── Results Screen ────────────────────────────────────────────────────────
  const gc = gradeColor(analysis?.grade);
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Results Header */}
      <div style={{
        background: "var(--surface)", borderBottom: "1px solid var(--border)",
        padding: "16px 40px", display: "flex", alignItems: "center",
        justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 11, color: "var(--blue)", letterSpacing: "0.2em",
            textTransform: "uppercase", fontWeight: 600 }}>PrepRight</div>
          <span style={{ color: "var(--border)" }}>|</span>
          <span style={{ fontSize: 14, color: "var(--muted)" }}>Job Fit Analyzer</span>
          {analysis?.grade && (
            <>
              <span style={{ color: "var(--border)" }}>|</span>
              <span style={{
                fontSize: 16, fontWeight: 800, color: gc,
                fontFamily: "'DM Sans', sans-serif"
              }}>Grade: {analysis.grade}</span>
            </>
          )}
        </div>
        <button onClick={reset} style={{
          padding: "8px 20px", background: "var(--surface2)",
          border: "1px solid var(--border)", borderRadius: 6,
          color: "var(--muted)", cursor: "pointer", fontSize: 13
        }}>
          ← New Analysis
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        background: "var(--surface)", borderBottom: "1px solid var(--border)",
        padding: "0 40px", display: "flex", gap: 4
      }}>
        {TABS.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)} style={{
            padding: "14px 20px", background: "none",
            border: "none", borderBottom: `2px solid ${activeTab === i ? "var(--blue)" : "transparent"}`,
            color: activeTab === i ? "var(--blue)" : "var(--dim)",
            cursor: "pointer", fontSize: 13, fontWeight: activeTab === i ? 600 : 400,
            transition: "all 0.15s", marginBottom: -1
          }}>{tab}</button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 40px" }}>
        {activeTab === 0 && <TabFitScore data={analysis} />}
        {activeTab === 1 && <TabATS data={analysis} />}
        {activeTab === 2 && <TabLearn data={analysis} videos={videos} />}
        {activeTab === 3 && <TabInterview data={analysis} />}
        {activeTab === 4 && (
          <TabCoverLetter
            resume={resume}
            jobDescription={jd}
            analysis={analysis}
          />
        )}
      </div>
    </div>
  );
}
