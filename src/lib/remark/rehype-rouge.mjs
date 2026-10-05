// Fenced and indented code, rendered the way Jekyll's Rouge integration did:
//
//   <div class="language-js highlighter-rouge"><div class="highlight">
//     <pre class="highlight"><code><span class="k">const</span> ...
//
// site.css styles `.highlight .k`, `.highlight .s2`, ... (Rouge token classes),
// so tokenising is done with Shiki (already shipped with Astro) and every
// TextMate scope is mapped to the nearest Rouge class. Shiki's own colours are
// discarded; the stylesheet supplies them.

import { bundledLanguages, createHighlighter } from 'shiki';

// most specific first. [scope prefix, class]
const RULES = [
  ['markup.inserted', 'gi'],
  ['markup.deleted', 'gd'],
  ['meta.diff.header', 'gh'],
  ['meta.diff.range', 'gu'],
  ['markup.heading', 'gh'],
  ['comment.block.documentation', 'cd'],
  ['comment.line', 'c1'],
  ['comment.block', 'cm'],
  ['comment', 'c'],
  ['punctuation.definition.comment', undefined],
  ['punctuation.definition.entity', undefined],
  ['punctuation.definition.deleted', undefined],
  ['punctuation.definition.inserted', undefined],
  ['punctuation.definition.changed', undefined],
  ['punctuation.support.type.property-name', 'nl'],
  ['keyword.other.unit', 'm'],
  ['string.unquoted', false],
  ['constant.character.escape', 'se'],
  ['punctuation.definition.template-expression', 'p'],
  ['punctuation.definition.string', 'dl'],
  ['string.regexp', 'sr'],
  ['string.quoted.docstring', 'sd'],
  ['string.quoted.single', 's1'],
  ['string.quoted.double', 's2'],
  ['string.template', 's2'],
  ['string', 's'],
  ['constant.numeric.hex', 'mh'],
  ['constant.numeric.float', 'mf'],
  ['constant.numeric', 'mi'],
  ['constant.language', 'kc'],
  ['variable.language', 'bp'],
  ['keyword.control.import', 'kn'],
  ['keyword.control.from', 'kn'],
  ['keyword.operator.word', 'ow'],
  ['keyword.operator.logical.python', 'ow'],
  ['keyword.operator.new', 'k'],
  ['keyword.operator.expression', 'k'],
  ['keyword.operator', 'o'],
  ['storage.modifier', 'k'],
  ['storage.type.function', 'kd'],
  ['storage.type', 'kd'],
  ['keyword', 'k'],
  ['storage', 'k'],
  ['entity.name.function', 'nf'],
  ['support.function', 'nb'],
  ['entity.name.type', 'nc'],
  ['entity.name.class', 'nc'],
  ['entity.other.attribute-name.class', 'nc'],
  ['entity.other.attribute-name.id', 'nf'],
  ['entity.other.attribute-name', 'na'],
  ['entity.name.tag', 'nt'],
  ['support.type.property-name', 'nl'],
  ['support.class', 'nb'],
  ['support.type', 'nb'],
  ['support.constant', 'no'],
  // plain identifiers: Rouge emits `nx`, which the stylesheet leaves unstyled
  ['variable', false],
  ['meta.template.expression', false],
  ['meta.embedded', false],
  ['punctuation', 'p'],
];

function classFor(scopes, lang, content) {
  // innermost scope wins
  for (let i = scopes.length - 1; i >= 0; i--) {
    const s = scopes[i];
    for (const [prefix, cls] of RULES) {
      if (s === prefix || s.startsWith(prefix + '.')) {
        if (cls === undefined) break; // inherit from the enclosing scope
        if (cls === false) return null;
        if (cls === 'mi' && /[.eE]/.test(content) && !/^0[xX]/.test(content)) return 'mf';
        if (cls === 'kc' && lang === 'python') return 'bp';
        return cls;
      }
    }
  }
  return null;
}

const TEXT_LANGS = new Set(['', 'text', 'txt', 'plain', 'plaintext']);
let highlighterPromise = null;
const loaded = new Set();

async function highlight(code, lang) {
  highlighterPromise ??= createHighlighter({ themes: ['github-light'], langs: [] });
  const hl = await highlighterPromise;
  if (!loaded.has(lang)) {
    await hl.loadLanguage(lang);
    loaded.add(lang);
  }
  return hl.codeToTokens(code, { lang, theme: 'github-light', includeExplanation: true }).tokens;
}

const el = (tagName, properties, children) => ({ type: 'element', tagName, properties, children });

function renderTokens(lines, lang) {
  const out = [];
  lines.forEach((line, li) => {
    if (li) out.push({ type: 'text', value: '\n' });
    for (const tok of line) {
      for (const part of tok.explanation ?? [{ content: tok.content, scopes: [] }]) {
        const cls = /^\s*$/.test(part.content) ? null : classFor(part.scopes.map((s) => s.scopeName), lang, part.content);
        const prev = out[out.length - 1];
        if (cls && prev?.type === 'element' && prev.properties.className[0] === cls) {
          prev.children[0].value += part.content; // Rouge emits one span per run
        } else if (!cls && prev?.type === 'text' && prev.value !== '\n') {
          prev.value += part.content;
        } else {
          out.push(cls ? el('span', { className: [cls] }, [{ type: 'text', value: part.content }]) : { type: 'text', value: part.content });
        }
      }
    }
  });
  out.push({ type: 'text', value: '\n' });
  return out;
}

function textOfCode(node) {
  return node.children.map((c) => (c.type === 'text' ? c.value : '')).join('');
}

export default function rehypeRouge() {
  return async (tree) => {
    const jobs = [];
    (function visit(node, parent, index) {
      if (node.type === 'element' && node.tagName === 'pre' && node.children.length === 1) {
        const code = node.children[0];
        if (code.type === 'element' && code.tagName === 'code') {
          jobs.push({ parent, index, code });
          return;
        }
      }
      node.children?.forEach((c, i) => visit(c, node, i));
    })(tree, null, 0);

    for (const { parent, index, code } of jobs) {
      const langClass = (code.properties?.className ?? []).find((c) => String(c).startsWith('language-'));
      const lang = langClass ? String(langClass).slice('language-'.length) : '';
      const source = textOfCode(code).replace(/\n$/, '');
      let children;
      if (TEXT_LANGS.has(lang) || !(lang in bundledLanguages)) {
        children = [{ type: 'text', value: source + '\n' }];
      } else {
        children = renderTokens(await highlight(source, lang), lang);
      }
      parent.children[index] = el('div', { className: ['language-' + (lang || 'plaintext'), 'highlighter-rouge'] }, [
        el('div', { className: ['highlight'] }, [el('pre', { className: ['highlight'] }, [el('code', {}, children)])]),
      ]);
    }
  };
}
