# Cloudflare Worker Setup — Toolie AI

This walks you through setting up the Cloudflare Worker that powers the Parent Homework Helper. It takes about 15 minutes of clicking. After this, every AI tool we add to Toolie uses this same Worker.

You only need to do this **once**. Future tools will reuse this same Worker.

---

## Before you start

You'll need:
- Your Cloudflare account (the one you used for gettoolie.com DNS)
- This `worker.js` file open in another tab so you can copy from it

---

## Step 1 — Create the Worker (5 minutes)

1. Go to **dash.cloudflare.com** and log in
2. In the left sidebar, click **Workers & Pages**
3. Click the blue **Create application** button (top right)
4. Pick **Create Worker** (the option, not "Pages")
5. Cloudflare will suggest a name. **Change it to `toolie-ai`** and click **Deploy**

   Cloudflare creates a starter Worker with a "Hello World" message. We'll replace this.

6. After it deploys, click **Edit code** (or the pencil icon)
7. You'll see a code editor with the default Worker code
8. **Select all** the existing code (Ctrl+A) and **delete it**
9. Open the `worker.js` file from this folder and **copy ALL of it**
10. **Paste it** into the Cloudflare code editor
11. Click **Save and deploy** (top right)

The Worker is now live at a URL like:
```
https://toolie-ai.YOUR-SUBDOMAIN.workers.dev
```

**Copy that URL — you'll need it in Step 3.** It usually shows at the top of the Worker page.

---

## Step 2 — Bind Workers AI to the Worker (3 minutes)

The Worker needs permission to call Cloudflare's AI service. We do this through a "binding".

1. In your Worker page, click **Settings** (top tab)
2. Scroll to **Bindings** (or **Variables and Secrets** depending on Cloudflare's UI)
3. Click **Add binding** → **Workers AI**
4. Variable name: type `AI` (exactly two letters, capital, no quotes)
5. Click **Save** or **Deploy**

That's it for AI binding. The Worker can now call Llama 3 models for free (within Cloudflare's generous free tier).

---

## Step 3 — Connect the Worker to your homepage tool (3 minutes)

Now we tell the Toolie homepage where the Worker lives.

1. Open `homework.html` in a text editor (or directly on GitHub via the pencil-edit option)
2. Find this line near the bottom:
   ```javascript
   const WORKER_URL = "https://toolie-ai.YOUR-SUBDOMAIN.workers.dev/homework";
   ```
3. Replace `YOUR-SUBDOMAIN` with your actual Cloudflare Workers subdomain. The URL should look like the one Cloudflare gave you in Step 1, with `/homework` at the end.

   Example: if your Worker URL is `https://toolie-ai.chipo21jan.workers.dev`, the line becomes:
   ```javascript
   const WORKER_URL = "https://toolie-ai.chipo21jan.workers.dev/homework";
   ```

4. Save the file
5. Commit the change to GitHub (or upload via web)
6. Netlify auto-deploys within 90 seconds

---

## Step 4 — Test it (2 minutes)

1. Visit **gettoolie.com/homework** in a browser
2. Pick a grade and subject
3. Paste a real homework question (or test with: "What is 7 x 8 and how do I explain multiplication to my child?")
4. Click **Help me understand**
5. You should see a four-section explanation appear within 5-10 seconds

If it works — congratulations, you have a live AI tool. Tell a friend who has primary-school kids.

---

## Troubleshooting

**"Couldn't reach the helper" error:**
- Check that the WORKER_URL in homework.html matches your actual Worker URL exactly
- Make sure you included `/homework` at the end
- Make sure the Worker AI binding is set up (Step 2)

**"500" or empty response:**
- Go back to Cloudflare → Workers → your Worker → **Logs** (top tab)
- Look at the recent log entry — it'll tell you what failed
- Most common: AI binding not added or named wrong (must be exactly `AI`)

**CORS errors in browser console:**
- The Worker only allows requests from gettoolie.com, www.gettoolie.com, toolie.africa, www.toolie.africa, and toolie-site.netlify.app
- If you're testing from somewhere else, you'll need to add that domain to the `ALLOWED_ORIGINS` array in worker.js

---

## What this costs

Cloudflare Workers AI free tier (as of 2026): roughly 10,000 neurons per day at no charge. Each homework explanation uses around 100-300 neurons depending on length, so you can serve thousands of homework questions per day before hitting any limit. Beyond the free tier it's about $0.011 per 1,000 neurons — so even at heavy usage, costs stay tiny.

The Worker itself is also free up to 100,000 requests per day on Cloudflare's free plan.

So in practice: **R0/month for the foreseeable future.**

---

## Reusing this Worker for future tools

When we build more AI tools (the APS calculator's "explain my score", the Funded Learning Path's matcher, etc.), we'll add new routes to this same Worker file. You won't need to set up a new Worker — just paste in updated code and redeploy.

For example, future routes might look like:
- `/homework` (current)
- `/funded-learning` 
- `/aps-explain`
- `/lobola-guide`

All running through the same `toolie-ai` Worker.

---

If you get stuck on any step, take a screenshot of where you are and ping me. We'll get it working.
