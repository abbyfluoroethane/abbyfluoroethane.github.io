---
layout: default
title: projects
permalink: /projects/
---

## active

<div class="card-grid">
{% assign active_projects = site.projects | where: "status", "active" | sort: "date" | reverse %}
{% for project in active_projects %}
  {% include project-card.html project=project %}
{% endfor %}
</div>

## archive

<div class="card-grid">
{% assign archived_projects = site.projects | where: "status", "archive" | sort: "date" | reverse %}
{% for project in archived_projects %}
  {% include project-card.html project=project %}
{% endfor %}
</div>
