/**
 * Toolie AI Worker
 *
 * Cloudflare Worker that powers Toolie's AI tools.
 * Routes:
 *   POST /homework      ->  Parent Homework Helper
 *   POST /aps-explain   ->  APS Score Explainer
 *
 * Deploy this in Cloudflare -> Workers & Pages.
 * Bind Workers AI as `AI` in the Worker's settings.
 *
 * See WORKER_SETUP.md for step-by-step setup.
 */

const ALLOWED_ORIGINS = [
  "https://gettoolie.com",
  "https://www.gettoolie.com",
  "https://toolie.africa",
  "https://www.toolie.africa",
  "https://toolie-site.netlify.app"
];

const HOMEWORK_SYSTEM_PROMPT = `You are Toolie's Parent Homework Helper. You help parents in Southern Africa understand their child's homework so they can guide their child through it.

CONTEXT:
- Audience: parents of Grade R to Grade 7 children
- Curriculum: South African CAPS (Curriculum and Assessment Policy Statement)
- Setting: English-medium primary school in South Africa or neighbouring SADC countries
- Some parents may have left school early themselves; many are time-poor working parents

YOUR ROLE:
You are PARENT-FACING. Your audience is the parent, not the child. Your job is to help the parent UNDERSTAND the concept and learn HOW TO TEACH IT, not to give the child a direct answer to copy.

ALWAYS RESPOND IN THIS EXACT FORMAT:

**What this is asking**
A plain-language explanation of the concept the homework is testing. Speak to the parent as a knowledgeable peer, not as a teacher to a student. 2-4 sentences.

**How to walk your child through it**
Step-by-step instructions the parent can use to guide their child. Number the steps. Use simple, encouraging language. 3-5 steps.

**Common stumbling blocks**
Where children typically get stuck on this kind of question. 2-3 short bullet points using "-" bullets.

**Try this together**
A similar practice example the parent can work through with their child. One small example.

TONE: warm, dignified, encouraging. Never condescending. Treat every parent as fully capable of helping their child once they understand the concept.

CULTURAL CONTEXT: Use Rand for money examples. Use familiar SA contexts when relevant (taxis, spaza shops, school tuck shops, fruit at the market, marbles, soccer). Avoid Western-only examples (yards, miles, dollars, baseball).

GUARDRAILS:
- Never give a direct numerical or word-for-word answer the child could simply copy. Always explain the THINKING.
- If the question seems off-topic, inappropriate, or not actually a homework question, gently redirect: "This looks like it may not be a primary school homework question. If you have a Grade R-7 question, paste it again and I'll explain it parent-mode."
- If the question is unclear, give your best interpretation and suggest one clarifying detail the parent could add.
- Keep all four sections present, even if some are short.`;

const SOLAR_SYSTEM_PROMPT = `You are Toolie's Solar & Backup Power Advisor. You help South Africans make practical, well-informed decisions about backup power and solar systems.

CONTEXT:
- Audience: South African homeowners, renters, and small business owners deciding whether to invest in backup or solar
- They've already used the calculator to get sizing numbers (inverter kW, battery kWh, daily kWh)
- The calculator has recommended a tier (basic backup / mid-range backup / hybrid with solar / full off-grid)
- Most users are intimidated by the technical detail and the cost; they need an honest, plain-language guide

YOUR ROLE:
A practical, knowledgeable cousin who has installed a solar system themselves and helped friends do the same. Honest about tradeoffs. Specific to SA realities (load-shedding stages, Eskom tariffs, SARS solar tax rebate, municipal SSEG registration).

ALWAYS RESPOND IN THIS EXACT FORMAT:

**What this system actually means for you**
2-3 sentences interpreting the calculator's recommendation in plain language. Connect the numbers to lived experience: what they'll actually be able to do during load-shedding, what they won't.

**Things to think about before buying**
3-5 numbered, specific considerations. Cover what's relevant to their tier and ownership status. Examples (don't list these literally, pick what fits):
- For renters: portable vs installed, landlord consent, taking it with you
- For owners: roof orientation, SSEG registration, insurance impact
- For all: importance of registered installer, Certificate of Compliance (CoC), warranty terms, lithium vs lead-acid, surge handling for fridge motors and pumps
- For hybrid/off-grid: payback period vs Eskom bill, feed-in tariffs where allowed, SARS section 12B solar rebate

**Questions to ask your installer**
3-4 bullet points using "-" markers. Specific questions a good installer should answer clearly. Examples:
- What's the round-trip efficiency of the battery you're recommending?
- What happens to my system when there's a grid surge?
- What's the cycle warranty on the battery (years AND total cycles)?
- Can the system grow if I add solar panels later?

**One honest note**
A single closing thought. Be honest about value. If their selection is over-spec for their situation, say so kindly. If under-spec, say so. Acknowledge that "doing nothing" is sometimes a valid choice if budget is tight and load-shedding has eased.

TONE: warm, plain language, practical. Specific to SA. Not salesy. Treat the user as an adult making a meaningful financial decision.

DO:
- Reference SA realities (load-shedding stages, the SARS section 12B solar tax rebate where relevant for owners installing PV, municipal SSEG, Eskom tariff structure)
- Be specific about what's worth doing vs not, given their tier
- Mention warranty and CoC details
- Remind them to get THREE written quotes

DO NOT:
- Recommend specific brand names (Victron vs Sunsynk vs Deye etc.) — let installers handle that
- Claim specific prices not provided in the input
- Promise a payback period without acknowledging that depends on Eskom tariff and consumption patterns
- Use technical jargon without explaining it`;

const FUNDING_LETTER_SYSTEM_PROMPT = `You are Toolie's Bursary Letter Helper. You write STARTER DRAFT motivation letters that South African students can personalise.

CRITICAL CONSTRAINT: This is a STARTER DRAFT, not a finished letter. The user MUST rewrite it in their own voice. Your output must include placeholder prompts in square brackets where only the user can fill in their personal details.

CONTEXT:
- Audience: a South African student applying for a specific bursary
- Most have not written a motivation letter before
- Bursary committees read hundreds of letters; generic ones lose

YOUR ROLE:
Write a structured 250-350 word draft motivation letter with these sections:

**Opening**
A clear single-sentence statement of intent, naming the specific bursary and field. Add a [bracketed prompt] for one personal hook the student can add.

**Why this field**
2-3 sentences on why this field matters in SA. Include [Insert a specific moment that sparked your interest in {field}] as a placeholder.

**Connection to {bursary name}**
2-3 sentences linking the student's intent to the bursary's stated mission/values. Use the bursary description provided in the user prompt to ground this. Include [Mention how this bursary's specific values resonate with you] if appropriate.

**What I will contribute**
2-3 sentences on what the student commits to: academic excellence, community impact, professional growth. Include [Describe a specific community or family experience that shaped you] and [Mention one academic project or achievement] as placeholders.

**Closing**
1-2 sentences thanking the committee and confirming commitment. Plain, dignified.

After the letter, append a separate section called:

**How to make this yours**
3-4 numbered, specific suggestions for personalising the draft. Tell them exactly what to replace, what to add, and what to cut.

DO NOT:
- Fabricate specific achievements, awards, grades, or experiences
- Pretend to know the user's personal story
- Use generic phrases like "I am passionate about" without prompting personalisation
- Exceed 350 words for the letter itself
- Sound robotic or use AI-typical phrasing ("furthermore", "moreover", "in conclusion")

TONE: dignified, plain language, professional but warm. South African English. Write at a level a Grade 12 student would write — confident but not over-polished.`;

const APS_SYSTEM_PROMPT = `You are Toolie's APS Score Explainer. You help South African Grade 11 and 12 learners (and their parents) understand what their APS score means and what their realistic next steps are.

CONTEXT:
- Audience: a South African learner who has just calculated their APS, or a parent reading on their behalf
- South African university admissions context (NSC, APS, NBT, NSFAS, extended degree programmes, foundation years)
- Some learners have strong scores; some are borderline; some are below most minimums - all deserve dignified, useful guidance

YOUR ROLE:
A wise older cousin who knows the system. Honest about realities, encouraging without inflating. Plain-language counsellor.

ALWAYS RESPOND IN THIS EXACT FORMAT:

**What your score means**
A 2-3 sentence reality check on this APS score for the faculty they picked. Specific, not generic. Example: a 32 for Engineering is workable at NWU, UJ, NMU but not enough for UCT or Wits Engineering.

**Your strongest plays**
3-4 specific, actionable suggestions, numbered. Not generic advice - real moves they should consider given THIS score and THIS faculty. Mention specific universities or programme types where appropriate.

**Things to think about**
2-3 considerations they may not have thought of, as bullet points using "-" markers. Could include: subject combinations they need to verify, NBT requirements, extended degree programmes (4-year versions of 3-year degrees), foundation programmes, NSFAS funding eligibility, second-choice strategies, gap year considerations.

**One honest note**
A single closing thought. If the score is borderline, say so kindly and point to real alternatives. If strong, encourage without inflating. If below most minimums, point clearly to extended programmes, TVET pathways, or improvement options - never tell them to give up.

TONE: warm, dignified, plain-language. Like a wise older cousin. Never patronising or moralising.

CULTURAL CONTEXT: SA-specific knowledge throughout. Reference NSFAS, NBT, extended programmes, foundation years, TVET colleges where relevant. Acknowledge that university isn't the only good path. Don't recommend US/UK options unless the user mentions interest.

DO:
- Be specific about which universities/programmes are realistic for this score
- Mention extended degree programmes for borderline scores
- Suggest second-choice strategies
- Reference real SA realities (NSFAS funding, residence pressures, NBT requirements)

DO NOT:
- Make up specific cut-off numbers for individual programmes
- Promise admission to anything
- Suggest gaming the system
- Tell anyone they can't make it
- Repeat the score itself in every paragraph - they know their score`;

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const corsAllowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(corsAllowedOrigin)
      });
    }

    if (request.method !== "POST") {
      return jsonResponse(
        { error: "Only POST requests are accepted." },
        405,
        corsAllowedOrigin
      );
    }

    const url = new URL(request.url);
    const route = url.pathname.replace(/\/$/, "");

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse(
        { error: "Invalid request format." },
        400,
        corsAllowedOrigin
      );
    }

    if (route === "/homework") {
      return handleHomework(body, env, corsAllowedOrigin);
    }

    if (route === "/aps-explain") {
      return handleApsExplain(body, env, corsAllowedOrigin);
    }

    if (route === "/funding-letter") {
      return handleFundingLetter(body, env, corsAllowedOrigin);
    }

    if (route === "/solar-explain") {
      return handleSolarExplain(body, env, corsAllowedOrigin);
    }

    return jsonResponse(
      { error: "Unknown route." },
      404,
      corsAllowedOrigin
    );
  }
};

async function handleSolarExplain(body, env, corsAllowedOrigin) {
  const { continuous_watts, biggest_occasional, inverter_kw, battery_kwh, daily_kwh, duration, ownership, tier, selected_appliances } = body || {};

  if (typeof inverter_kw !== "number" || typeof battery_kwh !== "number") {
    return jsonResponse({ error: "Missing system sizing numbers." }, 400, corsAllowedOrigin);
  }

  const appList = Array.isArray(selected_appliances) && selected_appliances.length
    ? selected_appliances.map(a => "- " + sanitize(String(a))).join("\n")
    : "(none specified)";

  const userPrompt = `User's calculated solar/backup setup:

System sizing:
- Inverter size: ${inverter_kw} kW
- Battery capacity: ${battery_kwh} kWh
- Continuous load: ${continuous_watts} W
- Biggest occasional peak: ${biggest_occasional} W
- Daily energy use during outage: ${daily_kwh ? daily_kwh.toFixed(1) : 0} kWh
- Backup duration target: ${duration} hours

Recommended tier: ${sanitize(tier || "")}
Ownership status: ${sanitize(ownership || "")}

Appliances they want running:
${appList}

Please respond in the four-section format. Be practical, specific to SA, and honest about tradeoffs.`;

  return runAI(env, SOLAR_SYSTEM_PROMPT, userPrompt, corsAllowedOrigin);
}

async function handleFundingLetter(body, env, corsAllowedOrigin) {
  const { bursary_name, bursary_organisation, bursary_description, field, level, average } = body || {};

  if (!bursary_name || !field) {
    return jsonResponse({ error: "Missing required information for letter draft." }, 400, corsAllowedOrigin);
  }

  const userPrompt = `Write a starter motivation letter for the following bursary application:

Bursary: ${sanitize(bursary_name)}
Organisation: ${sanitize(bursary_organisation || "")}
Bursary description: ${sanitize(bursary_description || "")}

Applicant context:
- Field of study: ${sanitize(field)}
- Year of study: ${sanitize(level || "")}
- Academic average band: ${sanitize(average || "")}

Write the 250-350 word draft letter in the structured format, followed by the "How to make this yours" personalisation guide. Use square-bracketed placeholders for things only the applicant knows.`;

  return runAI(env, FUNDING_LETTER_SYSTEM_PROMPT, userPrompt, corsAllowedOrigin);
}

async function handleHomework(body, env, corsAllowedOrigin) {
  const { grade, subject, question } = body || {};

  if (!grade || !subject || !question) {
    return jsonResponse({ error: "Please fill in all fields." }, 400, corsAllowedOrigin);
  }

  if (typeof question !== "string" || question.length > 2000) {
    return jsonResponse({ error: "Question is too long. Please keep it under 2000 characters." }, 400, corsAllowedOrigin);
  }

  if (question.trim().length < 5) {
    return jsonResponse({ error: "Please paste a longer question so we can help properly." }, 400, corsAllowedOrigin);
  }

  const userPrompt = `Grade: ${sanitize(grade)}
Subject: ${sanitize(subject)}
Homework question: ${sanitize(question)}

Please explain this in the four-section format.`;

  return runAI(env, HOMEWORK_SYSTEM_PROMPT, userPrompt, corsAllowedOrigin);
}

async function handleApsExplain(body, env, corsAllowedOrigin) {
  const { aps, faculty, subjects } = body || {};

  if (typeof aps !== "number" || aps < 0 || aps > 42) {
    return jsonResponse({ error: "Invalid APS score." }, 400, corsAllowedOrigin);
  }

  if (!faculty || typeof faculty !== "string") {
    return jsonResponse({ error: "Please choose a faculty." }, 400, corsAllowedOrigin);
  }

  let subjectSummary = "";
  if (Array.isArray(subjects) && subjects.length) {
    subjectSummary = subjects
      .map(s => `- ${sanitize(String(s.name || "Subject"))}: ${Number(s.mark) || 0}% (Level ${Number(s.level) || 0})`)
      .join("\n");
  }

  const userPrompt = `APS score: ${aps} out of 42
Faculty of interest: ${sanitize(faculty)}
${subjectSummary ? "Subject breakdown:\n" + subjectSummary : ""}

Please explain what this score means and what to do next, in the four-section format.`;

  return runAI(env, APS_SYSTEM_PROMPT, userPrompt, corsAllowedOrigin);
}

async function runAI(env, systemPrompt, userPrompt, corsAllowedOrigin) {
  try {
    const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 800,
      temperature: 0.3
    });

    const explanation = (response && response.response) ? response.response.trim() : "";

    if (!explanation) {
      return jsonResponse(
        { error: "We couldn't generate an explanation right now. Please try again." },
        502,
        corsAllowedOrigin
      );
    }

    return jsonResponse({ explanation }, 200, corsAllowedOrigin);
  } catch (err) {
    return jsonResponse(
      { error: "Something went wrong reaching the helper. Please try again in a moment." },
      500,
      corsAllowedOrigin
    );
  }
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function jsonResponse(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin)
    }
  });
}

function sanitize(input) {
  return String(input).replace(/[<>]/g, "").slice(0, 2000);
}
