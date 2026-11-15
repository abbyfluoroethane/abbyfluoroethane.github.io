// the worker behind guestbook_endpoint takes a classic form POST and
// commits straight to _data/guestbook.yml via the GitHub API, then
// 302s back here with a query param — new entries show up on the next
// site rebuild, not instantly, so there is nothing to fetch/prepend here.
const status = document.getElementById("guestbook-form-status");
const form = document.querySelector<HTMLFormElement>("#guestbook-form");

// A status is a square plus a label (fluorokit .fk-status). It is built here
// because the text depends on the query string.
function show(kind: "ok" | "error", text: string) {
  if (!status) return;
  status.textContent = text;
  status.className = `guestbook-form-status fk-status ${kind}`;
}
const params = new URLSearchParams(window.location.search);
const messages: Record<string, string> = {
  fields: "Please fill in your name and a message.",
  spam: "Verification failed. Your message is still here: please try again.",
  server: "Something went wrong. Your message is still here: try again later.",
};

// the POST leaves the page, so a failed attempt would come back to an empty
// form. what was typed is kept for the tab's lifetime and put back when the
// worker returns an error; a successful signing clears it.
const DRAFT_KEY = "guestbook-draft";
const DRAFT_FIELDS = ["name", "website", "message"] as const;
type Field = HTMLInputElement | HTMLTextAreaElement;
const field = (name: string) => form?.elements.namedItem(name) as Field | null;

function saveDraft(): void {
  try {
    const draft = Object.fromEntries(DRAFT_FIELDS.map((n) => [n, field(n)?.value ?? ""]));
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // storage blocked: the form still submits, it just cannot be restored
  }
}

function restoreDraft(): void {
  try {
    const draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "null") as Record<string, unknown> | null;
    if (!draft) return;
    DRAFT_FIELDS.forEach((n) => {
      const input = field(n);
      if (input && typeof draft[n] === "string") input.value = draft[n];
    });
  } catch {
    // nothing to restore
  }
}

function clearDraft(): void {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // nothing to clear
  }
}

form?.addEventListener("submit", saveDraft);

if (params.get("signed") === "true") {
  clearDraft();
  show("ok", "Thanks for signing. Your entry will appear in a minute or two.");
} else if (params.has("error")) {
  restoreDraft();
  show("error", messages[params.get("error") ?? ""] || messages.server);
}

if (params.has("signed") || params.has("error")) {
  history.replaceState(null, "", window.location.pathname);
}

export {};
