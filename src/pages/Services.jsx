import React from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import { Breadcrumbs, Footer, Header, Noise, Reveal } from '../components/Layout';
import { formatCOP } from './Home';
import { extras, faqData, plans, services } from '../data/content';

export function InnerHero({ label, title, subtitle, crumbs }) {
  return (
    <section className="inner-hero">
      {crumbs && <Breadcrumbs items={crumbs} />}
      <p className="section-label">{label}</p>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </section>
  );
}

export function ServicesPage() {
  const crumbs = [
    { name: 'Inicio', path: '/' },
    { name: 'Servicios', path: '/servicios' },
  ];
  return (
    <div className="app inner-page">
      <Noise />
      <Header />
      <InnerHero
        crumbs={crumbs}
        label="SERVICIOS DE MARKETING Y PUBLICIDAD"
        title={
          <>
            Cuatro servicios.
            <br />
            <em>Un solo sistema.</em>
          </>
        }
        subtitle="Pauta publicitaria en Meta, contenido y videos UGC, branding y asesoría de crecimiento: la oferta completa de Uspkh Brand para marcas en Bogotá y todo Colombia."
      />

      <section className="service-index">
        {services.map((service) => (
          <Reveal key={service.slug}>
            <article className="service-index-card">
              <span className="card-num">{service.num}</span>
              <div>
                <h2>
                  {service.title} <em>— {service.headline}</em>
                </h2>
                <p>{service.short}</p>
                <a href={`/servicios/${service.slug}`} className="text-link">
                  Ver detalle de {service.title.toLowerCase()} <ArrowUpRight size={15} />
                </a>
              </div>
            </article>
          </Reveal>
        ))}
      </section>

      <section className="inner-cta">
        <h2>
          ¿Prefieres verlo
          <em> en números?</em>
        </h2>
        <p>Los tres planes mensuales incluyen estos servicios ya empaquetados con precio cerrado.</p>
        <div className="hero-actions">
          <a href="/planes" className="button button-dark">
            Ver planes y precios <ArrowUpRight size={18} />
          </a>
          <a href="/contacto?mode=asesoria" className="button button-ghost">
            Diagnóstico gratis <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export function ServiceDetailPage({ slug }) {
  const service = services.find((item) => item.slug === slug);
  if (!service) return null;
  const crumbs = [
    { name: 'Inicio', path: '/' },
    { name: 'Servicios', path: '/servicios' },
    { name: service.title, path: `/servicios/${service.slug}` },
  ];
  const others = services.filter((item) => item.slug !== slug);

  return (
    <div className="app inner-page">
      <Noise />
      <Header />
      <InnerHero
        crumbs={crumbs}
        label={`SERVICIO 0${service.num} / ${service.title.toUpperCase()}`}
        title={
          <>
            {service.headline.split(' ').slice(0, -2).join(' ')}{' '}
            <em>{service.headline.split(' ').slice(-2).join(' ')}</em>
          </>
        }
        subtitle={service.lead}
      />

      <section className="service-detail">
        <div className="service-detail-main">
          <h2>Qué incluye</h2>
          <ul className="check-list">
            {service.bullets.map((bullet) => (
              <li key={bullet}>
                <Check size={17} /> <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
        <aside className="service-detail-aside">
          <p className="section-label">CÓMO SE CONTRATA</p>
          <p>
            Este servicio se activa dentro de una membresía mensual o como proyecto aparte (branding y vectorización).
            Solicita el diagnóstico gratuito y te decimos qué combinación conviene para tu negocio.
          </p>
          <a href="/contacto?mode=asesoria" className="button button-dark">
            Pedir diagnóstico gratis <ArrowUpRight size={17} />
          </a>
        </aside>
      </section>

      <section className="inner-cta">
        <h2>
          Servicios
          <em> relacionados.</em>
        </h2>
        <div className="related-grid">
          {others.map((item) => (
            <a key={item.slug} href={`/servicios/${item.slug}`} className="related-card">
              <span>{item.num}</span>
              <b>{item.title}</b>
              <p>{item.short}</p>
            </a>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}

export function PlansPage() {
  const crumbs = [
    { name: 'Inicio', path: '/' },
    { name: 'Planes', path: '/planes' },
  ];
  return (
    <div className="app inner-page">
      <Noise />
      <Header />
      <InnerHero
        crumbs={crumbs}
        label="PLANES Y PRECIOS"
        title={
          <>
            Membresías desde
            <br />
            <em>$600.000 COP.</em>
          </>
        }
        subtitle="Tres planes mensuales de marketing: contenido diario, videos UGC, calendario de publicación y gestión de pauta en Meta. Sin permanencia mínima. La inversión en anuncios se paga aparte en tu cuenta de Facebook e Instagram."
      />

      <section className="plans inner-plans">
        <div className="plan-grid">
          {plans.map((plan, index) => (
            <Reveal key={plan.id} delay={index * 0.1}>
              <article className={`plan-card ${plan.featured ? 'featured' : ''}`}>
                <div className="plan-top">
                  <span>{plan.eyebrow}</span>
                  {plan.featured && <b>Más elegido</b>}
                </div>
                <h3>{plan.name}</h3>
                <p className="plan-description">{plan.description}</p>
                <div className="plan-price">
                  {formatCOP(plan.price)}
                  <small>/ 30 días</small>
                </div>
                <div className="plan-lines">
                  {[plan.socials, plan.pieces, plan.videos, plan.reports, plan.pauta, ...plan.extras].map((item) => (
                    <p key={item}>
                      <Check size={15} />
                      {item}
                    </p>
                  ))}
                </div>
                <a href={plan.paymentUrl} className="plan-button">
                  Elegir {plan.name} <ArrowUpRight size={17} />
                </a>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="compare-table-section">
        <p className="section-label">SERVICIOS EXTRA</p>
        <h2>
          Branding y
          <em> vectorización.</em>
        </h2>
        <div className="extras-grid">
          {extras.map((item) => (
            <article key={item.id} className="extra-card">
              <h3>{item.name}</h3>
              <strong>{formatCOP(item.price)}</strong>
              <p>{item.description}</p>
              <a href={`/contacto?plan=${item.id}`} className="text-link">
                Contratar <ArrowUpRight size={15} />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="faq-list">
        <p className="section-label">PREGUNTAS SOBRE PLANES</p>
        {faqData.slice(0, 8).map(([question, answer], index) => (
          <details key={question}>
            <summary>
              <span>0{index + 1}</span>
              {question}
            </summary>
            <p>{answer}</p>
          </details>
        ))}
        <p className="plans-note">
          <a href="/faqs">Ver todas las preguntas frecuentes <ArrowUpRight size={14} /></a>
        </p>
      </section>

      <section className="inner-cta">
        <h2>
          ¿Dudas con
          <em> el plan?</em>
        </h2>
        <p>Solicita un diagnóstico gratuito y te recomendamos la membresía según tu gremio y objetivos.</p>
        <div className="hero-actions">
          <a href="/contacto?mode=asesoria" className="button button-dark">
            Diagnóstico sin costo <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
      <Footer />
    </div>
  );
}
