---
layout: default
title: blog
permalink: /blog/
---

<div class="card-grid">
{% for post in site.posts %}
  {% include post-card.html post=post %}
{% endfor %}
</div>
