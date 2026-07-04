---
title: Music
app_name: Music
description: a live look at what i've been listening to, pulled from last.fm.
---

# music

a live look at what i've been listening to, pulled from [last.fm](https://www.last.fm/user/{{ site.lastfm.username }}).

{% include lastfm-widget.html %}

## recently played

{% include lastfm-recent.html count=10 %}
