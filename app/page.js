"use client";

import React, { useState, useMemo } from "react";
import {
  PALETTE,
  SECTIONS,
  STORY,
  CONTEXT_HINTS,
  SCORED,
  totalQuestions,
  keyScore,
  placeOnJourney,
  postureDirection,
} from "../lib/diagnostic";
import { buildPrompt } from "../lib/prompt";
import {
  FontLink,
  Eyebrow,
  ProgressBar,
  NavRow,
  LensBars,
  PhaseStrip,
  btnStyle,
  hexA,
  shortQ,
} from "./components/ui";

function PrintStyles() {
  return (
    <style>{`
      .print-header { display: none; }
      @media print {
        /* Force backgrounds and colours to actually print */
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        /* Hide interactive chrome from the PDF */
        .no-print { display: none !important; }
        /* Show the deliverable header */
        .print-header {
          display: flex !important;
          justify-content: space-between;
          align-items: baseline;
          border-bottom: 2px solid #1A1A17;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        /* Tidy page margins and avoid awkward breaks */
        @page { margin: 18mm; }
        .read-body { break-inside: avoid; }
      }
    `}</style>
  );
}

export default function Page() {
  const [step, setStep] = useState("intro");
  const [answers, setAnswers] = useState({});
  // stories: { win: [str, ...], fail: [str, ...] } so users can add more than one.
  const [stories, setStories] = useState({ win: [""], fail: [""] });
  const [extraContext, setExtraContext] = useState("");
  const [otherText, setOtherText] = useState({}); // { [questionId]: "their words" }
  const [orgName, setOrgName] = useState("");
  const [candid] = useState(false);
  const [read, setRead] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sectionIndex = typeof step === "number" ? step : null;
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / totalQuestions) * 100);

  const scoreMap = useMemo(() => {
    const m = {};
    SCORED.forEach((k) => (m[k] = keyScore(k, answers)));
    return m;
  }, [answers]);

  const journey = useMemo(() => placeOnJourney(scoreMap, answers), [scoreMap, answers]);

  const font = {
    display: "'Bebas Neue', Impact, sans-serif",
    body: "'Space Grotesk', system-ui, sans-serif",
    mono: "'Space Mono', monospace",
  };

  function selectOption(qId, optIdx) {
    setAnswers((a) => ({ ...a, [qId]: optIdx }));
  }
  function sectionComplete(section) {
    return section.questions.every((q) => answers[q.id] != null);
  }

  function setStoryAt(kind, i, val) {
    setStories((p) => {
      const arr = [...(p[kind] || [""])];
      arr[i] = val;
      return { ...p, [kind]: arr };
    });
  }
  function addStory(kind) {
    setStories((p) => ({ ...p, [kind]: [...(p[kind] || []), ""] }));
  }
  function removeStory(kind, i) {
    setStories((p) => {
      const arr = [...(p[kind] || [])];
      arr.splice(i, 1);
      return { ...p, [kind]: arr.length ? arr : [""] };
    });
  }

  async function generateRead() {
    setLoading(true);
    setError(null);
    setStep("read");
    const { system, user } = buildPrompt({ answers, stories, extraContext, otherText, orgName, candid });
    try {
      const res = await fetch("/api/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system, user }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Read failed");
      setRead(data.read);
    } catch (e) {
      setError(e.message || "The read didn't generate. Give it another go.");
    } finally {
      setLoading(false);
    }
  }

  const shell = { minHeight: "100vh", background: PALETTE.ground, color: PALETTE.ink, fontFamily: font.body };
  const wrap = { maxWidth: 720, margin: "0 auto", padding: "32px 24px 80px" };

  // INTRO
  if (step === "intro") {
    return (
      <div style={shell}>
        <FontLink />
        <div style={wrap}>
          <Eyebrow>AI Fast Start</Eyebrow>
          <h1 style={{ fontFamily: font.display, fontSize: 72, lineHeight: 0.92, margin: "12px 0 0", letterSpacing: 0.5 }}>
            PHASE 0:<br />THE DIAGNOSTIC
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.55, maxWidth: 580, marginTop: 20 }}>
            Most AI strategies get too big too quickly. They jump to transformation and agents before
            anyone's worked out where AI actually helps, where it's theatre, and where it changes the
            shape of the business.
          </p>
          <p style={{ fontSize: 18, lineHeight: 1.55, maxWidth: 580, marginTop: 14 }}>
            You can't make those calls from guesswork. You earn them by getting on the field and
            banking real wins. This is the read that tells you where to start.
          </p>
          <div style={{ marginTop: 18, maxWidth: 580 }}>
            <p style={{ fontSize: 15, color: PALETTE.ink, margin: "0 0 6px", fontWeight: 500 }}>
              What you get, in about ten minutes:
            </p>
            <p style={{ fontSize: 15, color: PALETTE.ash, margin: 0, lineHeight: 1.55 }}>
              An honest read on where you stand, the one thing nobody's said out loud, and the first
              win worth chasing. It's a baseline to start from, not a score or a verdict. Mostly taps,
              and "don't know" is always a fair answer.
            </p>
          </div>
          <div style={{ marginTop: 26 }}>
            <input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Business name"
              style={{
                fontFamily: font.body,
                fontSize: 15,
                padding: "12px 14px",
                border: `1px solid ${PALETTE.line}`,
                borderRadius: 8,
                background: PALETTE.chalk,
                color: PALETTE.ink,
                minWidth: 260,
                outline: "none",
              }}
            />
          </div>
          <button
            onClick={() => orgName.trim() && setStep(0)}
            disabled={!orgName.trim()}
            style={{
              marginTop: 26,
              fontFamily: font.display,
              fontSize: 24,
              letterSpacing: 1,
              padding: "14px 32px",
              background: orgName.trim() ? PALETTE.ink : "#D8D4C9",
              color: orgName.trim() ? PALETTE.ground : "#9A978E",
              border: "none",
              borderRadius: 8,
              cursor: orgName.trim() ? "pointer" : "not-allowed",
            }}
          >
            START THE READ
          </button>
        </div>
      </div>
    );
  }

  // SECTIONS
  if (sectionIndex != null && sectionIndex < SECTIONS.length) {
    const section = SECTIONS[sectionIndex];
    const isLast = sectionIndex === SECTIONS.length - 1;
    return (
      <div style={shell}>
        <FontLink />
        <div style={wrap}>
          <ProgressBar progress={progress} />
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 24 }}>
            <span style={{ fontFamily: font.mono, fontSize: 14, color: section.accent }}>{section.n}</span>
            <h2 style={{ fontFamily: font.display, fontSize: 42, margin: 0, letterSpacing: 0.5 }}>
              {section.label.toUpperCase()}
            </h2>
          </div>
          <div
            style={{
              marginTop: 12,
              padding: "12px 16px",
              borderLeft: `3px solid ${section.accent}`,
              background: hexA(section.accent, 0.06),
              borderRadius: "0 8px 8px 0",
            }}
          >
            <p style={{ fontSize: 15, lineHeight: 1.5, margin: 0, color: PALETTE.ink }}>{section.framing}</p>
          </div>
          <div style={{ marginTop: 22 }}>
            {section.questions.map((q) => (
              <div key={q.id} style={{ marginBottom: 26 }}>
                <p style={{ fontSize: 17, fontWeight: 500, margin: "0 0 4px" }}>{q.text}</p>
                {q.note && (
                  <p style={{ fontSize: 13, color: PALETTE.ash, margin: "0 0 12px", lineHeight: 1.45 }}>{q.note}</p>
                )}
                <div style={{ display: "grid", gap: 8, marginTop: q.note ? 0 : 12 }}>
                  {q.options.map((opt, i) => {
                    const selected = answers[q.id] === i;
                    const isDK = opt.dk;
                    return (
                      <button
                        key={i}
                        onClick={() => selectOption(q.id, i)}
                        style={{
                          textAlign: "left",
                          fontFamily: font.body,
                          fontSize: 15,
                          fontStyle: isDK ? "italic" : "normal",
                          padding: "12px 16px",
                          borderRadius: 8,
                          cursor: "pointer",
                          border: `1px solid ${selected ? section.accent : PALETTE.line}`,
                          background: selected ? hexA(section.accent, 0.1) : PALETTE.chalk,
                          color: isDK && !selected ? PALETTE.ash : PALETTE.ink,
                          transition: "all 0.12s",
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                  {answers[q.id] != null && q.options[answers[q.id]]?.other && (
                    <input
                      value={otherText[q.id] || ""}
                      onChange={(e) => setOtherText((p) => ({ ...p, [q.id]: e.target.value }))}
                      placeholder={q.options[answers[q.id]]?.otherHint || "Tell us in your words"}
                      autoFocus
                      style={{
                        fontFamily: font.body,
                        fontSize: 15,
                        padding: "11px 14px",
                        borderRadius: 8,
                        border: `1px solid ${section.accent}`,
                        background: PALETTE.chalk,
                        color: PALETTE.ink,
                        outline: "none",
                        marginTop: 2,
                      }}
                    />
                  )}
                </div>
                {q.freeText && (
                  <div style={{ marginTop: 12 }}>
                    <label style={{ fontFamily: font.mono, fontSize: 12, color: PALETTE.ash, display: "block", marginBottom: 6 }}>
                      {q.freeText.label.toUpperCase()}
                    </label>
                    <input
                      value={otherText[q.freeText.id] || ""}
                      onChange={(e) => setOtherText((p) => ({ ...p, [q.freeText.id]: e.target.value }))}
                      placeholder={q.freeText.placeholder}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        fontFamily: font.body,
                        fontSize: 15,
                        padding: "11px 14px",
                        borderRadius: 8,
                        border: `1px solid ${PALETTE.line}`,
                        background: PALETTE.chalk,
                        color: PALETTE.ink,
                        outline: "none",
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <NavRow
            font={font}
            onBack={() => setStep(sectionIndex === 0 ? "intro" : sectionIndex - 1)}
            onNext={() => setStep(isLast ? "story" : sectionIndex + 1)}
            nextLabel={isLast ? "Add context" : "Next"}
            nextDisabled={!sectionComplete(section)}
            accent={section.accent}
          />
        </div>
      </div>
    );
  }

  // STORY + CONTEXT
  if (step === "story") {
    const taStyle = {
      width: "100%",
      boxSizing: "border-box",
      fontFamily: font.body,
      fontSize: 15,
      lineHeight: 1.5,
      padding: "12px 14px",
      borderRadius: 8,
      border: `1px solid ${PALETTE.line}`,
      background: PALETTE.chalk,
      color: PALETTE.ink,
      resize: "vertical",
      outline: "none",
    };
    return (
      <div style={shell}>
        <FontLink />
        <div style={wrap}>
          <ProgressBar progress={100} />
          <h2 style={{ fontFamily: font.display, fontSize: 42, margin: "24px 0 4px", letterSpacing: 0.5 }}>
            MAKE IT SHARP
          </h2>
          <p style={{ color: PALETTE.ash, fontSize: 16, marginTop: 0, lineHeight: 1.5 }}>
            This is the part that turns a generic read into yours. The more real detail you give, the
            sharper it gets. All optional, skip what you like.
          </p>

          {STORY.map((s) => {
            const arr = stories[s.id] || [""];
            return (
              <div key={s.id} style={{ marginTop: 26 }}>
                <label style={{ fontFamily: font.mono, fontSize: 13, color: s.accent, display: "block", marginBottom: 8 }}>
                  {s.label.toUpperCase()}
                </label>
                {arr.map((val, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                    <textarea
                      value={val}
                      onChange={(e) => setStoryAt(s.id, i, e.target.value)}
                      placeholder={s.placeholder}
                      rows={2}
                      style={taStyle}
                    />
                    {arr.length > 1 && (
                      <button
                        onClick={() => removeStory(s.id, i)}
                        aria-label="Remove"
                        style={{
                          fontFamily: font.body,
                          fontSize: 18,
                          lineHeight: 1,
                          padding: "8px 12px",
                          borderRadius: 8,
                          border: `1px solid ${PALETTE.line}`,
                          background: "transparent",
                          color: PALETTE.ash,
                          cursor: "pointer",
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addStory(s.id)}
                  style={{
                    fontFamily: font.body,
                    fontSize: 13,
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: `1px dashed ${PALETTE.line}`,
                    background: "transparent",
                    color: PALETTE.ash,
                    cursor: "pointer",
                  }}
                >
                  + Add another
                </button>
              </div>
            );
          })}

          <div style={{ marginTop: 30 }}>
            <label style={{ fontFamily: font.mono, fontSize: 13, color: PALETTE.denim, display: "block", marginBottom: 6 }}>
              ANYTHING ELSE THAT'D SHARPEN THIS?
            </label>
            <p style={{ fontSize: 13, color: PALETTE.ash, margin: "0 0 10px", lineHeight: 1.5 }}>
              Paste in whatever helps. For example: {CONTEXT_HINTS.join(", ").toLowerCase()}. The more
              it knows, the better the read.
            </p>
            <textarea
              value={extraContext}
              onChange={(e) => setExtraContext(e.target.value)}
              placeholder="Paste any context here, or leave it blank."
              rows={4}
              style={taStyle}
            />
          </div>

          <NavRow
            font={font}
            onBack={() => setStep(SECTIONS.length - 1)}
            onNext={() => setStep("review")}
            nextLabel="Review answers"
            nextDisabled={false}
            accent={PALETTE.ink}
          />
        </div>
      </div>
    );
  }

  // REVIEW
  if (step === "review") {
    return (
      <div style={shell}>
        <FontLink />
        <div style={wrap}>
          <Eyebrow>Last look before the read</Eyebrow>
          <h2 style={{ fontFamily: font.display, fontSize: 42, margin: "10px 0 6px", letterSpacing: 0.5 }}>
            CHECK YOUR ANSWERS
          </h2>
          <p style={{ color: PALETTE.ash, fontSize: 15, marginTop: 0, lineHeight: 1.5 }}>
            Tap any section to jump back and change something. Nothing's locked in.
          </p>
          <div style={{ marginTop: 18 }}>
            {SECTIONS.map((section, i) => (
              <div
                key={section.id}
                style={{ marginBottom: 12, padding: "14px 16px", background: PALETTE.chalk, border: `1px solid ${PALETTE.line}`, borderRadius: 10 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: font.mono, fontSize: 12, color: section.accent }}>
                    {section.n} · {section.label.toUpperCase()}
                  </span>
                  <button
                    onClick={() => setStep(i)}
                    style={{ fontFamily: font.body, fontSize: 13, padding: "5px 12px", borderRadius: 6, border: `1px solid ${PALETTE.line}`, background: "transparent", color: PALETTE.ash, cursor: "pointer" }}
                  >
                    Edit
                  </button>
                </div>
                <div style={{ marginTop: 8 }}>
                  {section.questions.map((q) => {
                    const idx = answers[q.id];
                    const choice = idx != null ? q.options[idx].label : "—";
                    return (
                      <div key={q.id} style={{ fontSize: 14, color: PALETTE.ink, padding: "3px 0", lineHeight: 1.4 }}>
                        <span style={{ color: PALETTE.ash }}>{shortQ(q.text)}: </span>
                        {choice}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <NavRow font={font} onBack={() => setStep("story")} onNext={generateRead} nextLabel="Get the read" nextDisabled={false} accent={PALETTE.ink} />
        </div>
      </div>
    );
  }

  // READ
  return (
    <div style={shell}>
      <FontLink />
      <div style={wrap}>
        <Eyebrow>The Read {orgName ? `· ${orgName}` : ""}</Eyebrow>
        <p style={{ fontFamily: font.body, fontSize: 14, color: PALETTE.ash, margin: "4px 0 0" }}>
          Where you stand, and the first win to chase.
        </p>
        {loading && (
          <div style={{ marginTop: 40, textAlign: "center" }}>
            <p style={{ fontFamily: font.display, fontSize: 32, letterSpacing: 1, color: PALETTE.ash }}>
              READING YOUR POSITION…
            </p>
            <p style={{ color: PALETTE.ash, fontSize: 14 }}>Working out where you actually stand.</p>
          </div>
        )}
        {error && (
          <div style={{ marginTop: 30 }}>
            <p style={{ color: PALETTE.ember, fontSize: 16 }}>{error}</p>
            <button onClick={generateRead} style={btnStyle(font, PALETTE)}>Try again</button>
          </div>
        )}
        {read && !loading && (
          <>
            <PrintStyles />
            <div className="print-header">
              <span style={{ fontFamily: font.display, fontSize: 22, letterSpacing: 1 }}>AI FAST START</span>
              <span style={{ fontFamily: font.mono, fontSize: 12, color: PALETTE.ash }}>
                {orgName ? `${orgName} · ` : ""}{new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
            <PhaseStrip journey={journey} font={font} />
            <LensBars scoreMap={scoreMap} posture={postureDirection(answers)} font={font} />
            <div style={{ marginTop: 28, padding: "28px 30px", background: PALETTE.chalk, border: `1px solid ${PALETTE.line}`, borderRadius: 12 }} className="read-body">
              {read.split(/\n\n+/).map((para, i) => (
                <p key={i} style={{ fontSize: 17, lineHeight: 1.6, margin: "0 0 16px", fontWeight: i === 0 ? 500 : 400 }}>
                  {para}
                </p>
              ))}
            </div>
            <div className="no-print" style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                onClick={() => navigator.clipboard?.writeText(`The Read${orgName ? " · " + orgName : ""}\n\n${read}`)}
                style={btnStyle(font, PALETTE)}
              >
                Copy the read
              </button>
              <button onClick={() => window.print()} style={btnStyle(font, PALETTE)}>Print / save PDF</button>
              <button
                onClick={() => {
                  setStep("intro");
                  setRead(null);
                  setAnswers({});
                  setStories({ win: [""], fail: [""] });
                  setExtraContext("");
                }}
                style={{ ...btnStyle(font, PALETTE), border: "none", background: "transparent", color: PALETTE.ash }}
              >
                Start over
              </button>
            </div>
            <p style={{ marginTop: 28, fontSize: 13, color: PALETTE.ash, lineHeight: 1.5 }}>
              This is a baseline, not the whole story. It's here to point at the first wins, not grade
              you. The real value is in the conversation that follows.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
