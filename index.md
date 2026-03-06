---
title: ~/abbyfluoroethane
app_name: Home
description: i build things that go to space, break things that stay on earth, and occasionally muse about my thoughts.
---

# haii, i'm abby :3

welcome to my little corner of the internet. i build things that go to space, break things that stay on earth, and occasionally muse about my thoughts.

## things i like

- new glenn
- f-35 lightning ii
- fedora linux
- my wife

## what i'm listening to

{% include lastfm-widget.html %}

## latest post

{% include latest-post.html %}

## featured projects

{% assign featured_projects = site.projects | where: "featured", true | sort: "date" | reverse %}
{% for project in featured_projects %}
  {% include project-preview.html project=project %}
{% endfor %}

## contact me!

[fedi | dormsoc](https://dorm.social/@abbyfluoroethane)<br>
[inst*gram](https://instagram.com/abbyfluoroethane)<br>
email: abby@bigaouette.com
