---
layout: default
title: gallery
permalink: /gallery/
---

<div class="gallery-grid">
{% for img in site.data.gallery %}
  <a class="gallery-item" href="{{ '/assets/images/gallery/' | append: img.filename | relative_url }}" target="_blank" rel="noopener">
    <img src="{{ '/assets/images/gallery/' | append: img.filename | relative_url }}" alt="{{ img.alt }}" loading="lazy">
    {% if img.caption %}<span class="gallery-caption">{{ img.caption }}</span>{% endif %}
  </a>
{% endfor %}
</div>
