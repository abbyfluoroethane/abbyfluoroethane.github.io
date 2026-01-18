---
title: ~/abbyfluoroethane
app_name: Home
---

# haii, i'm abby :3

welcome to my little corner of the internet. i build things that go to space, break things that stay on earth, and occasionally muse about my thoughts.

## what i do

i currently work as a technician at blue origin, where i help build new glenn. outside of work i build (small) rockets, write, and take pictures of things that fly. meow nyayayayayana meow mrrp meow.

## things i like

- new glenn
- f-35 lightning ii
- fedora linux
- my wife

## what i'm listening to

{% include lastfm-widget.html %}

## featured projects

{% assign featured_projects = site.projects | where: "featured", true | sort: "date" | reverse %}
{% for project in featured_projects %}
  {% include project-preview.html project=project %}
{% endfor %}

## contact me!

[fedi | dormsoc](https://dorm.social/@abbyfluoroethane)<br>
[inst*gram](https://instagram.com/abbyfluoroethane)<br>
email: abby@bigaouette.com
