# Toolie — One-Time Setup Guide

Step-by-step instructions to get the homepage live on `gettoolie.com` and `toolie.africa`. No command line needed.

**Time required:** about 45 minutes of clicking, plus a few hours of waiting for DNS to propagate.

---

## Step 1 — Create the GitHub repository (10 minutes)

1. Go to **github.com** and sign in.
2. Click the **+** icon in the top-right corner, then **New repository**.
3. Fill in:
   - **Repository name:** `toolie-site`
   - **Description:** `Toolie — Africa's everyday tools hub`
   - **Visibility:** Public
   - Leave everything else unchecked. Don't initialize with a README (we have one).
4. Click **Create repository**.
5. On the empty repo page, click the link **uploading an existing file**.
6. Drag and drop **all the files from this `toolie-site` folder** (including the `assets` folder if present) into the upload area.
7. Scroll down. Commit message: `Initial setup with homepage shell`.
8. Click **Commit changes**.

Your code is now on GitHub. Confirm the files are visible on the repo page.

---

## Step 2 — Connect Netlify (15 minutes)

1. Go to **netlify.com** and sign up. Use your GitHub account for easy linking.
2. Once logged in, click **Add new site** → **Import an existing project**.
3. Choose **Deploy with GitHub** as your Git provider.
4. Authorise Netlify to access your GitHub repos.
5. Select the **`toolie-site`** repo from the list.
6. Build settings — leave everything as default (no build command, publish directory `/`).
7. Click **Deploy site**.

Netlify gives you a temporary URL like `random-name-12345.netlify.app`. Click it. You should see the Toolie homepage live.

If it loads, your build pipeline is working. Big milestone.

---

## Step 3 — Connect your domains (15 minutes + DNS wait)

### gettoolie.com (your .com registrar)

1. In Netlify, go to your site → **Domain management** → **Add custom domain**.
2. Enter `gettoolie.com`. Netlify shows you DNS records to add.
3. Open another tab. Log in to wherever you registered gettoolie.com (Spaceship/Namecheap/etc.).
4. Find the DNS settings for the domain.
5. Add the records Netlify gave you. Usually:
   - An `A` record pointing to Netlify's load balancer IP, **or**
   - Replace the registrar's nameservers with Netlify's nameservers (simpler).
6. Save changes.

### toolie.africa (HostAfrica)

1. Back in Netlify, click **Add custom domain** again.
2. Enter `toolie.africa`. Netlify shows DNS records.
3. Log in to HostAfrica's control panel.
4. Find DNS management for `toolie.africa`.
5. Add the records Netlify gave you.
6. Save changes.

DNS propagation can take 1–24 hours. Keep checking. Once it's working, both domains load the same Toolie homepage.

---

## Step 4 — Set up email signup notifications (5 minutes)

The form on the homepage uses Netlify Forms (built-in, free up to 100 submissions/month).

1. In Netlify dashboard, go to your site → **Forms** in the left menu.
2. After the first form submission comes through, you'll see `signup` listed.
3. Click into it → **Form notifications** → **Email notification**.
4. Enter your email address and save.

Now whenever someone subscribes to the launch list, you get an email.

---

## What happens after setup

Once both domains load the homepage:

1. Tell me they're live.
2. We start building the first tool — the **Parent Homework Helper**.
3. I write the tool code as a single HTML file.
4. You upload it to GitHub via drag-and-drop in the web interface.
5. Netlify auto-deploys within 90 seconds.
6. The tool is live at `gettoolie.com/parent-homework`.

This is the workflow for every tool from here on. No command line, no scary terminal commands. Just drag, drop, and click.

---

## If you get stuck

Tell me where you are and what you're seeing — a screenshot of the error or the page is perfect. I can walk you through any step.
