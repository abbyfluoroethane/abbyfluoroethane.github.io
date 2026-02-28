---
title: Blog
app_name: Blog
---

# blog posts

<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
      <span style="color: var(--theme-overlay0);">— {{ post.date | date: "%B %d, %Y" }}</span>
    </li>
  {% endfor %}
</ul>