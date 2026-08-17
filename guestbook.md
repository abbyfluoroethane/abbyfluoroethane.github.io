---
layout: default
title: guestbook
permalink: /guestbook/
---

<div class="post-layout">
  <aside class="post-meta">
    <h2>sign the guestbook</h2>
    <p id="guestbook-form-status" class="guestbook-form-status"></p>
    <form id="guestbook-form" class="guestbook-form" action="{{ site.guestbook_endpoint }}" method="POST">
      <div class="guestbook-honeypot" aria-hidden="true">
        <label for="guestbook-url">leave this empty</label>
        <input type="text" id="guestbook-url" name="url" tabindex="-1" autocomplete="off">
      </div>
      <label>name <input type="text" name="name" required maxlength="100"></label>
      <label>website (optional)<input type="url" name="website" maxlength="200"></label>
      <label>message <textarea name="message" required maxlength="1000" rows="3"></textarea></label>
      <div class="cf-turnstile" data-sitekey="{{ site.guestbook_turnstile_sitekey }}" data-theme="auto"></div>
      <button type="submit" class="btn">sign the guestbook</button>
    </form>
  </aside>
  <article class="post-content">
    <h2>entries</h2>
    <div class="card-grid" id="guestbook-entries">
      {% for entry in site.data.guestbook %}
      {%- comment -%}
        entries are visitor-submitted (form -> worker -> _data/guestbook.yml),
        so everything here is escaped, and the website link is restricted to
        http(s) — splitting on "://" means anything without an absolute
        http(s) scheme (javascript:, data:, protocol-relative //host) fails
        the check and renders as plain text instead of a link.
      {%- endcomment -%}
      {% assign gb_url = "" %}
      {% if entry.website %}
        {% assign gb_scheme = entry.website | strip | split: '://' | first | downcase %}
        {% if gb_scheme == 'http' or gb_scheme == 'https' %}
          {% assign gb_url = entry.website | strip %}
        {% endif %}
      {% endif %}
      <div class="card guestbook-entry">
        <div class="guestbook-entry-header">
          <strong>{% if gb_url != "" %}<a href="{{ gb_url | escape }}" rel="nofollow ugc noopener">{{ entry.name | escape }}</a>{% else %}{{ entry.name | escape }}{% endif %}</strong>
          <span class="guestbook-entry-date">{{ entry.date | escape }}</span>
        </div>
        <p>{{ entry.message | escape }}</p>
      </div>
      {% endfor %}
    </div>
  </article>
</div>

<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
<script>
(function () {
  // the worker behind guestbook_endpoint takes a classic form POST and
  // commits straight to _data/guestbook.yml via the GitHub API, then
  // 302s back here with a query param — new entries show up on the next
  // site rebuild, not instantly, so there is nothing to fetch/prepend here.
  var status = document.getElementById("guestbook-form-status");
  var params = new URLSearchParams(window.location.search);
  var messages = {
    fields: "please fill in your name and a message.",
    spam: "verification failed — please try again.",
    server: "something went wrong, try again later.",
  };

  if (params.get("signed") === "true") {
    status.textContent = "thanks for signing! your entry will appear in a minute or two.";
    status.classList.add("is-success");
  } else if (params.has("error")) {
    status.textContent = messages[params.get("error")] || messages.server;
    status.classList.add("is-error");
  }

  if (params.has("signed") || params.has("error")) {
    history.replaceState(null, "", window.location.pathname);
  }
})();
</script>
