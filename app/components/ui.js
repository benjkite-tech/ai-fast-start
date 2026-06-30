"use client";

import React from "react";
import { SCORED, SCORED_LABELS } from "../../lib/diagnostic";

export function FontLink() {
  return (
    <link
      href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap"
      rel="stylesheet"
    />
  );
}

export function Eyebrow({ children }) {
  return (
    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", color: "#8A877E" }}>
      {children}
    </span>
  );
}

export function ProgressBar({ progress }) {
  return (
    <div style={{ height: 4, background: "#E2DED3", borderRadius: 2, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${progress}%`, background: "#1A1A17", transition: "width 0.3s" }} />
    </div>
  );
}

export function NavRow({ font, onBack, onNext, nextLabel, nextDisabled, accent }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
      <button onClick={onBack} style={{ fontFamily: font.body, fontSize: 14, padding: "10px 16px", background: "transparent", border: "none", color: "#8A877E", cursor: "pointer" }}>
        ← Back
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        style={{
          fontFamily: font.display,
          fontSize: 22,
          letterSpacing: 0.8,
          padding: "11px 26px",
          borderRadius: 8,
          border: "none",
          background: nextDisabled ? "#D8D4C9" : accent,
          color: nextDisabled ? "#9A978E" : "#F4F1EA",
          cursor: nextDisabled ? "not-allowed" : "pointer",
        }}
      >
        {nextLabel.toUpperCase()} →
      </button>
    </div>
  );
}

export function LensBars({ scoreMap, font }) {
  const accents = {
    tools: "#D85A30",
    data: "#185FA5",
    people: "#1D9E75",
    security: "#BA7517",
    ownership: "#D4537E",
    posture: "#534AB7",
  };
  return (
    <div style={{ marginTop: 24 }}>
      {SCORED.map((k) => {
        const s = scoreMap[k];
        const pct = Math.round(s.score * 100);
        return (
          <div key={k} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontFamily: font.mono, fontSize: 12, color: "#1A1A17", letterSpacing: 0.5 }}>
                {SCORED_LABELS[k].toUpperCase()}
                {s.dk > 0 && <span style={{ color: "#8A877E" }}> · {s.dk} unsure</span>}
              </span>
              <span style={{ fontFamily: font.mono, fontSize: 12, color: "#8A877E" }}>{pct}%</span>
            </div>
            <div style={{ height: 8, background: "#E2DED3", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: accents[k], borderRadius: 4 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function PhaseStrip({ journey, font }) {
  const phases = [
    { n: 0, label: "On the field" },
    { n: 1, label: "Individual" },
    { n: 2, label: "Team" },
    { n: 3, label: "Foundations" },
  ];
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {phases.map((p) => {
          const active = journey.phase >= p.n && journey.phase > 0;
          const isCurrent = journey.phase === p.n;
          return (
            <div
              key={p.n}
              style={{
                flex: 1,
                padding: "10px 8px",
                borderRadius: 8,
                textAlign: "center",
                background: isCurrent ? "#1A1A17" : active ? "rgba(26,26,23,0.08)" : "transparent",
                border: `1px solid ${isCurrent ? "#1A1A17" : "#E2DED3"}`,
              }}
            >
              <div style={{ fontFamily: font.mono, fontSize: 11, color: isCurrent ? "#F4F1EA" : "#8A877E" }}>PHASE {p.n}</div>
              <div style={{ fontFamily: font.body, fontSize: 12, fontWeight: 500, color: isCurrent ? "#F4F1EA" : "#1A1A17", marginTop: 2 }}>
                {p.label}
              </div>
            </div>
          );
        })}
      </div>
      {journey.redFlag && (
        <p style={{ fontFamily: font.mono, fontSize: 12, color: "#D85A30", marginTop: 10 }}>
          ⚑ Not on the horizontal baseline yet. That's the first thing to fix.
        </p>
      )}
      {journey.securityConcern === "exposed" && (
        <p style={{ fontFamily: font.mono, fontSize: 12, color: "#BA7517", marginTop: 6 }}>
          ⚑ Security gap worth sorting before going wider.
        </p>
      )}
      {journey.securityConcern === "blind" && (
        <p style={{ fontFamily: font.mono, fontSize: 12, color: "#BA7517", marginTop: 6 }}>
          ⚑ Blind spots on data and security. Worth mapping before you connect more.
        </p>
      )}
    </div>
  );
}

export function btnStyle(font, P) {
  return {
    fontFamily: font.body,
    fontSize: 14,
    padding: "11px 20px",
    borderRadius: 8,
    border: `1px solid ${P.ink}`,
    background: P.chalk,
    color: P.ink,
    cursor: "pointer",
  };
}

export function hexA(hex, a) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export function shortQ(text) {
  return text.length > 42 ? text.slice(0, 40).trim() + "…" : text;
}
