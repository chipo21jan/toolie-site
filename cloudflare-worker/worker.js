/**
 * Toolie AI Worker
 *
 * Cloudflare Worker that powers Toolie's AI tools.
 * Currently handles:
 *   POST /homework  →  Parent Homework Helper
 *
 * Deploy this in Cloudflare → Workers & Pages.
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
    if (url.pathname !== "/homework" && url.pathname !== "/homework/") {
      return jsonResponse(
        { error: "Unknown route." },
        404,
        corsAllowedOrigin
      );
    }

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

    const { grade, subject, question } = body || {};

    // Validation
    if (!grade || !subject || !question) {
      return jsonResponse(
        { error: "Please fill in all fields." },
        400,
        corsAllowedOrigin
      );
    }

    if (typeof question !== "string" || question.length > 2000) {
      return jsonResponse(
        { error: "Question is too long. Please keep it under 2000 characters." },
        400,
        corsAllowedOrigin
      );
    }

    if (question.trim().length < 5) {
      return jsonResponse(
        { error: "Please paste a longer question so we can help properly." },
        400,
        corsAllowedOrigin
      );
    }

    const userPrompt = `Grade: ${sanitize(grade)}
Subject: ${sanitize(subject)}
Homework question: ${sanitize(question)}

Please explain this in the four-section format.`;

    try {
      const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
        messages: [
          { role: "system", content: HOMEWORK_SYSTEM_PROMPT },
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
};

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
  // Strip basic HTML/script characters to keep prompts clean.
  // Workers AI handles the rest. Defense in depth.
  return String(input).replace(/[<>]/g, "").slice(0, 2000);
}
