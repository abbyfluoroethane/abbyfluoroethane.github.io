---
layout: post
app_name: extras
title: markdown
date: 2026-08-19
permalink: /extras/markdown/
description: every markdown construct this site can emit, on one page, to find the gaps in the stylesheet.
sitemap: false
---

Every construct kramdown can emit, in the same layout a blog post renders in,
so a gap in `site.css` has somewhere to show itself. Anything that looks wrong
here is a finding, not a bug in the page. A handful of things below are
labelled as known non-features — kramdown not supporting a syntax is a
different problem from the stylesheet not covering it.

* placeholder for the generated list
{:toc}

## headings

# h1 — the quick brown fox
## h2 — the quick brown fox
### h3 — the quick brown fox
#### h4 — the quick brown fox
##### h5 — the quick brown fox
###### h6 — the quick brown fox

Only `h1`, `h2` and `h3` have rules under `main` today; `h4`–`h6` are here to
show what they fall back to. The `h1` above is the second on the page — the
post title in the sidebar is the first.

### a heading directly above a paragraph

Text immediately after a heading, to check the spacing between them.

### a heading directly above a list

- first item
- second item

## inline text

Plain text with *emphasis*, **strong**, ***both at once***, ~~struck
through~~, `inline code`, and a [link](https://example.com). A link [with a
title](https://example.com "hover me"), a [reference link][ref], an autolink
<https://example.com/autolinked>, a bare URL https://example.com/bare, and an
email <hello@example.com>.

[ref]: https://example.com "reference target"

Inline HTML the stylesheet may or may not cover: <kbd>Ctrl</kbd> +
<kbd>C</kbd>, <mark>highlighted text</mark>, <abbr title="HyperText Markup
Language">HTML</abbr>, H<sub>2</sub>O, e = mc<sup>2</sup>, <small>small
print</small>, <q>a quotation</q>, <cite>a citation</cite>, <ins>inserted</ins>
and <del>deleted</del>, <var>x</var>, <samp>program output</samp>, and a
<time datetime="2026-08-19">timestamp</time>.

Typography from kramdown: an em dash --- like that, an en dash 1--10, an
ellipsis ... and "double quotes" with 'single quotes' inside. This site sets
`smart_quotes` to leave quotes straight, so they should stay straight while
the dashes and ellipsis still convert.

A hard line break made with two trailing spaces:  
this sits on its own line.

A hard line break made with a trailing backslash:\
this also sits on its own line.

Escaped characters: \*not emphasis\*, \_not emphasis\_, \`not code\`, and a
literal backslash \\. Entities: &amp; &lt; &gt; &copy; &mdash; &hellip;.

## blockquotes

> A single-line blockquote.

> A blockquote with two paragraphs.
>
> This is the second one, long enough to wrap onto more than one line so the
> left edge and the line height are both visible.

> A blockquote containing other things.
>
> ### a heading inside a quote
>
> - a list inside a quote
> - a second item
>
> ```js
> // a code block inside a quote
> const inside = true;
> ```
>
> | a | table |
> |---|-------|
> | 1 | 2     |

> Nesting.
>
> > One level deep.
> >
> > > Two levels deep, which is where indentation and border stacking tend to
> > > come apart.

> The attribution pattern posts tend to use.
>
> — someone worth quoting

## lists

### unordered, nested three deep

- first level
- another first level item, written long enough that it wraps and shows how a
  continuation line aligns against its own marker
  - second level
  - another second level
    - third level
    - another third level
- back to first level

### ordered, nested

1. first
2. second
   1. nested first
   2. nested second
      1. deeper first
      2. deeper second
3. third

### ordered, starting elsewhere

5. five
6. six
7. seven

### mixed

1. an ordered item
   - with an unordered child
   - and another
2. a second ordered item
   1. with an ordered child
      - and an unordered grandchild

### tight versus loose

A tight list:

- one
- two
- three

A loose list, where each item becomes its own paragraph:

- one

- two

- three

### task list

- [x] a completed task
- [ ] an incomplete task
- [ ] a third task, long enough to wrap so the checkbox alignment against a
  second line is visible

### a list item carrying everything

1. An item that opens with a paragraph.

   A second paragraph inside the same item.

   > A blockquote inside a list item.

   ```python
   # a code block inside a list item
   def nested():
       return True
   ```

   | inside | a list |
   |--------|--------|
   | table  | cell   |

   - a nested list to close it out

2. The item after all that, to confirm numbering survives.

### definition list

kramdown
: A markdown engine with several extensions GFM does not have. This
  definition is deliberately long so the wrapping of a `dd` is visible.

rouge
: The syntax highlighter GitHub Pages configures by default.

term with two definitions
: the first definition
: the second definition

## code

Inline `code`, inline code containing a backtick `` ` ``, and inline code with
a long token like `NSApplicationDidFinishLaunchingNotification` that may need
to break.

A fenced block with a language, which rouge highlights:

```js
// javascript
const endpoint = "https://ws.audioscrobbler.com/2.0/";
async function recent(user, key, limit = 10) {
  const r = await fetch(`${endpoint}?user=${user}&api_key=${key}&limit=${limit}`);
  if (!r.ok) throw new Error(`last.fm said ${r.status}`);
  return (await r.json()).recenttracks.track;
}
```

```python
# python
from dataclasses import dataclass

@dataclass
class Track:
    name: str
    artist: str
    played_at: int | None = None

    def caption(self) -> str:
        return f"{self.name} — {self.artist}"
```

```css
/* css */
.art-layer {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.6s ease;
}
```

```bash
# shell
bundle exec jekyll serve --watch --port 4000 \
  | grep --line-buffered -E 'Regenerating|error'
```

```json
{
  "recenttracks": {
    "track": [{ "name": "a song", "artist": { "#text": "a band" } }]
  }
}
```

```diff
- var TEXT_FADE = 300;
+ var TEXT_SWAP = ART_FADE / 2;
```

{% raw %}
```liquid
{% for entry in site.data.guestbook reversed %}
  <p>{{ entry.name | escape }}</p>
{% endfor %}
```
{% endraw %}

A fenced block with no language given:

```
plain text in a fence, no highlighting requested
second line
```

A block indented by four spaces instead of fenced:

    indented code block
    second line

A block with a very long line, which is the horizontal overflow test — it
should scroll inside its own box rather than widening the page:

```
this_is_a_single_unbroken_line_of_code_that_runs_well_past_the_width_of_the_column_to_see_whether_the_block_scrolls_on_its_own_or_pushes_the_whole_page_sideways_which_would_be_the_bug
```

## tables

A plain table:

| column | column | column |
|--------|--------|--------|
| cell   | cell   | cell   |
| cell   | cell   | cell   |

Alignment, set by the delimiter row:

| left | centre | right |
|:-----|:------:|------:|
| a    | b      | c     |
| longer cell | longer cell | longer cell |

Formatting inside cells, and a row that opens with an empty one:

| construct | example | note |
|-----------|---------|------|
| emphasis | *em* and **strong** | |
| code | `inline()` | backticks survive |
| link | [a link](https://example.com) | |
| | | this row starts empty |

A wide table, the second horizontal overflow test:

| id | name | artist | album | played | duration | source | loved | tags | mbid |
|----|------|--------|-------|--------|----------|--------|-------|------|------|
| 1 | a fairly long track name | a fairly long artist name | a fairly long album name | 19 Aug 2026, 07:12 | 3:41 | last.fm | no | electronic, remix | 0000-0000 |
| 2 | another track | another artist | another album | 19 Aug 2026, 07:08 | 4:02 | last.fm | yes | ambient | 1111-1111 |

## horizontal rules

Three hyphens:

---

Three asterisks:

***

Three underscores:

___

## images

An image on its own:

![Boeing 737 on approach to SFO]({{ '/assets/images/sfo-landing.jpg' | relative_url }})

An image with a title, wrapped in a link:

[![MacBook Neo]({{ '/assets/images/macbook-neo.jpg' | relative_url }} "the title attribute")](https://example.com)

An image inline in a sentence — ![the last.fm mark]({{ '/assets/images/lastfm.svg' | relative_url }}) — sitting among text.

An image whose source does not resolve, so only the alt text is left:

![this alt text is all that should render]({{ '/assets/images/does-not-exist.png' | relative_url }})

The site's own image helpers, which posts use as raw HTML rather than through
markdown:

<div class="img-pair">
  <img src="{{ '/assets/images/macbook-unibody.jpg' | relative_url }}" alt="MacBook 2010" loading="lazy" decoding="async">
  <img src="{{ '/assets/images/macbook-neo.jpg' | relative_url }}" alt="MacBook Neo" loading="lazy" decoding="async">
</div>

<div class="img-float-right">
  <img src="{{ '/assets/images/sfo-landing.jpg' | relative_url }}" alt="Boeing 737 on approach to SFO" loading="lazy" decoding="async">
</div>

Text set beside a right-floated image. This paragraph needs to run long enough
to actually wrap around the float, otherwise the helper has nothing to prove.
The float should clear before the next heading, and the text should not crowd
the image's edge.

<div class="img-float-left">
  <img src="{{ '/assets/images/macbook-unibody.jpg' | relative_url }}" alt="MacBook 2010" loading="lazy" decoding="async">
</div>

The same again on the left, with another paragraph long enough to wrap past
the bottom of the image so the clearing behaviour is visible either way.

## raw html blocks

<figure>
  <img src="{{ '/assets/images/macbook-neo.jpg' | relative_url }}" alt="MacBook Neo" loading="lazy" decoding="async">
  <figcaption>A figure with a caption, which markdown has no syntax for.</figcaption>
</figure>

<details>
  <summary>A collapsed disclosure — click to open</summary>
  <p>The contents, which should be readable and indented sensibly once open.</p>
</details>

<dl>
  <dt>a hand-written definition term</dt>
  <dd>and its definition, written as HTML rather than kramdown syntax</dd>
</dl>

<pre>
a raw pre block
  with its own    spacing preserved
</pre>

## footnotes

Footnotes are a kramdown extension.[^first] They collect at the end of the
article, in a `div.footnotes` with its own ordered list and return arrows.[^second]

[^first]: The first footnote, with a [link](https://example.com) inside it.
[^second]:
    The second footnote, written across two paragraphs.

    This is the second paragraph of it.

## math

**Known non-feature.** GitHub Pages sets `math_engine` to MathJax, but no
MathJax script is loaded on this site, so kramdown's output is left as bare
LaTeX delimiters in the text — `\(` … `\)` inline and `\[` … `\]` for display.
Both should appear below as literal source rather than as equations. Styling
cannot fix this; loading MathJax, or turning the engine off, would.

Inline: $$e^{i\pi} + 1 = 0$$

Display:

$$
\int_{0}^{\infty} e^{-x^2}\,dx = \frac{\sqrt{\pi}}{2}
$$

## edge cases

A very long unbroken token, which is the word-wrapping test:

Supercalifragilisticexpialidociousandthensomemoreletterstopushitwellpastthecolumnwidth

A very long link, same test but as an anchor:

<https://example.com/an/absurdly/long/path/that/keeps/going/and/going/until/it/is/far/wider/than/the/column/it/sits/in>

A paragraph, then a blockquote, then a paragraph, with nothing between them:

> the blockquote in question

Back to a paragraph.

Two blockquotes separated only by a blank line, which should stay two boxes
rather than merging into one:

> the first

> the second

A list interrupted by a paragraph, which restarts the numbering:

1. one
2. two

a paragraph in between

1. one again
2. two again

A bullet with nothing after it — **known non-feature**, kramdown treats a bare
`-` as a paragraph rather than an empty list item, so only the second line
below becomes a list:

-
- a normal item

Emoji and non-latin text: 🎧 🛰️ ✅ — こんにちは — Здравствуйте — مرحبا.
