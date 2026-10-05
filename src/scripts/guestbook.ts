// the worker behind guestbook_endpoint takes a classic form POST and
// commits straight to _data/guestbook.yml via the GitHub API, then
// 302s back here with a query param — new entries show up on the next
// site rebuild, not instantly, so there is nothing to fetch/prepend here.
const status = document.getElementById("guestbook-form-status");
const params = new URLSearchParams(window.location.search);
const messages: Record<string, string> = {
  fields: "please fill in your name and a message.",
  spam: "verification failed — please try again.",
  server: "something went wrong, try again later.",
};

if (status) {
  if (params.get("signed") === "true") {
    status.textContent = "thanks for signing! your entry will appear in a minute or two.";
    status.classList.add("is-success");
  } else if (params.has("error")) {
    status.textContent = messages[params.get("error") ?? ""] || messages.server;
    status.classList.add("is-error");
  }
}

if (params.has("signed") || params.has("error")) {
  history.replaceState(null, "", window.location.pathname);
}

export {};
