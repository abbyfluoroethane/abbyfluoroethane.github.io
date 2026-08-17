---
layout: default
title: gallery
permalink: /gallery/
---

<div class="gallery-grid">
{% for img in site.data.gallery %}
  {%- comment -%}
    when the alt text is identical to the visible caption, the image is
    decorative for screen-reader purposes — announcing both just repeats
    the same sentence twice. alts that say something the caption doesn't
    ("view 2") are kept.

    the first row is above the fold, so those load eagerly; the rest stay
    lazy. .gallery-item's aspect-ratio already reserves the space, so no
    width/height is needed to avoid layout shift.
  {%- endcomment -%}
  {% assign img_src = '/assets/images/gallery/' | append: img.filename | relative_url %}
  {% if img.caption and img.alt == img.caption %}{% assign img_alt = '' %}{% else %}{% assign img_alt = img.alt %}{% endif %}
  <a class="gallery-item" href="{{ img_src }}" target="_blank" rel="noopener">
    <img src="{{ img_src }}" alt="{{ img_alt | escape }}" loading="{% if forloop.index <= 4 %}eager{% else %}lazy{% endif %}" decoding="async">
    {% if img.caption %}<span class="gallery-caption">{{ img.caption | escape }}</span>{% endif %}
  </a>
{% endfor %}
</div>
