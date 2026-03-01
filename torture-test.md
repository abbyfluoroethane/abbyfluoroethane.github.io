---
title: Markdown Torture Test
app_name: Torture Test
---

# heading 1
## heading 2
### heading 3

---

## inline formatting

this is **bold**, this is *italic*, this is ***bold italic***, this is ~~strikethrough~~, and this is `inline code`. here's a [link to nowhere](#) and an [external link](https://example.com). you can also do __underscored bold__ and _underscored italic_.

superscript won't work in standard markdown but let's try HTML: E = mc<sup>2</sup> and H<sub>2</sub>O.

## paragraphs and line breaks

this is the first paragraph. it has multiple sentences to test how body text wraps at various viewport widths. lorem ipsum dolor sit amet, consectetur adipiscing elit. sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

this is the second paragraph, separated by a blank line. it should have proper spacing above and below.

this line has a
hard break (two trailing spaces) right before "hard".

## blockquotes

> this is a blockquote. it should be visually distinct from body text.

> this is a multi-paragraph blockquote.
>
> second paragraph inside the quote.
>
> > nested blockquote — does this render?

## unordered lists

- item one
- item two
  - nested item 2a
  - nested item 2b
    - deeply nested item
- item three

alternate syntax:

* asterisk item
* another one
  * nested asterisk

## ordered lists

1. first item
2. second item
   1. nested ordered 2a
   2. nested ordered 2b
3. third item

starting at arbitrary numbers:

5. fifth
6. sixth
7. seventh

## mixed lists

1. ordered first
   - unordered child
   - another child
2. ordered second
   1. ordered child
      - unordered grandchild

## task lists

- [x] completed task
- [ ] incomplete task
- [x] another done
- [ ] still todo

## code blocks

inline: `const x = 42;`

fenced with language:

```javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// does syntax highlighting work?
const result = fibonacci(10);
console.log(`fib(10) = ${result}`);
```

```css
.torture-test {
  display: flex;
  align-items: center;
  background: var(--secondary);
  border: 2px solid var(--primary);
  /* long line to test horizontal overflow in code blocks — does this scroll or wrap? what happens when the content extends beyond the visible area of the window pane? */
}
```

```python
def hello():
    """a python block for variety"""
    return "hello, world!"
```

fenced with no language:

```
this is a plain code block
  with preserved indentation
    and no syntax highlighting
```

indented code block (4 spaces):

    this should also render
    as a code block
    in most markdown parsers

## links

- [regular link](#)
- [link with title](# "hover me")
- <https://autolinked-url.example.com>
- bare URL (if GFM): https://example.com

reference-style: [click here][ref1] and [also here][ref2].

[ref1]: # "reference link 1"
[ref2]: # "reference link 2"

## images

a small inline SVG badge (if available):

![placeholder](https://via.placeholder.com/200x100.png "placeholder image")

an image that doesn't exist (error state):

![broken image](/assets/images/this-does-not-exist.png)

## tables

| left-aligned | centered | right-aligned | default |
|:-------------|:--------:|--------------:|---------|
| cell 1       | cell 2   |        cell 3 | cell 4  |
| **bold**     | *italic* |  `code`       | [link](#)|
| longer content in this cell | short | 12345 | test |

minimal table:

| a | b |
|---|---|
| 1 | 2 |

## horizontal rules

three different syntaxes:

---

***

___

## HTML elements

<details markdown="1">
<summary>click to expand (details/summary)</summary>

this content is hidden until you click. does this work in jekyll?

- nested list inside details
- another item

</details>

<mark>highlighted text</mark> (if supported)

<kbd>Ctrl</kbd> + <kbd>C</kbd> keyboard shortcuts

<abbr title="Hypertext Markup Language">HTML</abbr> abbreviation

## definition lists (if supported)

term 1
: definition for term 1

term 2
: definition for term 2
: alternate definition

## footnotes (if supported)

this sentence has a footnote[^1] and another[^longnote].

[^1]: this is the first footnote.
[^longnote]: this is a longer footnote with multiple lines.

    second paragraph of the footnote.

## emoji (if GFM)

:wave: :rocket: :cat: (these render on GitHub but probably not in Jekyll without a plugin)

## escape characters

\*not italic\* \`not code\` \[not a link\] \#not a heading

## deeply nested content

> blockquote containing:
>
> 1. an ordered list
>    - with a nested unordered item
>      > and a nested blockquote
>    - and `inline code`
> 2. second ordered item
>
> ```
> code block inside a blockquote
> ```

## long unbroken strings

thisIsAVeryLongCamelCaseStringThatHasNoSpacesAndShouldTestHowTheLayoutHandlesOverflowingTextWithinAParagraphElement

`thisIsAVeryLongInlineCodeStringThatHasNoSpacesAndShouldTestHowCodeOverflowsInTheInlineContext`

## adjacent elements stress test

# h1 immediately followed by
## h2 immediately followed by
### h3 immediately followed by

paragraph immediately followed by

---

immediately followed by

> a blockquote immediately followed by

```
a code block
```

immediately followed by

- a list

## empty/edge cases

##

>

---

**this is the end of the torture test.** if you made it here, congratulations. go check all four themes now.
