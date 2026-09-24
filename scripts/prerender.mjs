import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const templatePath = join(dist, 'index.html');

if (!existsSync(templatePath)) {
  console.error('No se encontró dist/index.html. Ejecuta primero `vite build`.');
  process.exit(1);
}

const template = readFileSync(templatePath, 'utf8');

const ssrEntry = join(root, 'dist-ssr', 'entry-server.js');
const { render, getSeo, blogPosts, services } = await import(pathToFileURL(ssrEntry).href);

const routes = [
  '/',
  '/servicios',
  ...services.map((service) => `/servicios/${service.slug}`),
  '/planes',
  '/nosotros',
  '/faqs',
  '/blog',
  ...blogPosts.map((post) => `/blog/${post.slug}`),
  '/contacto',
  '/formulario',
  '/solicitud-recibida',
  '/pago/exito',
  '/pago/pendiente',
  '/pago/error',
  '/404',
];

const escapeAttr = (value) => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const jsonLdScript = (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

function buildHead(route, seo) {
  const canonicalUrl = seo.canonical || `${'https://uspkh.presentto.online'}${route === '/' ? '/' : route}`;
  const parts = [];
  parts.push(`<title>${escapeAttr(seo.title)}</title>`);
  parts.push(`<meta name="description" content="${escapeAttr(seo.description)}" />`);
  parts.push(`<meta name="robots" content="${seo.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}" />`);
  parts.push(`<link rel="canonical" href="${escapeAttr(canonicalUrl)}" />`);
  parts.push(`<meta property="og:type" content="${escapeAttr(seo.ogType)}" />`);
  parts.push(`<meta property="og:site_name" content="Uspkh Brand" />`);
  parts.push(`<meta property="og:locale" content="es_CO" />`);
  parts.push(`<meta property="og:title" content="${escapeAttr(seo.title)}" />`);
  parts.push(`<meta property="og:description" content="${escapeAttr(seo.description)}" />`);
  parts.push(`<meta property="og:url" content="${escapeAttr(canonicalUrl)}" />`);
  parts.push(`<meta property="og:image" content="${escapeAttr(seo.image)}" />`);
  parts.push(`<meta name="twitter:card" content="summary_large_image" />`);
  parts.push(`<meta name="twitter:title" content="${escapeAttr(seo.title)}" />`);
  parts.push(`<meta name="twitter:description" content="${escapeAttr(seo.description)}" />`);
  parts.push(`<meta name="twitter:image" content="${escapeAttr(seo.image)}" />`);
  const jsonLd = typeof seo.jsonLd === 'function' ? seo.jsonLd() : [];
  for (const data of jsonLd) parts.push(jsonLdScript(data));
  return parts.join('\n    ');
}

function stripExistingHead(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<meta name="description"[^>]*>/, '')
    .replace(/<meta property="og:[^>]*>/g, '')
    .replace(/<meta name="twitter:[^>]*>/g, '')
    .replace(/<link rel="canonical"[^>]*>/, '')
    .replace(/<meta name="robots"[^>]*>/, '')
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
}

const headBase = stripExistingHead(template);
let written = 0;

for (const route of routes) {
  const seo = getSeo(route);
  let body = '';
  try {
    body = render(route);
  } catch (error) {
    console.warn(`[prerender] No se pudo renderizar ${route}:`, error.message);
  }
  const head = buildHead(route, seo);
  let html = headBase.replace(/<head>/, `<head>\n    ${head}`);
  html = html.replace(/<div id="root"><\/div>/, `<div id="root">${body}</div>`);
  const target =
    route === '/'
      ? templatePath
      : route === '/404'
        ? join(dist, '404.html')
        : join(dist, route.replace(/^\//, ''), 'index.html');
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html);
  written += 1;
  console.log(`[prerender] ${route} → ${target.replace(`${root}/`, '')} (${body.length} bytes de HTML)`);
}

console.log(`[prerender] Listo: ${written} rutas.`);
