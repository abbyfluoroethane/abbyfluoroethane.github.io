// Remark side of the kramdown compatibility layer. Everything here works on
// mdast (or on the raw source, for math) and aims to reproduce what Jekyll's
// kramdown (GFM input) did for the constructs this site uses.
//
//   - math          $$...$$ -> \(...\) inline, \[...\] block   (MathJax delimiters)
//   - autolinks     undo remark-gfm's bare-URL linking (kramdown-GFM only links <url>)
//   - IAL           {: .class #id key="v"} on spans, blocks and headings; {#id} on headings
//   - {:toc}        marks the list that the rehype pass fills with the table of contents
//   - deflists      "term\n: definition" -> <dl>
//   - abbreviations *[HTML]: HyperText Markup Language

const OPEN = '';
const CLOSE = '';

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ---------------------------------------------------------------------------
// math (source level, so markdown never sees the TeX)
// ---------------------------------------------------------------------------

function extractMath(src, store) {
  let out = '';
  let i = 0;
  let lineStart = true;
  let blankBefore = true; // previous line blank (or start of file)
  while (i < src.length) {
    if (lineStart) {
      const rest = src.slice(i);
      const fence = /^ {0,3}(`{3,}|~{3,})[^\n]*(\n|$)/.exec(rest);
      if (fence) {
        // copy the whole fenced block verbatim
        const marker = fence[1];
        let j = i + fence[0].length;
        while (j < src.length) {
          const eol = src.indexOf('\n', j);
          const line = src.slice(j, eol === -1 ? src.length : eol);
          j = eol === -1 ? src.length : eol + 1;
          if (new RegExp('^ {0,3}' + marker[0] + '{' + marker.length + ',}\\s*$').test(line)) break;
        }
        out += src.slice(i, j);
        i = j;
        blankBefore = false;
        continue;
      }
    }
    const ch = src[i];
    if (ch === '\n') {
      // a blank line is "\n" straight after another line start
      blankBefore = lineStart;
      lineStart = true;
      out += ch;
      i++;
      continue;
    }
    if (ch === '`') {
      let n = 0;
      while (src[i + n] === '`') n++;
      const run = '`'.repeat(n);
      const end = src.indexOf(run, i + n);
      if (end !== -1) {
        out += src.slice(i, end + n);
        i = end + n;
        lineStart = false;
        continue;
      }
      out += run;
      i += n;
      lineStart = false;
      continue;
    }
    if (ch === '\\' && src[i + 1] === '$') {
      out += src.slice(i, i + 2);
      i += 2;
      lineStart = false;
      continue;
    }
    if (ch === '$' && src[i + 1] === '$') {
      const end = src.indexOf('$$', i + 2);
      if (end !== -1) {
        const body = src.slice(i + 2, end);
        const after = src.slice(end + 2).match(/^[ \t]*(\n|$)/);
        const display = lineStart && blankBefore && !!after;
        store.push({ body: body.trim(), display });
        out += OPEN + (store.length - 1) + CLOSE;
        i = end + 2;
        lineStart = false;
        continue;
      }
    }
    if (!/[ \t]/.test(ch)) lineStart = false;
    out += ch;
    i++;
  }
  return out;
}

const TOKEN = new RegExp(OPEN + '(\\d+)' + CLOSE, 'g');

function remarkMath(tree, file) {
  const store = file.data.kdMath ?? [];
  if (!store.length) return;
  walk(tree, (node, parent, index) => {
    if (node.type === 'paragraph' && node.children.length === 1 && node.children[0].type === 'text') {
      const m = /^(\d+)$/.exec(node.children[0].value.trim());
      if (m && store[m[1]].display) {
        parent.children[index] = { type: 'html', value: escapeHtml('\\[' + store[m[1]].body + '\\]') };
        return 'skip';
      }
    }
    if (node.type === 'text' && node.value.includes(OPEN)) {
      const parts = [];
      let last = 0;
      node.value.replace(TOKEN, (match, n, offset) => {
        if (offset > last) parts.push({ type: 'text', value: node.value.slice(last, offset) });
        const { body, display } = store[n];
        parts.push({ type: 'text', value: display ? '\\[' + body + '\\]' : '\\(' + body + '\\)' });
        last = offset + match.length;
        return match;
      });
      if (last < node.value.length) parts.push({ type: 'text', value: node.value.slice(last) });
      parent.children.splice(index, 1, ...parts);
      return ['skip', index + parts.length];
    }
  });
}

// ---------------------------------------------------------------------------
// tree helpers
// ---------------------------------------------------------------------------

// walk(tree, visitor): visitor(node, parent, index) may return 'skip' to not
// descend, or ['skip', nextIndex] after splicing the parent's children.
function walk(node, visitor, parent = null, index = 0) {
  const r = visitor(node, parent, index);
  if (r === 'skip' || Array.isArray(r)) return r;
  if (node.children) {
    for (let i = 0; i < node.children.length; ) {
      const rr = walk(node.children[i], visitor, node, i);
      i = Array.isArray(rr) ? rr[1] : i + 1;
    }
  }
}

function parseAttrs(str) {
  const attrs = { classes: [], id: null, props: {} };
  const re = /\.([\w-]+)|#([\w-]+)|([\w:-]+)=(?:"([^"]*)"|'([^']*)'|(\S+))/g;
  let m;
  while ((m = re.exec(str))) {
    if (m[1]) attrs.classes.push(m[1]);
    else if (m[2]) attrs.id = m[2];
    else attrs.props[m[3]] = m[4] ?? m[5] ?? m[6];
  }
  return attrs;
}

function applyAttrs(node, a) {
  node.data ??= {};
  const hp = (node.data.hProperties ??= {});
  if (a.classes.length) {
    const cur = hp.className ? (Array.isArray(hp.className) ? hp.className : String(hp.className).split(/\s+/)) : [];
    hp.className = [...cur, ...a.classes];
  }
  if (a.id) hp.id = a.id;
  Object.assign(hp, a.props);
}

const lastChild = (n) => n.children?.[n.children.length - 1];

// ---------------------------------------------------------------------------
// bare-URL autolinks
// ---------------------------------------------------------------------------

function remarkNoAutolinkLiteral() {
  return (tree, file) => {
    const src = file.data.kdSource ?? String(file.value);
    walk(tree, (node, parent, index) => {
      if (node.type !== 'link' || !node.position) return;
      const c = src[node.position.start.offset];
      if (c === '[' || c === '<') return;
      if (node.children.length === 1 && node.children[0].type === 'text') {
        parent.children[index] = node.children[0];
      }
    });
  };
}

// ---------------------------------------------------------------------------
// abbreviations
// ---------------------------------------------------------------------------

function abbreviations(tree) {
  const abbrs = new Map();
  walk(tree, (node, parent, index) => {
    if (node.type !== 'paragraph' || node.children.some((c) => c.type !== 'text')) return;
    const lines = node.children.map((c) => c.value).join('').split('\n');
    const defs = lines.map((l) => /^\*\[([^\]]+)\]:\s*(.*)$/.exec(l.trim()));
    if (defs.every(Boolean)) {
      for (const d of defs) abbrs.set(d[1], d[2].trim());
      parent.children.splice(index, 1);
      return ['skip', index];
    }
  });
  if (!abbrs.size) return;
  const names = [...abbrs.keys()].sort((a, b) => b.length - a.length).map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = new RegExp('(?<![\\w])(' + names.join('|') + ')(?![\\w])', 'g');
  walk(tree, (node, parent, index) => {
    if (node.type !== 'text' || !parent) return;
    const parts = [];
    let last = 0;
    node.value.replace(re, (match, name, offset) => {
      if (offset > last) parts.push({ type: 'text', value: node.value.slice(last, offset) });
      parts.push({
        type: 'kdAbbr',
        data: { hName: 'abbr', hProperties: { title: abbrs.get(name) } },
        children: [{ type: 'text', value: name }],
      });
      last = offset + match.length;
      return match;
    });
    if (!parts.length) return;
    if (last < node.value.length) parts.push({ type: 'text', value: node.value.slice(last) });
    parent.children.splice(index, 1, ...parts);
    return ['skip', index + parts.length];
  });
}

// ---------------------------------------------------------------------------
// definition lists
// ---------------------------------------------------------------------------

function splitLines(children) {
  const lines = [[]];
  for (const c of children) {
    if (c.type === 'text' && c.value.includes('\n')) {
      const segs = c.value.split('\n');
      segs.forEach((s, i) => {
        if (i > 0) lines.push([]);
        if (s) lines[lines.length - 1].push({ type: 'text', value: s });
      });
    } else lines[lines.length - 1].push(c);
  }
  return lines;
}

const isDefLine = (line) => line[0]?.type === 'text' && /^:[ \t]+/.test(line[0].value);

function deflists(tree) {
  walk(tree, (node, parent, index) => {
    if (node.type !== 'paragraph' || !parent) return;
    const lines = splitLines(node.children);
    if (lines.length < 2 || isDefLine(lines[0]) || !lines.some(isDefLine)) return;
    const dl = { type: 'kdDl', data: { hName: 'dl' }, children: [] };
    let dd = null;
    for (const line of lines) {
      if (!line.length) continue;
      if (isDefLine(line)) {
        const first = { ...line[0], value: line[0].value.replace(/^:[ \t]+/, '') };
        dd = { type: 'kdDd', data: { hName: 'dd' }, children: first.value ? [first, ...line.slice(1)] : line.slice(1) };
        dl.children.push(dd);
      } else if (dd) {
        dd.children.push({ type: 'text', value: '\n' }, ...line);
      } else {
        dl.children.push({ type: 'kdDt', data: { hName: 'dt' }, children: line });
      }
    }
    const prev = parent.children[index - 1];
    if (prev?.type === 'kdDl') {
      prev.children.push(...dl.children);
      parent.children.splice(index, 1);
      return ['skip', index];
    }
    parent.children[index] = dl;
    return 'skip';
  });
}

// ---------------------------------------------------------------------------
// inline / block attribute lists and {:toc}
// ---------------------------------------------------------------------------

const SPAN_IAL = /^\{:([^}]*)\}/;
const BLOCK_IAL_END = /(?:^|\n)[ \t]*\{:([^}]*)\}[ \t]*$/;
const HEADING_IAL_END = /[ \t]*\{(:[^}]*|#[\w-]+)\}[ \t]*$/;
const TOC_END = /(?:^|\n)[ \t]*\{:\s*toc\s*\}[ \t]*$/;

function ials(tree) {
  // {:toc} — the list whose last item ends with it becomes the TOC placeholder
  walk(tree, (node) => {
    if (node.type !== 'list') return;
    const item = lastChild(node);
    const para = item && lastChild(item);
    const t = para?.type === 'paragraph' && lastChild(para);
    if (t?.type === 'text' && TOC_END.test(t.value)) {
      t.value = t.value.replace(TOC_END, '');
      node.data ??= {};
      node.data.hProperties = { ...node.data.hProperties, id: 'markdown-toc' };
      node.data.hName = node.ordered ? 'ol' : 'ul';
      node.data.kdToc = true;
    }
  });

  // span IALs: a text node that opens with {: ...} decorates the node before it
  walk(tree, (node, parent, index) => {
    if (node.type !== 'text' || !parent || index === 0) return;
    const m = SPAN_IAL.exec(node.value);
    const prev = parent.children[index - 1];
    if (!m || /^\s*toc\s*$/.test(m[1]) || !prev || prev.type === 'text') return;
    applyAttrs(prev, parseAttrs(m[1]));
    node.value = node.value.slice(m[0].length);
    if (!node.value) {
      parent.children.splice(index, 1);
      return ['skip', index];
    }
  });

  // headings: "## text {: .class}" or "## text {#id}"
  walk(tree, (node) => {
    if (node.type !== 'heading') return;
    const t = lastChild(node);
    if (t?.type !== 'text') return;
    const m = HEADING_IAL_END.exec(t.value);
    if (!m) return;
    applyAttrs(node, parseAttrs(m[1].startsWith(':') ? m[1].slice(1) : m[1]));
    t.value = t.value.slice(0, m.index);
  });

  // block IALs: trailing line of a paragraph applies to that paragraph; a
  // paragraph that is only an IAL applies to the block before it
  walk(tree, (node, parent, index) => {
    if (node.type !== 'paragraph' || !parent) return;
    const t = lastChild(node);
    if (t?.type !== 'text') return;
    const m = BLOCK_IAL_END.exec(t.value);
    if (!m || /^\s*toc\s*$/.test(m[1])) return;
    const attrs = parseAttrs(m[1]);
    t.value = t.value.slice(0, m.index);
    if (t.value === '' && node.children.length === 1) {
      const prev = parent.children[index - 1];
      if (prev) applyAttrs(prev, attrs);
      parent.children.splice(index, 1);
      return ['skip', index];
    }
    t.value = t.value.replace(/\n$/, '');
    if (!t.value) node.children.pop();
    applyAttrs(node, attrs);
  });
}

// ---------------------------------------------------------------------------

export default function remarkKramdown() {
  const self = this;
  const parse = self.parser;
  if (typeof parse === 'function') {
    self.parser = (doc, file) => {
      const store = [];
      const src = extractMath(String(doc), store);
      file.data.kdMath = store;
      file.data.kdSource = src;
      return parse(src, file);
    };
  }
  return (tree, file) => {
    // order matters: abbreviations and deflists read raw paragraph text, IALs
    // strip their own syntax, and math runs last over what remains.
    abbreviations(tree);
    ials(tree);
    deflists(tree);
    remarkMath(tree, file);
  };
}

export { remarkNoAutolinkLiteral };
