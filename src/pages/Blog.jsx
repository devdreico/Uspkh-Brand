import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Footer, Header, Noise } from '../components/Layout';
import { InnerHero } from './Services';
import { blogPosts } from '../data/content';

const formatDate = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

export function BlogIndexPage() {
  const crumbs = [
    { name: 'Inicio', path: '/' },
    { name: 'Blog', path: '/blog' },
  ];
  return (
    <div className="app inner-page">
      <Noise />
      <Header />
      <InnerHero
        crumbs={crumbs}
        label="BLOG DE MARKETING"
        title={
          <>
            Ideas para crecer
            <br />
            <em>con datos, no con suerte.</em>
          </>
        }
        subtitle="Artículos sobre inversión en pauta Meta, videos UGC, calendarios de contenido y branding para negocios en Colombia."
      />
      <section className="blog-grid">
        {blogPosts.map((post) => (
          <article key={post.slug} className="blog-card">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <h2>
              <a href={`/blog/${post.slug}`}>{post.title}</a>
            </h2>
            <p>{post.description}</p>
            <a href={`/blog/${post.slug}`} className="text-link">
              Leer artículo <ArrowUpRight size={15} />
            </a>
          </article>
        ))}
      </section>
      <section className="inner-cta">
        <h2>
          ¿Marketing en
          <em> acción?</em>
        </h2>
        <p>Aplica lo que lees: pide un diagnóstico gratuito y recibe un plan de contenido y pauta para tu negocio.</p>
        <div className="hero-actions">
          <a href="/contacto?mode=asesoria" className="button button-dark">
            Diagnóstico gratis <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export function BlogPostPage({ slug }) {
  const post = blogPosts.find((item) => item.slug === slug);
  if (!post) return null;
  const crumbs = [
    { name: 'Inicio', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: post.title, path: `/blog/${post.slug}` },
  ];
  const others = blogPosts.filter((item) => item.slug !== slug);

  return (
    <div className="app inner-page">
      <Noise />
      <Header />
      <section className="inner-hero article-hero">
        <nav className="breadcrumbs" aria-label="Migas de pan">
          <ol>
            {crumbs.map((item, index) => (
              <li key={item.path}>
                {index < crumbs.length - 1 ? <a href={item.path}>{item.name}</a> : <span aria-current="page">{item.name}</span>}
                {index < crumbs.length - 1 && <i aria-hidden="true">/</i>}
              </li>
            ))}
          </ol>
        </nav>
        <p className="section-label">ARTÍCULO · {formatDate(post.date)}</p>
        <h1 className="article-title">{post.title}</h1>
        <p>{post.description}</p>
      </section>

      <article className="article-body">
        <p className="article-intro">{post.intro}</p>
        {post.sections.map((section) => (
          <section key={section.h}>
            <h2>{section.h}</h2>
            {section.p.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </section>
        ))}
        <div className="article-cta">
          <p>{post.cta}</p>
          <div className="hero-actions">
            <a href="/contacto?mode=asesoria" className="button button-dark">
              Diagnóstico sin costo <ArrowUpRight size={18} />
            </a>
            <a href="/planes" className="button button-ghost">
              Ver planes <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
      </article>

      <section className="blog-grid blog-related">
        <p className="section-label">SIGUE LEYENDO</p>
        {others.map((item) => (
          <article key={item.slug} className="blog-card">
            <time dateTime={item.date}>{formatDate(item.date)}</time>
            <h2>
              <a href={`/blog/${item.slug}`}>{item.title}</a>
            </h2>
            <p>{item.description}</p>
            <a href={`/blog/${item.slug}`} className="text-link">
              Leer artículo <ArrowUpRight size={15} />
            </a>
          </article>
        ))}
      </section>
      <Footer />
    </div>
  );
}
