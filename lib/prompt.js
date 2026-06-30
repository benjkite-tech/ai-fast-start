// Builds the system + user prompt for the baseline read. Used by the page;
// the API route just forwards whatever prompt it's handed.

import { SECTIONS, SCORED, SCORED_LABELS, keyScore, placeOnJourney, labelFor, postureDirection } from "./diagnostic";

export function buildPrompt({ answers, stories, extraContext, otherText, orgName, candid }) {
  const ot = otherText || {};
  // If an "other" option was chosen, prefer the user's typed words.
  const enrich = (qId, label) => {
    const txt = (ot[qId] || "").trim();
    return txt ? `${label} (${txt})` : label;
  };
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

  // stories.win and stories.fail are arrays of strings now.
  const wins = (stories.win || []).map((s) => s.trim()).filter(Boolean);
  const fails = (stories.fail || []).map((s) => s.trim()).filter(Boolean);
  const winText = wins.length ? wins.map((w, i) => `  ${i + 1}. ${w}`).join("\n") : "  (none given)";
  const failText = fails.length ? fails.map((f, i) => `  ${i + 1}. ${f}`).join("\n") : "  (none given)";

  const valChoice = labelFor("value", answers);
  const sizeChoice = labelFor("size", answers);
  const seatChoice = labelFor("seat", answers);
  const sectorChoice = enrich("sector", labelFor("sector", answers));
  const horizonChoice = labelFor("horizon", answers);
  const posture = postureDirection(answers);
  const workspace = enrich("workspace", labelFor("workspace", answers));
  const chat = enrich("chat", labelFor("chat", answers));
  const coreTools = (ot["coreTools"] || "").trim();
  const extra = (extraContext || "").trim();

  const secNote =
    journey.securityConcern === "exposed"
      ? "Their security answers show real exposure (sensitive data, unclear tooling, or weak governance). Report this plainly and honestly as something to sort before going wider. Don't pretend it gates everything, but don't bury it either."
      : journey.securityConcern === "blind"
      ? "They answered 'don't know' to several security questions. That blind spot is itself the finding. Name it kindly: you can't make safe AI calls on data you haven't mapped."
      : "Security looks broadly handled. Acknowledge briefly, don't dwell.";

  // Sector sets urgency: AI is hitting some sectors much faster than others.
  let sectorNote = `They're in: ${sectorChoice}. Calibrate urgency to that.`;
  if (/Software|tech|digital/i.test(sectorChoice)) {
    sectorNote += " Tech sector, so the pace is fast and the bar is high. Their competitors are likely already shipping with AI. Don't let them feel comfortable.";
  } else if (/Retail|trades|hospitality|physical/i.test(sectorChoice)) {
    sectorNote += " Physical/retail business, so this may be newer and need a more structured, patient effort. Less 'you're behind', more 'here's the practical first step'. Don't assume software-team speed.";
  } else if (/Regulated/i.test(sectorChoice)) {
    sectorNote += " Regulated sector, so the security and governance answers matter more than usual. The first move must respect the constraints, not ignore them.";
  }

  // Agentic horizon: the defining 2026 maturity question is whether AI does
  // independent work, not just assists. Only raise the deeper horizon if it fits.
  let horizonNote;
  if (/agents run real tasks/i.test(horizonChoice)) {
    horizonNote = "They already have agents doing real work. They're genuinely at the frontier, so the read can talk about the deeper operating-model horizon (people, tech and agents in one loop) as a real next chapter, not a someday.";
  } else if (/automate small steps/i.test(horizonChoice)) {
    horizonNote = "They're starting to automate steps. Worth a light nod to where this heads (AI doing independent work, not just assisting), but keep the first move grounded in their current reality.";
  } else {
    horizonNote = "AI is still purely assisting here, or agents aren't on the radar. Do NOT lecture them about agents or future operating models. That's not their next move. Keep it to getting real wins on the board first.";
  }

  // Stack-aware guidance: the read should tailor the first move to where work
  // lives and where the team talks. Slack is the stronger context-graph path.
  let stackNote = `Their work lives in: ${workspace}. Their team talks in: ${chat}. Use this to make the first move concrete and native to their stack.`;
  if (/Slack/i.test(chat)) {
    stackNote += " They're on Slack, so the context-graph play is on the table: wiring AI into Slack so the running record of decisions and work becomes something AI can reason off. If it fits the first move, point at it.";
  } else if (/Teams/i.test(chat)) {
    stackNote += " They're on Microsoft Teams in a Microsoft shop, so lean toward the Microsoft-native path (Copilot-adjacent, SharePoint/Teams as the context store). Don't recommend a Slack play they can't use.";
  } else if (/email/i.test(chat)) {
    stackNote += " They have no real chat tool, just email. A shared context graph is harder here. The honest first step may be getting the team a shared place to work before expecting AI to reason across it.";
  }

  const system = `You are writing a one-page baseline read called "The Read" for an AI Fast Start diagnostic.

WHY THIS EXISTS (the frame to write from): most AI strategies get too big too quickly. They jump to transformation, agents and new operating models before anyone's worked out where AI actually helps, where it's theatre, and where it changes the shape of the business. You can't make those big calls from guesswork. You earn them by getting on the field, banking real wins, and reading the evidence. This is that read. It's a baseline, a starting point to guide the first wins, never a grade or a verdict.

Write in this voice. Hard rules:
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

Stack matters: ${stackNote}

Sector and urgency: ${sectorNote}

Where they sit on offence vs defence: ${posture}. This is a direction, not a score. Aim the first move accordingly.

${coreTools ? `Their named systems: ${coreTools}. Use your knowledge of these tools as a readiness signal. Some (e.g. HubSpot, Salesforce, Snowflake, Notion, modern cloud tools) are AI-friendly and a good base to build on. Others (legacy, on-prem, closed systems) will fight them. Work this into the read as a soft signal that shapes the advice, for example "X is a strong base to build on" or "Y will be the thing that slows you down". Do NOT use it to re-score their maturity, just to make the advice concrete and specific to what they actually run. If a tool is unfamiliar to you, don't guess, just leave it.\n` : ""}
The agentic horizon: ${horizonNote}

Tone: Direct and honest, not gratuitous. Name the real issue plainly without making anyone defensive.${candid ? " (Run hot: trusted room, don't soften the blocker.)" : ""}

Security handling for this read: ${secNote}

${extra ? `They pasted extra context. Use it to sharpen the read, weight it heavily, and let it override generic assumptions:\n"""\n${extra}\n"""\n` : ""}
Output PLAIN TEXT (no markdown, no bullets) in five short paragraphs:
1. THE READ: where they actually are, 2-4 sentences, framed as a starting point. Name the phase plainly. Factor in their size (${sizeChoice}) so the phase means the right thing.
2. THE HONEST THING: the one thing nobody's said out loud. ${
    journey.redFlag
      ? "They're not even on the horizontal baseline (no broad frontier access AND nothing connected). Say so plainly."
      : journey.singlePlayer
      ? "They look single-player: tools exist but everyone works alone. Name it."
      : "Find the sharpest true thing across all the answers, including people, stack and ownership."
  }
3. THE PEOPLE & SECURITY REALITY: one honest paragraph on whether the team is actually with this, and the security/data picture per the guidance above.
4. THE FIRST MOVE: one concrete first win they could start THIS WEEK. One task, one person, done in days, not a multi-week pilot. Make it specific and small enough to actually happen now. Aim it where they said a win is worth the most ("${valChoice}"), make it native to their stack, and tie it to the real friction or win they described. If a bigger pilot makes sense later, that's a second step, not the first move. The point is momentum now, a real win on the board this week.
5. A closing line with a bit of edge that makes clear this is the start, not the finish.

Under 280 words. Write only the five paragraphs, nothing else.`;

  const user = `Org: ${orgName || "the business"}
Size: ${sizeChoice}. Sector: ${sectorChoice}. Respondent seat: ${seatChoice}.
Stack: work in ${workspace}, chat in ${chat}.
${coreTools ? `Named core systems: ${coreTools}.\n` : ""}Posture (direction): ${posture}.
Agentic horizon: ${horizonChoice}.
Phase (computed): ${journey.phaseLabel} (Phase ${journey.phase})
Red flag (not on baseline): ${journey.redFlag ? "YES" : "no"}
Single-player AI: ${journey.singlePlayer ? "YES" : "no"}
Security concern: ${journey.securityConcern}
Where a win is worth most: ${valChoice}
Scores: ${scoreLine}

Answers:
${answerSummary}

Real AI wins they shared:
${winText}

Real AI fails/frustrations they shared:
${failText}

Write the baseline read.`;

  return { system, user };
}
