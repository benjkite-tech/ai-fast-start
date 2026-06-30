// Builds the system + user prompt for the baseline read. Used by the page;
// the API route just forwards whatever prompt it's handed.

import { SECTIONS, SCORED, SCORED_LABELS, keyScore, placeOnJourney, labelFor } from "./diagnostic";

export function buildPrompt({ answers, stories, orgName, candid }) {
  const scoreMap = {};
  SCORED.forEach((k) => (scoreMap[k] = keyScore(k, answers)));
  const journey = placeOnJourney(scoreMap, answers);

  const answerSummary = SECTIONS.map((section) => {
    const lines = section.questions.map((q) => {
      const idx = answers[q.id];
      const choice = idx != null ? q.options[idx].label : "(skipped)";
      return `  - ${q.text} -> ${choice}`;
    });
    return `${section.label}:\n${lines.join("\n")}`;
  }).join("\n\n");

  const scoreLine = SCORED.map(
    (k) =>
      `${SCORED_LABELS[k]} ${Math.round(scoreMap[k].score * 100)}%${
        scoreMap[k].dk ? ` (${scoreMap[k].dk} "don't know")` : ""
      }`
  ).join(", ");

  const win = stories.win?.trim() || "(none given)";
  const fail = stories.fail?.trim() || "(none given)";
  const valChoice = labelFor("value", answers);
  const sizeChoice = labelFor("size", answers);
  const seatChoice = labelFor("seat", answers);

  const secNote =
    journey.securityConcern === "exposed"
      ? "Their security answers show real exposure (sensitive data, unclear tooling, or weak governance). Report this plainly and honestly as something to sort before going wider. Don't pretend it gates everything, but don't bury it either."
      : journey.securityConcern === "blind"
      ? "They answered 'don't know' to several security questions. That blind spot is itself the finding. Name it kindly: you can't make safe AI calls on data you haven't mapped."
      : "Security looks broadly handled. Acknowledge briefly, don't dwell.";

  const system = `You are writing a one-page baseline read for the Yite Labs AI Fast Start diagnostic.

WHY THIS EXISTS (the frame to write from): most AI strategies get too big too quickly. They jump to transformation, agents and new operating models before anyone's worked out where AI actually helps, where it's theatre, and where it changes the shape of the business. You can't make those big calls from guesswork. You earn them by getting on the field, banking real wins, and reading the evidence. This diagnostic is that read. It's a baseline, a starting point to guide the first wins, never a grade or a verdict.

Write in Ben Kite's voice. Hard rules:
- Australian English (organise, optimise, behaviour, analyse).
- NO em-dashes, ever. Use full stops, commas, or restructure.
- Avoid "it's not X, it's Y", "X isn't just Y", and rule-of-three lists used for rhythm.
- No corporate/workshop-slide language (leverage, unlock, double down, in today's landscape).
- Short sentences do the heavy lifting. Plain, direct, confident. Dry humour welcome.
- Lead with the honest thing. Frame offensively, building toward something. End on a sharp line, not a weak trail-off.
- Don't inflate or fabricate. If the signal's thin, say so.

The thesis underneath: AI is not the goal. The goal is happier customers, better work, a stronger business. Never praise tool adoption on its own. Tie everything back to outcomes.

The phases: Phase 0 (not yet on the field), Phase 1 (individual wins), Phase 2 (team and function wins, defence and offence), Phase 3 (building deeper foundations that compound). Phases 1-2 are the horizontal baseline most orgs move on fast. Phase 3 is the vertical moat. Key tell: single-player AI (everyone solo, redoing each other's work) vs shared context.

Read the answers as a whole, not lens by lens. People and ownership matter as much as tooling. A team that's anxious, or has no owner and no rhythm, is fragile no matter how many licences it holds. Say so when it's true.

Tone: Direct and honest, not gratuitous. Name the real issue plainly without making anyone defensive.${candid ? " (Run hot: trusted room, don't soften the blocker.)" : ""}

Security handling for this read: ${secNote}

Output PLAIN TEXT (no markdown, no bullets) in five short paragraphs:
1. THE READ: where they actually are, 2-4 sentences, framed as a starting point. Name the phase plainly. Factor in their size (${sizeChoice}) so the phase means the right thing.
2. THE HONEST THING: the one thing nobody's said out loud. ${
    journey.redFlag
      ? "They're not even on the horizontal baseline (no broad frontier access AND nothing connected). Say so plainly."
      : journey.singlePlayer
      ? "They look single-player: tools exist but everyone works alone. Name it."
      : "Find the sharpest true thing across all the answers, including people and ownership."
  }
3. THE PEOPLE & SECURITY REALITY: one honest paragraph on whether the team is actually with this, and the security/data picture per the guidance above.
4. THE FIRST MOVE: one concrete first win to chase. Not three. One. Aim it where they said a win is worth the most ("${valChoice}") and tie it to the real friction or win they described.
5. A closing line with a bit of edge that makes clear this is the start, not the finish.

Under 260 words. Write only the five paragraphs, nothing else.`;

  const user = `Org: ${orgName || "the business"}
Size: ${sizeChoice}. Respondent seat: ${seatChoice}.
Phase (computed): ${journey.phaseLabel} (Phase ${journey.phase})
Red flag (not on baseline): ${journey.redFlag ? "YES" : "no"}
Single-player AI: ${journey.singlePlayer ? "YES" : "no"}
Security concern: ${journey.securityConcern}
Where a win is worth most: ${valChoice}
Scores: ${scoreLine}

Answers:
${answerSummary}

A real AI win: ${win}
A real AI fail/frustration: ${fail}

Write the baseline read.`;

  return { system, user };
}
