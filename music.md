---
layout: default
title: music
permalink: /music/
description: a live look at what i've been listening to, pulled from last.fm.
---

<div class="post-layout">
  <aside class="post-meta">
    <p class="post-date">live from <a href="https://www.last.fm/user/abby_isnthere">last.fm</a></p>
    {% include lastfm-widget.html id="lastfm-now" count=11 history_id="lastfm-history" %}
  </aside>
  <article class="post-content">
    <h2>history</h2>
    <div class="card-grid" id="lastfm-history">
      <p class="lastfm-status">loading…</p>
    </div>
  </article>
</div>
