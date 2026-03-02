---
title: Guestbook
app_name: Extras
---

<div class="guestbook-clarus">
  <img src="{{ '/assets/images/clarus.png' | relative_url }}" alt="Clarus the Dogcow">
  <p>Moof!</p>
</div>

{% include guestbook-form.html %}

---

{% for entry in site.data.guestbook %}
<div class="guestbook-entry">
  <div class="guestbook-entry-header">
    <strong>{% if entry.website %}<a href="{{ entry.website }}">{{ entry.name }}</a>{% else %}{{ entry.name }}{% endif %}</strong>
    <span class="guestbook-entry-date">{{ entry.date }}</span>
  </div>
  <p>{{ entry.message }}</p>
</div>
{% endfor %}
