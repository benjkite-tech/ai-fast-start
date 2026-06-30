"use client";

import React, { useState, useMemo } from "react";
import {
  PALETTE,
  SECTIONS,
  STORY,
  SCORED,
  SCORED_LABELS,
  totalQuestions,
  keyScore,
  placeOnJourney,
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

export default function Page() {
  const [step, setStep] = useState("intro");
  const [answers, setAnswers] = useState({});
  const [stories, setStories] = useState({});
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

  async function generateRead() {
    setLoading(true);
    setError(null);
    setStep("read");
    const { system, user } = buildPrompt({ answers, stories, orgName, candid });
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
          <Eyebrow>Yite Labs · AI Fast Start</Eyebrow>
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
          <p style={{ fontSize: 15, color: PALETTE.ash, maxWidth: 580, marginTop: 14, lineHeight: 1.5 }}>
            A baseline, not a verdict. About ten minutes, mostly taps. Out the other side: where you
            stand, the one thing nobody's said, and the first win to chase. "Don't know" is a fine
            answer anywhere it shows up.
          </p>
          <div style={{ marginTop: 26 }}>
            <input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Business name (optional)"
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
            onClick={() => setStep(0)}
            style={{
              marginTop: 26,
              fontFamily: font.display,
              fontSize: 24,
              letterSpacing: 1,
              padding: "14px 32px",
              background: PALETTE.ink,
              color: PALETTE.ground,
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
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
                </div>
              </div>
            ))}
          </div>
          <NavRow
            font={font}
            onBack={() => setStep(sectionIndex === 0 ? "intro" : sectionIndex - 1)}
            onNext={() => setStep(isLast ? "story" : sectionIndex + 1)}
            nextLabel={isLast ? "Two examples" : "Next"}
            nextDisabled={!sectionComplete(section)}
            accent={section.accent}
          />
        </div>
      </div>
    );
  }

  // STORY
  if (step === "story") {
    return (
      <div style={shell}>
        <FontLink />
        <div style={wrap}>
          <ProgressBar progress={100} />
          <h2 style={{ fontFamily: font.display, fontSize: 42, margin: "24px 0 4px", letterSpacing: 0.5 }}>
            TWO REAL EXAMPLES
          </h2>
          <p style={{ color: PALETTE.ash, fontSize: 16, marginTop: 0, lineHeight: 1.5 }}>
            This is what makes the read sharp instead of generic. A line each is plenty. Skip if you've
            genuinely got none.
          </p>
          {STORY.map((s) => (
            <div key={s.id} style={{ marginTop: 22 }}>
              <label style={{ fontFamily: font.mono, fontSize: 13, color: s.accent, display: "block", marginBottom: 8 }}>
                {s.label.toUpperCase()}
              </label>
              <textarea
                value={stories[s.id] || ""}
                onChange={(e) => setStories((p) => ({ ...p, [s.id]: e.target.value }))}
                placeholder={s.placeholder}
                rows={3}
                style={{
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
                }}
              />
            </div>
          ))}
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
        <Eyebrow>Baseline read {orgName ? `· ${orgName}` : ""}</Eyebrow>
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
            <PhaseStrip journey={journey} font={font} />
            <LensBars scoreMap={scoreMap} font={font} />
            <div style={{ marginTop: 28, padding: "28px 30px", background: PALETTE.chalk, border: `1px solid ${PALETTE.line}`, borderRadius: 12 }}>
              {read.split(/\n\n+/).map((para, i) => (
                <p key={i} style={{ fontSize: 17, lineHeight: 1.6, margin: "0 0 16px", fontWeight: i === 0 ? 500 : 400 }}>
                  {para}
                </p>
              ))}
            </div>
            <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                onClick={() => navigator.clipboard?.writeText(`AI Fast Start — Baseline read${orgName ? " · " + orgName : ""}\n\n${read}`)}
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
                  setStories({});
                }}
                style={{ ...btnStyle(font, PALETTE), border: "none", background: "transparent", color: PALETTE.ash }}
              >
                Start over
              </button>
            </div>
            <p style={{ marginTop: 28, fontSize: 13, color: PALETTE.ash, lineHeight: 1.5 }}>
              This is a baseline, not the whole story. It's here to point at the first wins, not grade
              you. The real value is in the conversation that follows. yitelabs.co
            </p>
          </>
        )}
      </div>
    </div>
  );
}
