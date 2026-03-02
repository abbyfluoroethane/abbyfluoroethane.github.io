// Cloudflare Worker: Guestbook submission handler
// Receives form POSTs, validates input, and commits new entries
// to _data/guestbook.yml via the GitHub API.
//
// Environment variables (set as Worker secrets):
//   GITHUB_TOKEN   — fine-grained PAT with Contents read/write
//   ALLOWED_ORIGIN — e.g. https://bigaouette.com

const REPO_OWNER = "abbyfluoroethane";
const REPO_NAME = "abbyfluoroethane.github.io";
const FILE_PATH = "_data/guestbook.yml";
const GUESTBOOK_URL = "https://bigaouette.com/guestbook";

const MAX_NAME = 100;
const MAX_WEBSITE = 200;
const MAX_MESSAGE = 1000;

function stripHtml(str) {
  return str.replace(/<[^>]*>/g, "");
}

function sanitize(str, maxLength) {
  return stripHtml(str).trim().slice(0, maxLength);
}

function isValidUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// Escape a YAML string value — wrap in double quotes, escape inner quotes and backslashes
function yamlEscape(str) {
  return '"' + str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n") + '"';
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function redirect(path) {
  return new Response(null, {
    status: 302,
    headers: { Location: path },
  });
}

export default {
  async fetch(request, env) {
    // Only accept POST
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(env.ALLOWED_ORIGIN),
      });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // CORS origin check
    const origin = request.headers.get("Origin");
    if (origin && origin !== env.ALLOWED_ORIGIN) {
      return new Response("Forbidden", { status: 403 });
    }

    let formData;
    try {
      formData = await request.formData();
    } catch {
      return redirect(`${GUESTBOOK_URL}?error=fields`);
    }

    // Honeypot check — the "url" field should be empty (real website field is "website")
    const honeypot = formData.get("url") || "";
    if (honeypot.length > 0) {
      // Bot detected — silent redirect, no commit
      return redirect(GUESTBOOK_URL);
    }

    // Extract and validate fields
    const rawName = formData.get("name") || "";
    const rawWebsite = formData.get("website") || "";
    const rawMessage = formData.get("message") || "";

    const name = sanitize(rawName, MAX_NAME);
    const website = sanitize(rawWebsite, MAX_WEBSITE);
    const message = sanitize(rawMessage, MAX_MESSAGE);

    if (!name || !message) {
      return redirect(`${GUESTBOOK_URL}?error=fields`);
    }

    if (website && !isValidUrl(website)) {
      return redirect(`${GUESTBOOK_URL}?error=fields`);
    }

    // Build YAML entry
    const date = todayISO();
    let entry = `- name: ${yamlEscape(name)}\n`;
    if (website) {
      entry += `  website: ${yamlEscape(website)}\n`;
    }
    entry += `  date: ${yamlEscape(date)}\n`;
    entry += `  message: ${yamlEscape(message)}\n`;

    // Fetch current file from GitHub
    const apiBase = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
    const headers = {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "guestbook-worker",
    };

    let fileSha, existingContent;
    try {
      const res = await fetch(apiBase, { headers });
      if (!res.ok) {
        console.error("GitHub GET failed:", res.status, await res.text());
        return redirect(`${GUESTBOOK_URL}?error=server`);
      }
      const data = await res.json();
      fileSha = data.sha;
      existingContent = atob(data.content.replace(/\n/g, ""));
    } catch (err) {
      console.error("GitHub GET error:", err);
      return redirect(`${GUESTBOOK_URL}?error=server`);
    }

    // Append new entry
    const updatedContent = existingContent.trimEnd() + "\n" + entry;

    // Commit updated file
    try {
      const res = await fetch(apiBase, {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `guestbook: new entry from ${name}`,
          content: btoa(unescape(encodeURIComponent(updatedContent))),
          sha: fileSha,
        }),
      });
      if (!res.ok) {
        console.error("GitHub PUT failed:", res.status, await res.text());
        return redirect(`${GUESTBOOK_URL}?error=server`);
      }
    } catch (err) {
      console.error("GitHub PUT error:", err);
      return redirect(`${GUESTBOOK_URL}?error=server`);
    }

    return redirect(`${GUESTBOOK_URL}?signed=true`);
  },
};

function corsHeaders(allowedOrigin) {
  return {
    "Access-Control-Allow-Origin": allowedOrigin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
