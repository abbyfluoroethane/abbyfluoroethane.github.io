---
title: Projects
app_name: Projects
---

## active

{% assign active_projects = site.projects | where: "status", "active" | sort: "date" | reverse %}
{% for project in active_projects %}
  {% include project-preview.html project=project %}
{% endfor %}

## archive

{% assign archived_projects = site.projects | where: "status", "archive" | sort: "date" | reverse %}
{% if archived_projects.size > 0 %}
  {% for project in archived_projects %}
    {% include project-preview.html project=project %}
  {% endfor %}
{% else %}
  <p><em>No archived projects yet.</em></p>
{% endif %}