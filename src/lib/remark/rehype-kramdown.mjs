// Rehype side of the kramdown compatibility layer. Runs on the hast that
// remark-rehype produces (before rehype-raw and Astro's own heading-id pass),
// reshaping it into the markup kramdown emitted:
//
//   - heading ids     kramdown's generator, plus -1/-2 suffixes for repeats
//   - footnotes       sup#fnref:x > a.footnote / div.footnotes > ol > li#fn:x > a.reversefootnote
//   - tables          style="text-align: x" instead of align="x"
//   - task lists      ul.task-list, input.task-list-item-checkbox, no space after the box
//   - ordered lists   start="" dropped (kramdown ignores the first number)
//   - inline code     class="language-plaintext highlighter-rouge"
//   - markdown="1"    attribute stripped from raw HTML
//   - {:toc}          fills the ul#markdown-toc placeholder

const HEADING = /^h[1-6]$/;

function walk(node, fn, parent = null, index = 0) {
  if (fn(node, parent, index) === false) return;
  if (node.children) {
    for (let i = 0; i < node.children.length; i++) walk(node.children[i], fn, node, i);
  }
}

const isEl = (n, tag) => n && n.type === 'element' && (tag ? n.tagName === tag : true);
const classes = (n) => {
  const c = n.properties?.className;
  return Array.isArray(c) ? c : c ? String(c).split(/\s+/) : [];
};

function isFootnoteRef(n) {
  return isEl(n, 'sup') && n.children?.some((c) => isEl(c, 'a') && 'dataFootnoteRef' in (c.properties ?? {}));
}

function textOf(n) {
  if (n.type === 'text') return n.value;
  if (isFootnoteRef(n)) return '';
  if (n.type === 'element') return n.children.map(textOf).join('');
  return '';
}

function kramdownId(text) {
  return text
    .replace(/^[^a-zA-Z0-9]+/, '')
    .replace(/[^a-zA-Z0-9 -]/g, '')
    .replace(/ /g, '-')
    .toLowerCase();
}

function headingIds(tree) {
  const used = new Map();
  walk(tree, (n) => {
    if (!isEl(n) || !HEADING.test(n.tagName)) return;
    n.properties ??= {};
    if (typeof n.properties.id === 'string') {
      used.set(n.properties.id, used.get(n.properties.id) ?? 0);
      return;
    }
    let id = kramdownId(textOf(n)) || 'section';
    if (used.has(id)) {
      const k = used.get(id) + 1;
      used.set(id, k);
      id += '-' + k;
    } else used.set(id, 0);
    n.properties.id = id;
  });
}

// ---- footnotes ------------------------------------------------------------

const stripPrefix = (s) => s.replace(/^user-content-/, '');

function footnotes(tree) {
  walk(tree, (n, parent, index) => {
    // references
    if (isFootnoteRef(n)) {
      const a = n.children.find((c) => isEl(c, 'a'));
      const label = stripPrefix(a.properties.href.replace(/^#/, '')).replace(/^fn-/, '');
      const idRest = stripPrefix(String(a.properties.id)).replace(/^fnref-/, '');
      const repeat = idRest.startsWith(label + '-') ? idRest.slice(label.length + 1) : null;
      n.properties = {
        id: 'fnref:' + label + (repeat ? ':' + (Number(repeat) - 1) : ''),
        role: 'doc-noteref',
      };
      a.properties = { href: '#fn:' + label, className: ['footnote'], rel: ['footnote'] };
      return false;
    }
    // the section
    if (isEl(n, 'section') && 'dataFootnotes' in (n.properties ?? {})) {
      const ol = n.children.find((c) => isEl(c, 'ol'));
      n.tagName = 'div';
      n.properties = { className: ['footnotes'], role: 'doc-endnotes' };
      n.children = [ol];
      for (const li of ol.children.filter((c) => isEl(c, 'li'))) {
        const label = stripPrefix(String(li.properties.id)).replace(/^fn-/, '');
        li.properties = { id: 'fn:' + label, role: 'doc-endnote' };
        walk(li, (b) => {
          if (isEl(b, 'a') && 'dataFootnoteBackref' in (b.properties ?? {})) {
            const rest = stripPrefix(String(b.properties.href).replace(/^#/, '')).replace(/^fnref-/, '');
            const repeat = rest.startsWith(label + '-') ? rest.slice(label.length + 1) : null;
            b.properties = {
              href: '#fnref:' + label + (repeat ? ':' + (Number(repeat) - 1) : ''),
              className: ['reversefootnote'],
              role: 'doc-backlink',
            };
          }
        });
      }
      return false;
    }
  });
}

// ---- small structural fixes ----------------------------------------------

function structural(tree) {
  walk(tree, (n, parent) => {
    if (n.type === 'raw' && typeof n.value === 'string') {
      n.value = n.value.replace(/(<[a-zA-Z][^>]*?)\s+markdown=(["'])1\2/g, '$1');
      return;
    }
    if (!isEl(n)) return;
    const p = (n.properties ??= {});
    // ***x*** : kramdown nests <strong><em>, remark <em><strong>
    if (n.tagName === 'em' && n.children.length === 1 && isEl(n.children[0], 'strong')) {
      const strong = n.children[0];
      n.tagName = 'strong';
      strong.tagName = 'em';
    }
    if ((n.tagName === 'th' || n.tagName === 'td') && p.align) {
      p.style = 'text-align: ' + p.align;
      delete p.align;
    } else if (n.tagName === 'ol' && 'start' in p) {
      delete p.start;
    } else if (n.tagName === 'ul' && classes(n).includes('contains-task-list')) {
      p.className = classes(n).map((c) => (c === 'contains-task-list' ? 'task-list' : c));
    } else if (n.tagName === 'input' && p.type === 'checkbox') {
      p.className = ['task-list-item-checkbox'];
      // remark-rehype puts a space between the box and its label
      const sib = parent.children[parent.children.indexOf(n) + 1];
      if (sib?.type === 'text') sib.value = sib.value.replace(/^ /, '');
    } else if (n.tagName === 'code' && !isEl(parent, 'pre')) {
      p.className = [...classes(n), 'language-plaintext', 'highlighter-rouge'];
    }
  });
}

// ---- table of contents ----------------------------------------------------

function toc(tree) {
  let placeholder = null;
  const heads = [];
  walk(tree, (n) => {
    if (!isEl(n)) return;
    if ((n.tagName === 'ul' || n.tagName === 'ol') && n.properties?.id === 'markdown-toc') placeholder = n;
    else if (HEADING.test(n.tagName) && !classes(n).includes('no_toc')) heads.push(n);
  });
  if (!placeholder) return;

  const root = { tagName: placeholder.tagName, children: [] };
  const stack = [];
  for (const h of heads) {
    const level = Number(h.tagName[1]);
    const id = h.properties.id;
    const li = {
      type: 'element',
      tagName: 'li',
      properties: {},
      level,
      children: [
        {
          type: 'element',
          tagName: 'a',
          properties: { href: '#' + id, id: 'markdown-toc-' + id },
          children: structuredClone(h.children.filter((c) => !isFootnoteRef(c))),
        },
      ],
    };
    for (;;) {
      if (!stack.length) {
        root.children.push(li);
        stack.push(li);
        break;
      }
      const top = stack[stack.length - 1];
      if (top.level < level) {
        let sub = top.children[top.children.length - 1];
        if (!isEl(sub) || (sub.tagName !== 'ul' && sub.tagName !== 'ol')) {
          sub = { type: 'element', tagName: placeholder.tagName, properties: {}, children: [] };
          top.children.push(sub);
        }
        sub.children.push(li);
        stack.push(li);
        break;
      }
      stack.pop();
    }
  }
  placeholder.children = root.children;
}

export default function rehypeKramdown() {
  return (tree) => {
    headingIds(tree); // before footnotes(): ids ignore the footnote marker
    footnotes(tree);
    structural(tree);
    toc(tree);
  };
}
