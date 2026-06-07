import fs from 'fs';
import path from 'path';

const root = process.cwd();
const htmlPath = path.join(root, 'index.html');
const outDir = path.join(root, 'content', '05 在线文档');

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripTags(value) {
  return decodeHtml(value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim());
}

function safeFileName(name) {
  return name.replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, ' ').trim();
}

function htmlToMarkdown(html) {
  let body = html;
  body = body.replace(/<a class="modal-close"[^>]*>[\s\S]*?<\/a>/g, '');
  body = body.replace(/<div class="byline">([\s\S]*?)<\/div>/g, '');
  body = body.replace(/<div class="callout">([\s\S]*?)<\/div>/g, (_, t) => `\n> ${stripTags(t)}\n`);
  body = body.replace(/<div class="quote-box">([\s\S]*?)<\/div>/g, (_, t) => `\n> ${stripTags(t)}\n`);
  body = body.replace(/<h3>([\s\S]*?)<\/h3>/g, (_, t) => `# ${stripTags(t)}\n`);
  body = body.replace(/<h4>([\s\S]*?)<\/h4>/g, (_, t) => `\n## ${stripTags(t)}\n`);
  body = body.replace(/<li>([\s\S]*?)<\/li>/g, (_, t) => `- ${stripTags(t)}\n`);
  body = body.replace(/<\/?(ul|ol)>/g, '\n');
  body = body.replace(/<p><a href="([^"]+)"[^>]*>([\s\S]*?)<\/a><\/p>/g, (_, href, t) => `\n[${stripTags(t)}](${decodeHtml(href)})\n`);
  body = body.replace(/<p>([\s\S]*?)<\/p>/g, (_, t) => `\n${stripTags(t)}\n`);
  body = body.replace(/<table[\s\S]*?<\/table>/g, table => {
    const rows = [...table.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(row => {
      const cells = [...row[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map(c => stripTags(c[1]));
      return cells;
    }).filter(Boolean);
    if (!rows.length) return '';
    const width = Math.max(...rows.map(r => r.length));
    const normalized = rows.map(r => [...r, ...Array(width - r.length).fill('')]);
    const head = normalized[0];
    const lines = [
      `| ${head.join(' | ')} |`,
      `| ${head.map(() => '---').join(' | ')} |`,
      ...normalized.slice(1).map(r => `| ${r.join(' | ')} |`),
    ];
    return `\n${lines.join('\n')}\n`;
  });
  body = body.replace(/<[^>]*>/g, '');
  body = decodeHtml(body);
  body = body.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  return body + '\n';
}

fs.mkdirSync(outDir, { recursive: true });

const html = fs.readFileSync(htmlPath, 'utf8');
const links = [...html.matchAll(/<a class="doc-link" href="#([^"]+)"><strong>([\s\S]*?)<\/strong><span>([\s\S]*?)<\/span><em>在线阅读<\/em><\/a>/g)]
  .map((m, index) => ({
    order: index + 1,
    id: m[1],
    title: stripTags(m[2]),
    description: stripTags(m[3]),
  }));

for (const item of links) {
  const articleMatch = html.match(new RegExp(`<article id="${item.id}" class="article">([\\s\\S]*?)<\\/article>`));
  if (!articleMatch) continue;
  const md = htmlToMarkdown(articleMatch[0]);
  const frontmatter = [
    '---',
    `id: ${item.id}`,
    `title: "${item.title.replace(/"/g, '\\"')}"`,
    `description: "${item.description.replace(/"/g, '\\"')}"`,
    `order: ${item.order}`,
    'author: "常征 Sean"',
    'status: published',
    '---',
    '',
  ].join('\n');
  const file = path.join(outDir, `${String(item.order).padStart(2, '0')} ${safeFileName(item.title)}.md`);
  fs.writeFileSync(file, frontmatter + md, 'utf8');
}

console.log(`Exported ${links.length} docs to ${path.relative(root, outDir)}`);
