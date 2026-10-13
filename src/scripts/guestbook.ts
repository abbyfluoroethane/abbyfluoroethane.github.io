// the worker behind guestbook_endpoint takes a classic form POST and
// commits straight to _data/guestbook.yml via the GitHub API, then
// 302s back here with a query param — new entries show up on the next
// site rebuild, not instantly, so there is nothing to fetch/prepend here.
const status = document.getElementById("guestbook-form-status");

// A status is a square plus a label (global.css .status). It is built here
// because the text depends on the query string.
function show(kind: "ok" | "error", text: string) {
  if (!status) return;
  status.textContent = text;
  status.className = `guestbook-form-status status ${kind}`;
}
const params = new URLSearchParams(window.location.search);
const messages: Record<string, string> = {
  fields: "Please fill in your name and a message.",
  spam: "Verification failed. Please try again.",
  server: "Something went wrong. Try again later.",
};

if (status) {
  if (params.get("signed") === "true") {
    show("ok", "Thanks for signing. Your entry will appear in a minute or two.");
  } else if (params.has("error")) {
    show("error", messages[params.get("error") ?? ""] || messages.server);
  }
}

if (params.has("signed") || params.has("error")) {
  history.replaceState(null, "", window.location.pathname);
}

export {};
