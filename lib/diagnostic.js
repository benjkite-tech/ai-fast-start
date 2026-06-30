// Diagnostic content and scoring logic for the AI Fast Start Phase 0 diagnostic.
// Kept separate from the component so questions are easy to tune.

export const PALETTE = {
  ink: "#1A1A17",
  ground: "#F4F1EA",
  chalk: "#FBFAF6",
  ash: "#8A877E",
  ember: "#D85A30",
  moss: "#1D9E75",
  denim: "#185FA5",
  lavender: "#534AB7",
  harvest: "#BA7517",
  pink: "#D4537E",
  line: "#E2DED3",
};

const DK = { label: "Not sure / don't know", score: null, dk: true };

export const SECTIONS = [
  {
    id: "context",
    n: "01",
    label: "The shape of things",
    accent: PALETTE.ash,
    framing:
      "First, a quick read on who you are. The same answers mean very different things at twelve people versus two thousand.",
    questions: [
      {
        id: "size",
        text: "How big is the business?",
        scoreless: true,
        options: [
          { label: "Just a handful (under 15)", score: 0 },
          { label: "Small team (15–50)", score: 0 },
          { label: "Mid-sized (50–250)", score: 0 },
          { label: "Large (250+)", score: 0 },
        ],
      },
      {
        id: "seat",
        text: "Where do you sit?",
        scoreless: true,
        note: "So the read knows whose view it's hearing.",
        options: [
          { label: "Owner / founder / exec", score: 0 },
          { label: "Manager / team lead", score: 0 },
          { label: "On the tools, in the work", score: 0 },
          { label: "Outside advisor / consultant", score: 0 },
        ],
      },
    ],
  },
  {
    id: "seeing",
    n: "02",
    label: "How you see AI helping",
    accent: PALETTE.lavender,
    framing:
      "Before the detail, the big one. What you want AI to do shapes everything that follows. No wrong answer here.",
    questions: [
      {
        id: "stance",
        text: "Right now, where's the bigger pull?",
        weightKey: "posture",
        options: [
          { label: "Defence: better, faster, cheaper ops", score: 1 },
          { label: "Mostly defence, some offence", score: 2 },
          { label: "Even split", score: 2 },
          { label: "Offence: new products, new reach", score: 3 },
        ],
      },
      {
        id: "value",
        text: "Where would a real win be worth the most?",
        scoreless: true,
        note: "This points the first move at something that matters, not just something that's easy.",
        options: [
          { label: "Time back for an overloaded team", score: 0 },
          { label: "Faster or better customer experience", score: 0 },
          { label: "A slow, painful process fixed", score: 0 },
          { label: "A new product or market we can't serve yet", score: 0 },
        ],
      },
      {
        id: "pressure",
        text: "What's driving the interest in AI?",
        scoreless: true,
        options: [
          { label: "Competitors or customers are moving", score: 0 },
          { label: "Cost and efficiency pressure", score: 0 },
          { label: "Genuine curiosity, want to explore", score: 0 },
          { label: "Board / leadership says we should", score: 0 },
        ],
      },
    ],
  },
  {
    id: "tools",
    n: "03",
    label: "Tools & access",
    accent: PALETTE.ember,
    framing:
      "The starting line. If the team can't reach a good model, nothing else matters yet.",
    questions: [
      {
        id: "frontier",
        text: "Does the team have access to a frontier model (Claude, ChatGPT, Gemini)?",
        weightKey: "tools",
        options: [
          { label: "No one really", score: 0 },
          { label: "A few keen people, ad hoc", score: 1 },
          { label: "Most of the team has a licence", score: 2 },
          { label: "Everyone, and it's expected", score: 3 },
        ],
      },
      {
        id: "daily",
        text: "How often does AI show up in actual daily work?",
        weightKey: "tools",
        options: [
          { label: "Rarely, novelty stage", score: 0 },
          { label: "Some people, some tasks", score: 1 },
          { label: "Daily for a good chunk of the team", score: 2 },
          { label: "It's in the flow of most work", score: 3 },
        ],
      },
      {
        id: "breadth",
        text: "Where does AI actually touch the business today?",
        weightKey: "tools",
        note: "Where it reaches matters more than how often it's opened.",
        options: [
          { label: "Barely anywhere yet", score: 0 },
          { label: "Personal productivity (drafting, notes)", score: 1 },
          { label: "Into real internal processes", score: 2 },
          { label: "Customer-facing or in the product itself", score: 3 },
        ],
      },
    ],
  },
  {
    id: "data",
    n: "04",
    label: "Data & connections",
    accent: PALETTE.denim,
    framing:
      "AI gets better the more of your world it can see. This is whether it works with your context or guesses in the dark.",
    questions: [
      {
        id: "context",
        text: "Can AI reach the good context (docs, drives, inboxes, knowledge bases)?",
        weightKey: "data",
        options: [
          { label: "No, it works from scratch each time", score: 0 },
          { label: "People paste things in manually", score: 1 },
          { label: "Some tools are connected", score: 2 },
          { label: "Connected across the places work happens", score: 3 },
          DK,
        ],
      },
      {
        id: "shared",
        text: "Is AI single-player or shared?",
        weightKey: "data",
        note: "Single-player: everyone on their own chatbot, quietly redoing each other's work. Shared: same context, same state.",
        options: [
          { label: "Everyone solo on their own chatbot", score: 0 },
          { label: "A couple of shared projects exist", score: 1 },
          { label: "Teams share workspaces for recurring work", score: 2 },
          { label: "Functions work off shared live context", score: 3 },
        ],
      },
    ],
  },
  {
    id: "people",
    n: "05",
    label: "People & how they feel",
    accent: PALETTE.moss,
    framing:
      "The half that decides whether any of this sticks. Tools are easy. People are the real work. How the team feels matters as much as what they can do.",
    questions: [
      {
        id: "feeling",
        text: "How does the team mostly feel about AI?",
        weightKey: "people",
        options: [
          { label: "Anxious or threatened by it", score: 0 },
          { label: "Sceptical, wait-and-see", score: 1 },
          { label: "Curious, willing to try", score: 2 },
          { label: "Genuinely keen, already playing", score: 3 },
        ],
      },
      {
        id: "split",
        text: "Is the feeling even, or split?",
        scoreless: true,
        note: "A loud champion and a quiet, worried majority is a different room from broad, mild curiosity.",
        options: [
          { label: "Fairly even across the team", score: 0 },
          { label: "A few champions, everyone else unsure", score: 0 },
          { label: "Split down the middle", score: 0 },
          { label: "A few loud sceptics holding it back", score: 0 },
        ],
      },
      {
        id: "useskill",
        text: "How capable is the team at using AI well?",
        weightKey: "people",
        options: [
          { label: "Beginners, basic prompts at best", score: 0 },
          { label: "A few power users carry it", score: 1 },
          { label: "Many people are competent", score: 2 },
          { label: "Strong, and sharing what works", score: 3 },
        ],
      },
      {
        id: "buildskill",
        text: "Can anyone build with AI, not just use it?",
        weightKey: "people",
        note: "Skills, prototypes, small automations. The line between using chatbots and making things.",
        options: [
          { label: "No, just chat", score: 0 },
          { label: "One or two tinkerers", score: 1 },
          { label: "A few people build useful things", score: 2 },
          { label: "Building is becoming normal here", score: 3 },
        ],
      },
    ],
  },
  {
    id: "security",
    n: "06",
    label: "Security & data risk",
    accent: PALETTE.harvest,
    framing:
      "The part most people skip, and the part that decides which moves are safe. Honest answers here are worth more than impressive ones. 'Don't know' is a real finding, not a fail.",
    questions: [
      {
        id: "tiers",
        text: "Do you know which data is sensitive and where it lives?",
        weightKey: "security",
        note: "Customer records, financials, IP, contracts. The lines you work backwards from.",
        options: [
          { label: "No, never mapped it", score: 0 },
          { label: "Rough sense, nothing written", score: 1 },
          { label: "Known and mostly documented", score: 2 },
          { label: "Clearly tiered and governed", score: 3 },
          DK,
        ],
      },
      {
        id: "wheredata",
        text: "Do you know where data goes when staff use AI?",
        weightKey: "security",
        note: "Whether tools retain it, train on it, or where it's hosted. Enterprise and consumer tiers handle this very differently.",
        options: [
          { label: "No idea, honestly", score: 0 },
          { label: "Assume consumer tools, not sure", score: 1 },
          { label: "On paid / business tiers, broadly safe", score: 2 },
          { label: "Enterprise terms, retention understood", score: 3 },
          DK,
        ],
      },
      {
        id: "shadow",
        text: "Are people using personal AI accounts for work?",
        weightKey: "security",
        note: "Shadow AI. Almost every org has some. It's a risk and, honestly, a sign people want this.",
        options: [
          { label: "Yes, plenty, no oversight", score: 0 },
          { label: "Probably some, we don't track it", score: 1 },
          { label: "A little, mostly on approved tools", score: 2 },
          { label: "No, everyone's on sanctioned tools", score: 3 },
          DK,
        ],
      },
      {
        id: "governance",
        text: "Is anything checked before AI output reaches a customer or a decision?",
        weightKey: "security",
        note: "Who reviews what AI produces. Matters most the moment AI faces customers or moves money.",
        options: [
          { label: "No, whatever it makes goes out", score: 0 },
          { label: "Ad hoc, depends on the person", score: 1 },
          { label: "Humans review the important stuff", score: 2 },
          { label: "Clear rules on what gets checked", score: 3 },
          DK,
        ],
      },
    ],
  },
  {
    id: "ownership",
    n: "07",
    label: "Ownership & momentum",
    accent: PALETTE.pink,
    framing:
      "The quiet predictor of whether wins last. One excited person with no mandate is fragile. A rhythm that keeps wins coming is how it sticks.",
    questions: [
      {
        id: "owner",
        text: "Is AI actually someone's job?",
        weightKey: "ownership",
        options: [
          { label: "No, nobody owns it", score: 0 },
          { label: "An enthusiast doing it on the side", score: 1 },
          { label: "Someone has it as part of their role", score: 2 },
          { label: "Clear owner with a mandate", score: 3 },
        ],
      },
      {
        id: "rhythm",
        text: "Is there any rhythm keeping it alive?",
        weightKey: "ownership",
        note: "A wins channel, a weekly demo, a shared skills library. The things that turn a spark into a habit.",
        options: [
          { label: "Nothing, it's all ad hoc", score: 0 },
          { label: "Occasional chatter, nothing regular", score: 1 },
          { label: "Some sharing, starting to form", score: 2 },
          { label: "A real rhythm people take part in", score: 3 },
        ],
      },
    ],
  },
];

export const STORY = [
  { id: "win", label: "A real AI win", placeholder: "Where has AI already helped, even a small thing?", accent: PALETTE.moss },
  { id: "fail", label: "A real AI fail or frustration", placeholder: "Where has it flopped, frustrated people, or felt like theatre?", accent: PALETTE.ember },
];

export const SCORED = ["tools", "data", "people", "security", "ownership", "posture"];
export const SCORED_LABELS = {
  tools: "Tools",
  data: "Data",
  people: "People",
  security: "Security",
  ownership: "Ownership",
  posture: "Posture",
};

export const totalQuestions = SECTIONS.reduce((a, s) => a + s.questions.length, 0);

export function keyScore(weightKey, answers) {
  let sum = 0, n = 0, dk = 0;
  for (const s of SECTIONS) {
    for (const q of s.questions) {
      if (q.weightKey !== weightKey) continue;
      const idx = answers[q.id];
      if (idx == null) continue;
      const opt = q.options[idx];
      if (opt.dk) { dk++; continue; }
      sum += opt.score; n++;
    }
  }
  return { score: n ? sum / (n * 3) : 0, answered: n, dk };
}

export function placeOnJourney(scoreMap, answers) {
  const frontier = answers["frontier"];
  const connected = answers["context"];
  const shared = answers["shared"];
  const redFlag = frontier != null && frontier <= 1 && connected != null && connected <= 1;
  const avg = (scoreMap.tools.score + scoreMap.data.score + scoreMap.people.score) / 3;

  let phase, phaseLabel;
  if (redFlag || avg < 0.25) { phase = 0; phaseLabel = "Not yet on the field"; }
  else if (avg < 0.55) { phase = 1; phaseLabel = "Individual wins"; }
  else if (avg < 0.8) { phase = 2; phaseLabel = "Team & function wins"; }
  else { phase = 3; phaseLabel = "Building foundations"; }

  const singlePlayer = shared != null && shared <= 1;
  const sec = scoreMap.security;
  const securityConcern = sec.answered > 0 && sec.score < 0.4 ? "exposed" : sec.dk >= 2 ? "blind" : "ok";

  return { phase, phaseLabel, redFlag, singlePlayer, securityConcern };
}

export function labelFor(qId, answers) {
  for (const s of SECTIONS) {
    for (const q of s.questions) {
      if (q.id === qId) {
        const idx = answers[q.id];
        return idx != null ? q.options[idx].label : "(not given)";
      }
    }
  }
  return "(not given)";
}
