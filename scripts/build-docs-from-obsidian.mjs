import fs from 'fs';
import path from 'path';

const root = process.cwd();
const htmlPath = path.join(root, 'index.html');
const contentDir = path.join(root, 'content', '05 在线文档');

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseFrontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return [{}, source];
  const data = {};
  for (const line of match[1].split('\n')) {
    const [key, ...rest] = line.split(':');
    if (!key || !rest.length) continue;
    let value = rest.join(':').trim();
    value = value.replace(/^"(.*)"$/, '$1');
    data[key.trim()] = value;
  }
  return [data, source.slice(match[0].length)];
}

function inlineMarkdown(line) {
  let out = escapeHtml(line);
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  return out;
}

function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r/g, '').split('\n');
  const out = [];
  let listOpen = false;
  const closeList = () => {
    if (listOpen) {
      out.push('</ul>');
      listOpen = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      closeList();
      continue;
    }
    if (line.startsWith('# ')) continue;
    if (line.startsWith('## ')) {
      closeList();
      out.push(`<h4>${inlineMarkdown(line.slice(3))}</h4>`);
      continue;
    }
    if (line.startsWith('> ')) {
      closeList();
      out.push(`<div class="quote-box">${inlineMarkdown(line.slice(2))}</div>`);
      continue;
    }
    if (line.startsWith('- ')) {
      if (!listOpen) {
        out.push('<ul>');
        listOpen = true;
      }
      out.push(`<li>${inlineMarkdown(line.slice(2))}</li>`);
      continue;
    }
    if (line.startsWith('|')) {
      closeList();
      out.push(`<p>${inlineMarkdown(line)}</p>`);
      continue;
    }
    closeList();
    out.push(`<p>${inlineMarkdown(line)}</p>`);
  }
  closeList();
  return out.join('\n');
}

function readDocs() {
  if (!fs.existsSync(contentDir)) return [];
  return fs.readdirSync(contentDir)
    .filter(file => file.endsWith('.md'))
    .map(file => {
      const source = fs.readFileSync(path.join(contentDir, file), 'utf8');
      const [meta, body] = parseFrontmatter(source);
      return {
        id: meta.id,
        title: meta.title,
        description: meta.description || '',
        order: Number(meta.order || 999),
        author: meta.author || '常征 Sean',
        body,
      };
    })
    .filter(doc => doc.id && doc.title)
    .sort((a, b) => a.order - b.order);
}

const docs = readDocs();
if (!docs.length) {
  throw new Error(`No markdown docs found in ${contentDir}`);
}

let html = fs.readFileSync(htmlPath, 'utf8');
const indexHtml = docs.map(doc =>
  `        <a class="doc-link" href="#${doc.id}"><strong>${escapeHtml(doc.title)}</strong><span>${escapeHtml(doc.description)}</span><em>在线阅读</em></a>`
).join('\n');

const articlesHtml = docs.map(doc => `      <article id="${doc.id}" class="article">
        <a class="modal-close" href="#docs">关闭</a>
        <h3>${escapeHtml(doc.title)}</h3>
        <div class="byline">作者：${escapeHtml(doc.author)}｜在线文档</div>
        ${markdownToHtml(doc.body)}
      </article>`).join('\n\n');

html = html.replace(
  /      <div class="doc-index">[\s\S]*?\n\s+<\/section>/,
  `      <div class="doc-index">\n${indexHtml}\n      </div>\n\n${articlesHtml}\n\n    </section>`
);

html = html.replace(/<div class="proof-item"><strong>\d+<\/strong><span>在线文档直接阅读<\/span><\/div>/, `<div class="proof-item"><strong>${docs.length}</strong><span>在线文档直接阅读</span></div>`);

fs.writeFileSync(htmlPath, html, 'utf8');
console.log(`Built ${docs.length} docs into index.html`);
