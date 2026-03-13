import { useState, useEffect, useCallback } from "react";

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
Executive MBA — George Mason University | MS Statistics — Andhra University

SKILLS
Java, Spring Boot, React, TypeScript, Angular, AWS, Docker, Kubernetes, Terraform,
CI/CD, GitHub Actions, Jenkins, GitOps, LLMs, LangChain, LangGraph, RAG,
MongoDB, PostgreSQL, Oracle, Splunk, HIPAA, FHFA compliance`;

const TABS = ["🎯 Fit Score", "🤖 ATS Check", "📚 What to Learn", "💬 Interview Prep", "✉️ Cover Letter"];

// ── Theme tokens ──────────────────────────────────────────────────────────────
const DARK = {
  bg: "#0b0f1a", surface: "#141926", surface2: "#1c2333",
  border: "#252d40", border2: "#2e3a52",
  text: "#e2e8f0", muted: "#94a3b8", dim: "#64748b",
  blue: "#3b82f6", blueDim: "#1d4ed8", blueBg: "#1a2d4a", blueBorder: "#1d4ed8", blueText: "#60a5fa",
  green: "#22c55e", greenBg: "rgba(20,83,45,0.2)", greenBdr: "rgba(22,163,74,0.4)", greenText: "#4ade80",
  red: "#ef4444", redBg: "rgba(127,29,29,0.2)", redBdr: "rgba(220,38,38,0.4)", redText: "#f87171",
  purple: "#a855f7", amber: "#f59e0b",
  headerBg: "#141926", spinnerTrack: "#252d40",
};
const LIGHT = {
  bg: "#f1f5f9", surface: "#ffffff", surface2: "#f8fafc",
  border: "#e2e8f0", border2: "#cbd5e1",
  text: "#0f172a", muted: "#475569", dim: "#94a3b8",
  blue: "#2563eb", blueDim: "#1d4ed8", blueBg: "#eff6ff", blueBorder: "#bfdbfe", blueText: "#1d4ed8",
  green: "#16a34a", greenBg: "#f0fdf4", greenBdr: "#bbf7d0", greenText: "#15803d",
  red: "#dc2626", redBg: "#fef2f2", redBdr: "#fecaca", redText: "#b91c1c",
  purple: "#7c3aed", amber: "#d97706",
  headerBg: "#ffffff", spinnerTrack: "#e2e8f0",
};

function gradeColor(grade = "", t) {
  if (grade.startsWith("A")) return t.green;
  if (grade.startsWith("B")) return t.blue;
  if (grade.startsWith("C")) return t.amber;
  return t.red;
}
function atsColor(score, t) {
  if (score >= 75) return t.green;
  if (score >= 55) return t.amber;
  return t.red;
}

// ── Shared ────────────────────────────────────────────────────────────────────
function SLabel({ children, color }) {
  return <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em",
    textTransform: "uppercase", color, marginBottom: 12 }}>{children}</div>;
}

function BulletList({ items, color, icon = "›" }) {
  return <ul style={{ listStyle: "none", padding: 0 }}>
    {items.map((item, i) => (
      <li key={i} style={{ display: "flex", gap: 10, marginBottom: 10, fontSize: 14, lineHeight: 1.6 }}>
        <span style={{ color, fontWeight: 700, flexShrink: 0 }}>{icon}</span>
        <span>{item}</span>
      </li>
    ))}
  </ul>;
}

function Card({ children, style = {}, t }) {
  return <div style={{
    background: t.surface, border: `1px solid ${t.border}`,
    borderRadius: 12, padding: "20px 22px", ...style
  }}>{children}</div>;
}

// ── Fit Score Tab ─────────────────────────────────────────────────────────────
function TabFitScore({ data, t }) {
  const gc = gradeColor(data.grade, t);
  return <div>
    <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
      <div style={{
        width: 92, height: 92, borderRadius: 14, flexShrink: 0,
        background: gc + "22", border: `2px solid ${gc}55`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{ fontSize: 38, fontWeight: 800, color: gc, lineHeight: 1 }}>{data.grade}</div>
        <div style={{ fontSize: 9, color: t.dim, marginTop: 2, letterSpacing: "0.1em" }}>FIT GRADE</div>
      </div>
      <Card t={t} style={{ flex: 1, minWidth: 180 }}>
        <SLabel color={t.dim}>Overall Verdict</SLabel>
        <p style={{ fontSize: 15, lineHeight: 1.65 }}>{data.overall_fit}</p>
      </Card>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
      <Card t={t}>
        <SLabel color={t.green}>✓ Why It Works</SLabel>
        <BulletList items={data.why_it_works || []} color={t.green} icon="✓" />
      </Card>
      <Card t={t}>
        <SLabel color={t.red}>✗ Real Gaps</SLabel>
        <BulletList items={data.real_gaps || []} color={t.red} icon="✗" />
      </Card>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
      <Card t={t}>
        <SLabel color={t.purple}>⬆ Level Check</SLabel>
        <p style={{ fontSize: 14, lineHeight: 1.6 }}>{data.level_check}</p>
      </Card>
      <Card t={t}>
        <SLabel color={t.blue}>📍 Location</SLabel>
        <p style={{ fontSize: 14, lineHeight: 1.6 }}>{data.location_flag}</p>
      </Card>
    </div>

    <div style={{ background: t.blueBg, border: `1px solid ${t.blueBorder}`, borderRadius: 12, padding: "20px 22px" }}>
      <SLabel color={t.blueText}>Final Verdict</SLabel>
      <p style={{ fontSize: 15, lineHeight: 1.8 }}>{data.verdict}</p>
    </div>
  </div>;
}

// ── ATS Tab ───────────────────────────────────────────────────────────────────
function TabATS({ data, t }) {
  const score = data.ats_score || 0;
  const color = atsColor(score, t);
  const circ = 2 * Math.PI * 42;
  const matched = data.ats_matched_keywords || [];
  const missing = data.ats_missing_keywords || [];

  return <div>
    <Card t={t} style={{ marginBottom: 14 }}>
      <SLabel color={t.dim}>ATS Compatibility Score</SLabel>
      <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <div style={{ position: "relative", width: 96, height: 96, flexShrink: 0 }}>
          <svg viewBox="0 0 100 100" style={{ width: 96, height: 96, transform: "rotate(-90deg)" }}>
            <circle cx="50" cy="50" r="42" fill="none" stroke={t.border} strokeWidth="10" />
            <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="10"
              strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)}
              strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex",
            flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 22, fontWeight: 800, color }}>{score}</span>
            <span style={{ fontSize: 10, color: t.dim }}>/100</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 15, marginBottom: 6, fontWeight: 500 }}>
            {score >= 75 ? "Strong ATS pass — most keyword filters will let this through."
              : score >= 55 ? "Moderate — may be flagged by strict ATS systems."
              : "High risk of ATS rejection. Add missing keywords before applying."}
          </p>
          <p style={{ fontSize: 13, color: t.dim }}>Based on keyword density between your resume and the JD.</p>
        </div>
      </div>
    </Card>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <Card t={t}>
        <SLabel color={t.green}>✓ Keywords Found ({matched.length})</SLabel>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {matched.map(kw => (
            <span key={kw} style={{
              display: "inline-block", padding: "4px 10px", margin: 3, borderRadius: 20,
              fontSize: 12, fontWeight: 500, background: t.greenBg,
              border: `1px solid ${t.greenBdr}`, color: t.greenText
            }}>{kw}</span>
          ))}
        </div>
      </Card>
      <Card t={t}>
        <SLabel color={t.red}>✗ Keywords Missing ({missing.length})</SLabel>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {missing.map(kw => (
            <span key={kw} style={{
              display: "inline-block", padding: "4px 10px", margin: 3, borderRadius: 20,
              fontSize: 12, fontWeight: 500, background: t.redBg,
              border: `1px solid ${t.redBdr}`, color: t.redText
            }}>{kw}</span>
          ))}
        </div>
        {missing.length > 0 && (
          <p style={{ fontSize: 13, color: t.dim, marginTop: 10, lineHeight: 1.6 }}>
            Weave these into your resume naturally where truthful.
          </p>
        )}
      </Card>
    </div>
  </div>;
}

// ── Learn Tab ─────────────────────────────────────────────────────────────────
function TabLearn({ data, videos, t }) {
  const topics = data.learning_topics || [];
  if (!topics.length) return <Card t={t}><p style={{ color: t.muted }}>No learning topics — strong overall match.</p></Card>;

  return <div>
    {topics.map((topic, i) => (
      <div key={i} style={{ marginBottom: 24 }}>
        <Card t={t} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              background: t.blueBg, border: `1px solid ${t.blueBorder}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, color: t.blue
            }}>{i + 1}</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{topic.topic}</div>
              <div style={{ fontSize: 13, color: t.muted, lineHeight: 1.6 }}>{topic.reason}</div>
            </div>
          </div>
        </Card>

        {videos[topic.topic]?.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {videos[topic.topic].map(v => (
              <a key={v.id} href={v.url} target="_blank" rel="noopener noreferrer"
                style={{ textDecoration: "none", display: "block", background: t.surface,
                  border: `1px solid ${t.border}`, borderRadius: 10, overflow: "hidden" }}>
                <div style={{ position: "relative" }}>
                  <img src={v.thumbnail} alt={v.title}
                    style={{ width: "100%", height: 88, objectFit: "cover", display: "block" }} />
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,0,0,0.9)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, color: "#fff", paddingLeft: 2 }}>▶</div>
                  </div>
                </div>
                <div style={{ padding: "10px 12px" }}>
                  <div style={{ fontSize: 12, color: t.text, lineHeight: 1.4, fontWeight: 500, marginBottom: 3,
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {v.title}
                  </div>
                  <div style={{ fontSize: 11, color: t.dim }}>{v.channel}</div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div style={{ padding: "12px 16px", background: t.surface2, borderRadius: 8,
            fontSize: 13, color: t.dim, border: `1px solid ${t.border}` }}>
            Search YouTube for: <span style={{ color: t.blue }}>"{topic.youtube_query}"</span>
          </div>
        )}
      </div>
    ))}
  </div>;
}

// ── Interview Tab ─────────────────────────────────────────────────────────────
// ── PrepRight Interview Tab ───────────────────────────────────────────────────
const PREP_SECTIONS = [
  { key: "decode",    label: "Decode the Role",    icon: "🔍", endpoint: "/api/prep/decode"    },
  { key: "fit",       label: "Fit Scoring",        icon: "📊", endpoint: "/api/prep/fit"       },
  { key: "knowledge", label: "Knowledge Domains",  icon: "🧠", endpoint: "/api/prep/knowledge" },
  { key: "stories",   label: "CERT Stories",       icon: "📖", endpoint: "/api/prep/stories"   },
  { key: "mockqa",    label: "Mock Q&A",           icon: "🎭", endpoint: "/api/prep/mockqa"    },
  { key: "questions", label: "Ask Them",           icon: "❓", endpoint: "/api/prep/questions" },
  { key: "hard",      label: "Hard Questions",     icon: "🔥", endpoint: "/api/prep/hard"      },
  { key: "refcard",   label: "Reference Card",     icon: "🃏", endpoint: "/api/prep/refcard"   },
];

function SectionShell({ sec, data, loading, error, onGenerate, children, t }) {
  const isLoading = loading === true;
  const done = !!data && !isLoading;
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`,
      borderRadius: 12, overflow: "hidden", marginBottom: 14 }}>
      {/* Header row */}
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center",
        justifyContent: "space-between", borderBottom: done ? `1px solid ${t.border}` : "none",
        background: done ? t.surface2 : t.surface }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>{sec.icon}</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: t.text }}>{sec.label}</span>
          {done && <span style={{ fontSize: 11, color: t.green, fontWeight: 700,
            background: t.greenBg, border: `1px solid ${t.greenBdr}`,
            padding: "2px 8px", borderRadius: 10 }}>✓ Done</span>}
        </div>
        <button type="button" onClick={onGenerate} disabled={isLoading} style={{
          padding: "7px 18px",
          background: isLoading ? t.surface2 : done
            ? t.surface2 : `linear-gradient(135deg, ${t.blueDim}, ${t.blue})`,
          color: isLoading ? t.dim : done ? t.muted : "#fff",
          border: done ? `1px solid ${t.border}` : "none",
          borderRadius: 7, cursor: isLoading ? "not-allowed" : "pointer",
          fontSize: 12, fontWeight: 600, fontFamily: "inherit",
          boxShadow: (!isLoading && !done) ? "0 2px 12px rgba(59,130,246,0.3)" : "none"
        }}>
          {isLoading ? "Generating..." : done ? "Regenerate" : "Generate"}
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{ padding: "28px", textAlign: "center" }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%",
            border: `3px solid ${t.border2}`, borderTopColor: t.blue,
            animation: "spin 0.7s linear infinite", margin: "0 auto 10px" }} />
          <p style={{ fontSize: 13, color: t.dim }}>Generating {sec.label}...</p>
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div style={{ padding: "14px 20px", background: t.redBg,
          color: t.redText, fontSize: 13 }}>⚠ {error}</div>
      )}

      {/* Content */}
      {done && <div style={{ padding: "20px 22px" }}>{children}</div>}

      {/* Not yet generated */}
      {!done && !isLoading && !error && (
        <div style={{ padding: "16px 20px" }}>
          <p style={{ fontSize: 13, color: t.dim, lineHeight: 1.6 }}>
            {sec.key === "decode"    && "Decode what they're really hiring for, hidden priorities, and culture signals."}
            {sec.key === "fit"       && "Every JD requirement scored 1–10 with full gap briefings for anything ≤7."}
            {sec.key === "knowledge" && "4–5 domains to master with key concepts, data points, and exact opening frames."}
            {sec.key === "stories"   && "CERT story cards built from your actual experience mapped to this role."}
            {sec.key === "mockqa"    && "Tell me about yourself + behavioral + technical questions with full model answers."}
            {sec.key === "questions" && "6 smart questions to ask interviewers that signal strategic thinking."}
            {sec.key === "hard"      && "The 5 questions you hope won't come up. They will. Here's how to handle them."}
            {sec.key === "refcard"   && "One-page card to read 5 minutes before walking in. Walk in ready."}
          </p>
        </div>
      )}
    </div>
  );
}

function InfoBlock({ label, color, children, style: extraStyle = {} }) {
  return (
    <div style={{ marginBottom: 14, ...extraStyle }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
        textTransform: "uppercase", color, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 14, lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

function Accordion({ items, renderHeader, renderBody, t, sectionKey }) {
  const [open, setOpen] = useState(null);
  // Reset when section changes
  useEffect(() => { setOpen(null); }, [sectionKey]);
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: 8, border: `1px solid ${open === i ? t.blueDim : t.border}`,
          borderRadius: 10, overflow: "hidden" }}>
          <button type="button" onClick={() => setOpen(open === i ? null : i)} style={{
            width: "100%", padding: "13px 16px", cursor: "pointer",
            background: open === i ? t.surface2 : t.surface,
            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            gap: 12, border: "none", textAlign: "left", fontFamily: "inherit" }}>
            <div style={{ flex: 1, color: t.text }}>{renderHeader(item, i)}</div>
            <span style={{ color: t.dim, fontSize: 18, flexShrink: 0, lineHeight: 1 }}>
              {open === i ? "−" : "+"}
            </span>
          </button>
          {open === i && (
            <div style={{ padding: "16px 16px", background: t.blueBg, borderTop: `1px solid ${t.blueBorder}` }}>
              {renderBody(item, i)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function scoreColor(s, t) {
  if (s >= 8) return t.green;
  if (s >= 6) return t.amber;
  return t.red;
}

function TabInterview({ resume, jobDescription, t,
  sectionData, setSectionData, sectionLoading, setSectionLoading, sectionError, setSectionError }) {

  const generate = async (sec) => {
    setSectionLoading(p => ({ ...p, [sec.key]: true }));
    setSectionError(p =>   ({ ...p, [sec.key]: null }));
    try {
      const res = await fetch(sec.endpoint, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobDescription })
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSectionData(p => ({ ...p, [sec.key]: data }));
    } catch (e) {
      setSectionError(p => ({ ...p, [sec.key]: e.message }));
    } finally {
      setSectionLoading(p => ({ ...p, [sec.key]: false }));
    }
  };

  const renderContent = (sec) => {
    const d = sectionData[sec.key];
    if (!d) return null;

    // ── Decode ──────────────────────────────────────────────────────────────
    if (sec.key === "decode") return (
      <div>
        <InfoBlock label="What They're Really Hiring For" color={t.blue}>{d.what_they_really_want}</InfoBlock>
        <InfoBlock label="What Success Looks Like in 90 Days" color={t.green}>{d.success_looks_like}</InfoBlock>
        <InfoBlock label="Hidden Priorities" color={t.purple}>
          {(d.hidden_priorities || []).map((p, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <span style={{ color: t.purple, fontWeight: 700 }}>›</span><span>{p}</span>
            </div>
          ))}
        </InfoBlock>
        {d.culture_signals?.length > 0 && (
          <InfoBlock label="Culture Signals" color={t.amber}>
            {d.culture_signals.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <span style={{ color: t.amber, fontWeight: 700 }}>›</span><span>{s}</span>
              </div>
            ))}
          </InfoBlock>
        )}
      </div>
    );

    // ── Fit Scoring ──────────────────────────────────────────────────────────
    if (sec.key === "fit") return (
      <div>
        <p style={{ fontSize: 13, color: t.muted, marginBottom: 14, lineHeight: 1.6 }}>
          Requirements scored 1–10. Anything ≤7 has a full gap briefing.
        </p>
        <Accordion t={t} sectionKey="fit" items={d.scores || []}
          renderHeader={(item) => (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                background: scoreColor(item.score, t) + "22",
                border: `2px solid ${scoreColor(item.score, t)}44`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 800, color: scoreColor(item.score, t) }}>{item.score}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{item.requirement}</div>
                <div style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>{item.evidence}</div>
              </div>
            </div>
          )}
          renderBody={(item) => item.gap_briefing ? (
            <div>
              <InfoBlock label="⚠ Blunt Assessment"       color={t.red}>   {item.gap_briefing.blunt_assessment}</InfoBlock>
              <InfoBlock label="Prep Plan (1–2 weeks)"    color={t.amber}> {item.gap_briefing.prep_plan}</InfoBlock>
              <InfoBlock label="Bridge Story"             color={t.blue}>  {item.gap_briefing.bridge_story}</InfoBlock>
              <InfoBlock label="💣 Landmine Question"     color={t.red}>   "{item.gap_briefing.landmine_question}"</InfoBlock>
              <InfoBlock label="Model Answer"             color={t.green}> {item.gap_briefing.model_answer}</InfoBlock>
            </div>
          ) : <p style={{ fontSize: 14, color: t.green }}>✓ Strong match — no gap briefing needed.</p>}
        />
      </div>
    );

    // ── Knowledge Domains ────────────────────────────────────────────────────
    if (sec.key === "knowledge") return (
      <Accordion t={t} sectionKey="knowledge" items={d.domains || []}
        renderHeader={(item) => (
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{item.domain}</div>
            <div style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>{item.why_it_matters}</div>
          </div>
        )}
        renderBody={(item) => (
          <div>
            <InfoBlock label="Key Concepts" color={t.blue}>
              {(item.key_concepts || []).map((c, i) => <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}><span style={{ color: t.blue }}>›</span><span>{c}</span></div>)}
            </InfoBlock>
            <InfoBlock label="Data Points to Cite" color={t.purple}>
              {(item.data_points || []).map((dp, i) => <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}><span style={{ color: t.purple }}>›</span><span>{dp}</span></div>)}
            </InfoBlock>
            <InfoBlock label="Opening Frame" color={t.green}>
              <span style={{ fontStyle: "italic" }}>"{item.opening_frame}"</span>
            </InfoBlock>
          </div>
        )}
      />
    );

    // ── CERT Stories ─────────────────────────────────────────────────────────
    if (sec.key === "stories") return (
      <div>
        <p style={{ fontSize: 13, color: t.muted, marginBottom: 14, lineHeight: 1.6 }}>
          Context → Execution → Result → Transfer. Built from your actual background only.
        </p>
        <Accordion t={t} sectionKey="stories" items={d.stories || []}
          renderHeader={(item) => <div style={{ fontSize: 14, fontWeight: 600 }}>{item.title}</div>}
          renderBody={(item) => (
            <div>
              <InfoBlock label="C — Context"   color={t.blue}>  {item.context}</InfoBlock>
              <InfoBlock label="E — Execution" color={t.amber}> {item.execution}</InfoBlock>
              <InfoBlock label="R — Result"    color={t.green}> {item.result}</InfoBlock>
              <InfoBlock label="T — Transfer"  color={t.purple}>{item.transfer}</InfoBlock>
            </div>
          )}
        />
      </div>
    );

    // ── Mock Q&A ─────────────────────────────────────────────────────────────
    if (sec.key === "mockqa") {
      const allQ = [
        ...(d.behavioral || []).map(q => ({ ...q, type: "Behavioral" })),
        ...(d.technical  || []).map(q => ({ ...q, type: "Technical"  })),
      ];
      return (
        <div>
          {d.tell_me_about_yourself && (
            <div style={{ background: t.blueBg, border: `1px solid ${t.blueBorder}`,
              borderRadius: 10, padding: "18px 20px", marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
                textTransform: "uppercase", color: t.blueText, marginBottom: 10 }}>
                Tell Me About Yourself — Model Answer
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.8, fontStyle: "italic" }}>"{d.tell_me_about_yourself}"</p>
            </div>
          )}
          <Accordion t={t} sectionKey="mockqa" items={allQ}
            renderHeader={(item) => (
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                  color: item.type === "Behavioral" ? t.purple : t.amber, display: "block", marginBottom: 4 }}>{item.type}</span>
                <div style={{ fontSize: 14, fontWeight: 500 }}>"{item.question}"</div>
              </div>
            )}
            renderBody={(item) => <InfoBlock label="Model Answer" color={t.green}>{item.model_answer}</InfoBlock>}
          />
        </div>
      );
    }

    // ── Questions to Ask ─────────────────────────────────────────────────────
    if (sec.key === "questions") return (
      <div>
        {(d.questions || []).map((q, i) => (
          <div key={i} style={{ background: t.surface2, border: `1px solid ${t.border}`,
            borderRadius: 10, padding: "16px 18px", marginBottom: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>"{q.question}"</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "baseline" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: t.blue }}>Why ask this:</span>
              <span style={{ fontSize: 13, color: t.muted }}>{q.why}</span>
            </div>
            {q.layer && (
              <span style={{ fontSize: 11, color: t.dim, marginTop: 6, display: "block" }}>Best for: {q.layer}</span>
            )}
          </div>
        ))}
      </div>
    );

    // ── Hard Questions ───────────────────────────────────────────────────────
    if (sec.key === "hard") return (
      <div>
        <p style={{ fontSize: 13, color: t.muted, marginBottom: 14, lineHeight: 1.6 }}>
          The questions you hope won't come up. They will.
        </p>
        <Accordion t={t} sectionKey="hard" items={d.hard_questions || []}
          renderHeader={(item) => <div style={{ fontSize: 14, fontWeight: 500 }}>"{item.question}"</div>}
          renderBody={(item) => (
            <div>
              {item.why_they_ask && <InfoBlock label="What They're Really Testing" color={t.amber}>{item.why_they_ask}</InfoBlock>}
              <InfoBlock label="Model Answer" color={t.green}>{item.model_answer}</InfoBlock>
            </div>
          )}
        />
      </div>
    );

    // ── Reference Card ───────────────────────────────────────────────────────
    if (sec.key === "refcard") return (
      <div style={{ background: t.blueBg, border: `2px solid ${t.blue}`, borderRadius: 12, padding: "24px 26px" }}>
        <div style={{ textAlign: "center", marginBottom: 20, paddingBottom: 16,
          borderBottom: `1px solid ${t.blueBorder}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em",
            textTransform: "uppercase", color: t.blueText, marginBottom: 4 }}>
            Interview Day Reference Card
          </div>
          <div style={{ fontSize: 11, color: t.dim }}>Read this 5 minutes before you walk in.</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 16 }}>
          <div>
            <InfoBlock label="My Headline" color={t.blueText}>
              <strong>{d.my_headline}</strong>
            </InfoBlock>
            <InfoBlock label="Gap to Own" color={t.amber}>{d.gap_to_own}</InfoBlock>
          </div>
          <div>
            <InfoBlock label="Top 3 Strengths" color={t.green}>
              {(d.top_3_strengths || []).map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5 }}>
                  <span style={{ color: t.green, fontWeight: 700 }}>✓</span><span>{s}</span>
                </div>
              ))}
            </InfoBlock>
          </div>
        </div>
        {d.three_things_to_remember?.length > 0 && (
          <InfoBlock label="3 Things to Remember" color={t.purple}>
            {d.three_things_to_remember.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5 }}>
                <span style={{ color: t.purple, fontWeight: 700 }}>{i + 1}.</span><span>{s}</span>
              </div>
            ))}
          </InfoBlock>
        )}
        <div style={{ borderTop: `1px solid ${t.blueBorder}`, paddingTop: 16, display: "grid",
          gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <InfoBlock label="Opening Line" color={t.blueText}>
            <em>"{d.opening_line}"</em>
          </InfoBlock>
          <InfoBlock label="Closing Line" color={t.blueText}>
            <em>"{d.closing_line}"</em>
          </InfoBlock>
        </div>
        <InfoBlock label="What I Want Them to Remember" color={t.dim} style={{ marginTop: 12 }}>
          {d.my_ask}
        </InfoBlock>
      </div>
    );

    return null;
  };

  return (
    <div>
      <p style={{ fontSize: 13, color: t.muted, marginBottom: 20, lineHeight: 1.6 }}>
        Generate each section independently — start with what you need most. Each takes 10–15 seconds.
      </p>
      {PREP_SECTIONS.map(sec => (
        <SectionShell key={sec.key} sec={sec} t={t}
          data={sectionData[sec.key]}
          loading={sectionLoading[sec.key]}
          error={sectionError[sec.key]}
          onGenerate={() => generate(sec)}>
          {renderContent(sec)}
        </SectionShell>
      ))}
    </div>
  );
}
// ── Cover Letter Tab ──────────────────────────────────────────────────────────
function TabCoverLetter({ resume, jobDescription, analysis, t, letter, setLetter, loading, setLoading }) {
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setLoading(true); setLetter("");
    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobDescription, analysis })
      });
      const d = await res.json();
      setLetter(d.letter || "");
    } catch { setLetter("Failed to generate. Please try again."); }
    finally { setLoading(false); }
  };

  const copy = () => { navigator.clipboard.writeText(letter); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  if (loading) return <Card t={t} style={{ textAlign: "center", padding: 48 }}>
    <div style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${t.border2}`,
      borderTopColor: t.blue, animation: "spin 0.7s linear infinite", margin: "0 auto 14px" }} />
    <p style={{ color: t.muted, fontSize: 14 }}>Writing your cover letter...</p>
  </Card>;

  if (!letter) return <Card t={t} style={{ textAlign: "center", padding: "44px 28px" }}>
    <div style={{ fontSize: 36, marginBottom: 14 }}>✉️</div>
    <h3 style={{ fontSize: 20, marginBottom: 10 }}>Cover Letter Generator</h3>
    <p style={{ color: t.muted, fontSize: 14, lineHeight: 1.7, maxWidth: 460, margin: "0 auto 28px" }}>
      Written from your actual experience. No fluff. Opens with your strongest hook.
    </p>
    <button onClick={generate} style={{
      padding: "12px 36px", background: `linear-gradient(135deg, ${t.blueDim}, ${t.blue})`,
      color: "#fff", border: "none", borderRadius: 8, cursor: "pointer",
      fontSize: 14, fontWeight: 600, boxShadow: "0 4px 20px rgba(59,130,246,0.3)"
    }}>Generate Cover Letter</button>
  </Card>;

  return <>
    <Card t={t} style={{ fontFamily: "Georgia, serif", fontSize: 15, lineHeight: 1.9,
      whiteSpace: "pre-wrap", marginBottom: 14 }}>{letter}</Card>
    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
      <button onClick={copy} style={{
        padding: "9px 20px", background: t.surface2, border: `1px solid ${t.border}`,
        borderRadius: 7, color: copied ? t.green : t.muted, cursor: "pointer", fontSize: 13
      }}>{copied ? "✓ Copied!" : "Copy to Clipboard"}</button>
      <button onClick={generate} style={{
        padding: "9px 20px", background: `linear-gradient(135deg, ${t.blueDim}, ${t.blue})`,
        color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 13, fontWeight: 600
      }}>Regenerate</button>
    </div>
  </>;
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [isDark, setIsDark] = useState(() => (localStorage.getItem("jfa-theme") || "dark") === "dark");
  const t = isDark ? DARK : LIGHT;

  // ── localStorage helpers ──────────────────────────────────────────────────
  const ls = {
    get: (key, fallback = null) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
    set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },
    del: (key) => { try { localStorage.removeItem(key); } catch {} },
  };

  const [resume, setResume]     = useState(() => ls.get("jfa-resume", ""));
  const [jd, setJd]             = useState(() => ls.get("jfa-jd", ""));
  const [analysis, setAnalysis] = useState(() => ls.get("jfa-analysis", null));
  const [videos, setVideos]     = useState(() => ls.get("jfa-videos", {}));
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [activeTab, setActiveTab] = useState(() => ls.get("jfa-tab", 0));

  // ── Lifted state: Interview Prep (persists across tab switches) ───────────
  const [prepSectionData,    setPrepSectionData]    = useState(() => ls.get("jfa-prep", {}));
  const [prepSectionLoading, setPrepSectionLoading] = useState({});
  const [prepSectionError,   setPrepSectionError]   = useState({});

  // ── Lifted state: Cover Letter (persists across tab switches) ────────────
  const [coverLetter, setCoverLetter] = useState(() => ls.get("jfa-cover", ""));
  const [coverLoading, setCoverLoading] = useState(false);

  // ── Persist to localStorage on every change ───────────────────────────────
  useEffect(() => { ls.set("jfa-resume",   resume);       }, [resume]);
  useEffect(() => { ls.set("jfa-jd",       jd);           }, [jd]);
  useEffect(() => { ls.set("jfa-analysis", analysis);     }, [analysis]);
  useEffect(() => { ls.set("jfa-videos",   videos);       }, [videos]);
  useEffect(() => { ls.set("jfa-tab",      activeTab);    }, [activeTab]);
  useEffect(() => { ls.set("jfa-prep",     prepSectionData); }, [prepSectionData]);
  useEffect(() => { ls.set("jfa-cover",    coverLetter);  }, [coverLetter]);

  useEffect(() => {
    document.body.style.background = t.bg;
    document.body.style.color = t.text;
    localStorage.setItem("jfa-theme", isDark ? "dark" : "light");
  }, [isDark, t]);

  const analyze = useCallback(async () => {
    if (!resume.trim() || !jd.trim()) return;
    setLoading(true); setAnalysis(null); setVideos({}); setError(null); setActiveTab(0);
    setPrepSectionData({}); setPrepSectionLoading({}); setPrepSectionError({});
    setCoverLetter(""); setCoverLoading(false);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobDescription: jd })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAnalysis(data);
      if (data.learning_topics?.length > 0) {
        fetch("/api/youtube", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topics: data.learning_topics })
        }).then(r => r.json()).then(vd => setVideos(vd.videos || {})).catch(() => {});
      }
    } catch { setError("Analysis failed. Make sure the backend is running and ANTHROPIC_API_KEY is set."); }
    finally { setLoading(false); }
  }, [resume, jd]);

  const reset = () => {
    setAnalysis(null); setVideos({}); setError(null); setJd(""); setResume(""); setActiveTab(0);
    setPrepSectionData({}); setPrepSectionLoading({}); setPrepSectionError({});
    setCoverLetter(""); setCoverLoading(false);
    ["jfa-resume","jfa-jd","jfa-analysis","jfa-videos","jfa-tab","jfa-prep","jfa-cover"].forEach(k => ls.del(k));
  };
  const canAnalyze = resume.trim().length > 50 && jd.trim().length > 100;

  const TOPBAR = {
    background: t.headerBg, borderBottom: `1px solid ${t.border}`,
    padding: "0 32px", height: 58, display: "flex", alignItems: "center",
    justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100,
    fontFamily: "'Inter', system-ui, sans-serif"
  };

  // Loading
  if (loading) return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text,
      fontFamily: "'Inter', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <div style={TOPBAR}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: t.blue }}>PrepRight</span>
          <span style={{ color: t.border2 }}>|</span>
          <span style={{ fontSize: 16, fontWeight: 700 }}>Job Fit Analyzer</span>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid ${t.spinnerTrack}`,
          borderTopColor: t.blue, animation: "spin 0.7s linear infinite" }} />
        <div style={{ fontSize: 16, color: t.muted, fontWeight: 500 }}>Analyzing your fit...</div>
        <div style={{ fontSize: 13, color: t.dim, maxWidth: 320, textAlign: "center", lineHeight: 1.6 }}>
          Scoring ATS keywords, identifying gaps, preparing interview questions.
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // Results
  if (analysis) return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text,
      fontFamily: "'Inter', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={TOPBAR}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: t.blue }}>PrepRight</span>
          <span style={{ color: t.border2 }}>|</span>
          <span style={{ fontSize: 16, fontWeight: 700 }}>Job Fit Analyzer</span>
          <span style={{ color: t.border2 }}>|</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: gradeColor(analysis.grade, t) }}>{analysis.grade}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={reset} style={{ padding: "8px 18px", background: t.surface2,
            border: `1px solid ${t.border}`, borderRadius: 7, color: t.muted,
            cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>← New Analysis</button>
          <button onClick={() => setIsDark(d => !d)} style={{ width: 36, height: 36, borderRadius: 8,
            background: t.surface2, border: `1px solid ${t.border}`, cursor: "pointer", fontSize: 17 }}>
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: t.headerBg, borderBottom: `1px solid ${t.border}`,
        padding: "0 32px", display: "flex", gap: 2, overflowX: "auto" }}>
        {TABS.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)} style={{
            padding: "13px 16px", background: "none", border: "none",
            borderBottom: `2px solid ${activeTab === i ? t.blue : "transparent"}`,
            cursor: "pointer", fontSize: 13, fontWeight: activeTab === i ? 600 : 400,
            color: activeTab === i ? t.blue : t.dim,
            fontFamily: "'Inter', system-ui, sans-serif", whiteSpace: "nowrap", marginBottom: -1
          }}>{tab}</button>
        ))}
      </div>

      {/* Content — all tabs always mounted, hidden with display:none to preserve state */}
      <div style={{ flex: 1, width: "100%", maxWidth: 1200, margin: "0 auto", padding: "28px 32px", boxSizing: "border-box" }}>
        <div style={{ display: activeTab === 0 ? "block" : "none" }}><TabFitScore data={analysis} t={t} /></div>
        <div style={{ display: activeTab === 1 ? "block" : "none" }}><TabATS data={analysis} t={t} /></div>
        <div style={{ display: activeTab === 2 ? "block" : "none" }}><TabLearn data={analysis} videos={videos} t={t} /></div>
        <div style={{ display: activeTab === 3 ? "block" : "none" }}>
          <TabInterview resume={resume} jobDescription={jd} t={t}
            sectionData={prepSectionData} setSectionData={setPrepSectionData}
            sectionLoading={prepSectionLoading} setSectionLoading={setPrepSectionLoading}
            sectionError={prepSectionError} setSectionError={setPrepSectionError} />
        </div>
        <div style={{ display: activeTab === 4 ? "block" : "none" }}>
          <TabCoverLetter resume={resume} jobDescription={jd} analysis={analysis} t={t}
            letter={coverLetter} setLetter={setCoverLetter}
            loading={coverLoading} setLoading={setCoverLoading} />
        </div>
      </div>
    </div>
  );

  // Input Screen
  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text,
      fontFamily: "'Inter', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } * { box-sizing: border-box; }`}</style>
      <div style={TOPBAR}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: t.blue }}>PrepRight</span>
          <span style={{ color: t.border2 }}>|</span>
          <span style={{ fontSize: 16, fontWeight: 700 }}>Job Fit Analyzer</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: t.dim }}>Honest AI analysis. No fluff.</span>
          <button onClick={() => setIsDark(d => !d)} style={{ width: 36, height: 36, borderRadius: 8,
            background: t.surface2, border: `1px solid ${t.border}`, cursor: "pointer", fontSize: 17 }}>
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, width: "100%", maxWidth: 1200, margin: "0 auto", padding: "28px 32px", boxSizing: "border-box" }}>
        {error && (
          <div style={{ background: t.redBg, border: `1px solid ${t.redBdr}`, borderRadius: 8,
            padding: "12px 16px", color: t.redText, fontSize: 14, marginBottom: 18 }}>{error}</div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 18 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: t.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Your Resume
              </span>
              <button onClick={() => setResume(SAMPLE_RESUME)} style={{
                background: "none", border: "none", color: t.blue, cursor: "pointer",
                fontSize: 12, textDecoration: "underline", fontFamily: "inherit" }}>
                Load sample
              </button>
            </div>
            <textarea value={resume} onChange={e => setResume(e.target.value)}
              placeholder="Paste your resume here — summary, experience, education, skills..."
              style={{
                width: "100%", height: "calc(100vh - 290px)", minHeight: 300,
                padding: "14px 16px", background: t.surface, border: `1px solid ${t.border}`,
                borderRadius: 10, color: t.text, outline: "none", resize: "vertical",
                fontSize: 13.5, lineHeight: 1.7, fontFamily: "'Inter', system-ui, sans-serif"
              }} />
          </div>
          <div>
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: t.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Job Description
              </span>
            </div>
            <textarea value={jd} onChange={e => setJd(e.target.value)}
              placeholder="Paste the full job description — title, responsibilities, requirements, everything..."
              style={{
                width: "100%", height: "calc(100vh - 290px)", minHeight: 300,
                padding: "14px 16px", background: t.surface, border: `1px solid ${t.border}`,
                borderRadius: 10, color: t.text, outline: "none", resize: "vertical",
                fontSize: 13.5, lineHeight: 1.7, fontFamily: "'Inter', system-ui, sans-serif"
              }} />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 12, marginBottom: 40 }}>
          <span style={{ fontSize: 13, color: t.dim }}>
            {canAnalyze ? "Ready — click Analyze Fit to get your full breakdown" : "Paste your resume and a job description to begin"}
          </span>
          <button onClick={analyze} disabled={!canAnalyze} style={{
            padding: "12px 36px",
            background: canAnalyze ? `linear-gradient(135deg, ${t.blueDim}, ${t.blue})` : t.surface2,
            color: canAnalyze ? "#fff" : t.dim, border: "none", borderRadius: 8,
            cursor: canAnalyze ? "pointer" : "not-allowed", fontSize: 14, fontWeight: 600,
            fontFamily: "'Inter', system-ui, sans-serif",
            boxShadow: canAnalyze ? "0 4px 20px rgba(59,130,246,0.3)" : "none"
          }}>Analyze Fit →</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { icon: "🎯", title: "Fit Score",      desc: "Letter grade + honest strengths and gaps" },
            { icon: "🤖", title: "ATS Check",      desc: "Keyword match score, found vs missing" },
            { icon: "📚", title: "What to Learn",  desc: "Learning plan with YouTube tutorials" },
            { icon: "💬", title: "Interview Prep", desc: "Gap-based questions + how to answer them" },
          ].map(f => (
            <div key={f.title} style={{ background: t.surface, border: `1px solid ${t.border}`,
              borderRadius: 12, padding: "18px 16px" }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: t.dim, lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}