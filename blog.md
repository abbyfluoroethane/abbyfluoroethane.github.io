---
title: Blog
app_name: Blog
---

# blog posts

{% for post in site.posts %}
  {% include post-card.html post=post %}
{% endfor %}