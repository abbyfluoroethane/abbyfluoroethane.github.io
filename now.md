---
title: Now
app_name: Extras
---

# Now

*This is a [/now page](https://nownownow.com/about). It tells you what I'm focused on at this point in my life.*

*Last updated: March 2026*

## Work

- I work at [Blue Origin](https://blueorigin.com), where I help build New Glenn.

## Projects

{% assign active_projects = site.projects | where: "status", "active" | sort: "date" | reverse %}
{% for project in active_projects %}
  {% include project-preview.html project=project %}
{% endfor %}

## Interests

- Engineering
- Building tools to make complex tasks simple
- Music — check out what I've been listening to on the [home page](/)

---

*This page is part of the [nownownow.com](https://nownownow.com/) movement. If you have a site, consider making your own /now page.*
