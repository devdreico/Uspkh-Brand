import { SITE, blogPosts, faqData, plans, services } from './content';

const absolute = (path) => `${SITE.domain}${path === '/' ? '/' : path}`;

const orgLd = () => ({
  '@type': 'Organization',
  '@id': `${SITE.domain}/#organization`,
  name: SITE.name,
  url: SITE.domain,
  logo: `${SITE.domain}/assets/uspkh-logo.png`,
  email: SITE.email,
  sameAs: [SITE.instagram],
  address: { '@type': 'PostalAddress', addressLocality: SITE.city, addressCountry: 'CO' },
  contactPoint: { '@type': 'ContactPoint', contactType: 'sales', availableLanguage: 'Spanish', email: SITE.email },
});

const webSiteLd = () => ({
  '@type': 'WebSite',
  '@id': `${SITE.domain}/#website`,
  url: SITE.domain,
  name: SITE.name,
  inLanguage: 'es-CO',
  publisher: { '@id': `${SITE.domain}/#organization` },
});

const breadcrumbLd = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: absolute(item.path),
  })),
});

const faqLd = (pairs) => ({
  '@type': 'FAQPage',
  mainEntity: pairs.map(([question, answer]) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer },
  })),
});

const serviceLd = (service) => ({
  '@type': 'Service',
  name: service.headline,
  description: service.short,
  provider: { '@id': `${SITE.domain}/#organization` },
  areaServed: { '@type': 'Country', name: 'Colombia' },
  serviceType: service.title,
});

const offerLd = (plan) => ({
  '@type': 'Offer',
  name: `Membresía ${plan.name} — ${SITE.name}`,
  description: plan.description,
  price: plan.price,
  priceCurrency: 'COP',
  availability: 'https://schema.org/InStock',
  url: absolute('/planes'),
  seller: { '@id': `${SITE.domain}/#organization` },
});

const articleLd = (post) => ({
  '@type': 'BlogPosting',
  headline: post.title,
  description: post.description,
  datePublished: post.date,
  dateModified: post.date,
  inLanguage: 'es-CO',
  mainEntityOfPage: absolute(`/blog/${post.slug}`),
  author: { '@type': 'Organization', name: SITE.name, url: SITE.domain },
  publisher: { '@id': `${SITE.domain}/#organization` },
});

const meta = (path, title, description, extras = {}) => ({
  path,
  title,
  description,
  ogType: extras.ogType || 'website',
  noindex: Boolean(extras.noindex),
  canonical: extras.canonical || null,
  image: extras.image || `${SITE.domain}/assets/uspkh-logo.png`,
  jsonLd: extras.jsonLd || (() => []),
});

export function getSeo(path) {
  const clean = path !== '/' && path.endsWith('/') ? path.slice(0, -1) : path;

  if (clean === '/') {
    return meta(
      '/',
      'Uspkh Brand — Agencia de marketing y pauta publicitaria en Bogotá',
      'Estrategia, contenido diario, videos UGC y gestión de pauta Meta en una membresía mensual. Planes desde $600.000 COP. Diagnóstico gratis.',
      { jsonLd: () => [orgLd(), webSiteLd(), faqLd(faqData.slice(0, 3))] },
    );
  }

  if (clean === '/servicios') {
    return meta(
      '/servicios',
      'Servicios de marketing digital y publicidad | Uspkh Brand',
      'Pauta en Meta, contenido UGC, branding y asesoría de crecimiento. Conoce el sistema completo de Uspkh Brand en Bogotá.',
      {
        jsonLd: () => [
          breadcrumbLd([{ name: 'Inicio', path: '/' }, { name: 'Servicios', path: '/servicios' }]),
          { '@type': 'ItemList', itemListElement: services.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: s.headline, url: absolute(`/servicios/${s.slug}`) })) },
        ],
      },
    );
  }

  const service = services.find((item) => clean === `/servicios/${item.slug}`);
  if (service) {
    return meta(
      clean,
      `${service.headline} | ${service.title} — Uspkh Brand`,
      service.short,
      {
        jsonLd: () => [
          breadcrumbLd([
            { name: 'Inicio', path: '/' },
            { name: 'Servicios', path: '/servicios' },
            { name: service.title, path: clean },
          ]),
          serviceLd(service),
        ],
      },
    );
  }

  if (clean === '/planes') {
    return meta(
      '/planes',
      'Planes y precios de membresía de marketing | Uspkh Brand',
      'Membresías desde $600.000 COP: contenido, videos UGC, calendario y gestión de pauta Meta. Compara Fundamento, Tracción y Dominio.',
      { jsonLd: () => [breadcrumbLd([{ name: 'Inicio', path: '/' }, { name: 'Planes', path: '/planes' }]), getPlansJsonLd(plans), faqLd(faqData.slice(0, 8))] },
    );
  }

  if (clean === '/nosotros') {
    return meta(
      '/nosotros',
      'Nosotros — Agencia de crecimiento desde Bogotá | Uspkh Brand',
      'Uspkh Brand convierte estrategia, contenido y pauta en sistemas de comunicación que crecen. Conoce cómo trabajamos.',
      { jsonLd: () => [breadcrumbLd([{ name: 'Inicio', path: '/' }, { name: 'Nosotros', path: '/nosotros' }]), orgLd()] },
    );
  }

  if (clean === '/faqs') {
    return meta(
      '/faqs',
      'Preguntas frecuentes sobre membresía, pauta y pagos | Uspkh Brand',
      'Todo claro sobre planes, inversión en pauta, tiempos de publicación, contratos y pagos. Respuestas sin letra pequeña.',
      {
        jsonLd: () => [
          breadcrumbLd([{ name: 'Inicio', path: '/' }, { name: 'Preguntas frecuentes', path: '/faqs' }]),
          faqLd(faqData),
        ],
      },
    );
  }

  if (clean === '/blog') {
    return meta(
      '/blog',
      'Blog de marketing, pauta y contenido | Uspkh Brand',
      'Artículos sobre inversión en pauta Meta, videos UGC, calendarios de contenido y estrategia de marketing en Colombia.',
      { jsonLd: () => [breadcrumbLd([{ name: 'Inicio', path: '/' }, { name: 'Blog', path: '/blog' }])] },
    );
  }

  const post = blogPosts.find((item) => clean === `/blog/${item.slug}`);
  if (post) {
    return meta(
      clean,
      `${post.title} | Blog Uspkh Brand`,
      post.description,
      {
        ogType: 'article',
        jsonLd: () => [
          breadcrumbLd([
            { name: 'Inicio', path: '/' },
            { name: 'Blog', path: '/blog' },
            { name: post.title, path: clean },
          ]),
          articleLd(post),
        ],
      },
    );
  }

  if (clean === '/contacto' || clean === '/formulario') {
    const isContact = clean === '/contacto';
    return meta(
      clean,
      isContact
        ? 'Contacto y diagnóstico gratuito | Uspkh Brand'
        : 'Activa tu campaña — formulario | Uspkh Brand',
      'Cuéntanos tu negocio y recibe una recomendación de plan sin costo. Te contactamos en menos de 24 horas.',
      {
        noindex: !isContact,
        canonical: isContact ? null : absolute('/contacto'),
        jsonLd: () => [
          breadcrumbLd([{ name: 'Inicio', path: '/' }, { name: 'Contacto', path: '/contacto' }]),
          { '@type': 'ContactPage', url: absolute('/contacto'), mainEntity: { '@id': `${SITE.domain}/#organization` } },
        ],
      },
    );
  }

  if (clean === '/solicitud-recibida') {
    return meta('/solicitud-recibida', 'Solicitud recibida | Uspkh Brand', 'Recibimos tus datos. Te contactaremos en menos de 24 horas.', { noindex: true });
  }

  if (clean.startsWith('/pago/')) {
    return meta(clean, 'Estado de pago | Uspkh Brand', 'Estado de tu pago en Uspkh Brand.', { noindex: true });
  }

  return meta(clean, 'Página no encontrada | Uspkh Brand', 'La página que buscas no existe.', { noindex: true });
}

export function getFaqJsonLd(faqData) {
  return faqLd(faqData);
}

export function getPlansJsonLd(plans) {
  return { '@type': 'ItemList', itemListElement: plans.map((plan, i) => ({ '@type': 'ListItem', position: i + 1, item: offerLd(plan) })) };
}
