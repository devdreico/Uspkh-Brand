import React from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, Check, Sparkles, MoveUpRight } from 'lucide-react';
import { Breadcrumbs, Footer, Header, Noise, Reveal } from '../components/Layout';
import OrbitScene from '../components/OrbitScene';
import { extras, faqData, plans, process } from '../data/content';

export const formatCOP = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

export function PlanCard({ plan }) {
  const lines = [plan.socials, plan.pieces, plan.videos, plan.reports, plan.pauta, ...plan.extras];
  return (
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
        {lines.map((item) => (
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
  );
}

function WalletPreview() {
  return (
    <div className="wallet-preview">
      <div className="wallet-header">
        <span>SALDO DE PAUTA / DEMO</span>
        <span className="status-pill">
          <i /> operativo
        </span>
      </div>
      <div className="wallet-total">
        <small>Presupuesto aprobado</small>
        <strong>
          $800.000 <em>COP</em>
        </strong>
        <span>Registro visual de tu inversión en anuncios, no es un depósito retirable.</span>
      </div>
      <div className="wallet-track">
        <span style={{ width: '62%' }} />
      </div>
      <div className="wallet-rows">
        <p>
          <span>Asignado a campañas</span>
          <b>$500.000</b>
        </p>
        <p>
          <span>Gasto reportado</span>
          <b>$300.000</b>
        </p>
        <p>
          <span>Saldo operativo</span>
          <b className="cyan">$500.000</b>
        </p>
      </div>
      <div className="wallet-spark" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}

export default function Home() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const heroY = useTransform(progress, [0, 0.2], [0, -34]);

  return (
    <div className="app">
      <Noise />
      <Header />
      <motion.div className="progress-bar" style={{ scaleX: progress }} />
      <main>
        <section className="hero">
          <div className="hero-grid" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="hero-copy">
            <p className="kicker">
              <span className="pulse-dot" /> Agencia de marketing y pauta · Bogotá
            </p>
            <motion.h1 style={{ y: heroY }}>
              Estrategia, contenido
              <br />
              <em>y pauta en una membresía.</em>
            </motion.h1>
            <p className="hero-sub">
              Uspkh Brand es una agencia de crecimiento en Bogotá: analizamos tu mercado, producimos contenido diario y videos
              UGC, y gestionamos tu pauta en Meta (Instagram y Facebook) durante 30 días. Membresías desde $600.000 COP.
            </p>
            <div className="hero-actions">
              <a href="#planes" className="button button-dark">
                Ver planes y precios <ArrowDownRight size={18} />
              </a>
              <a href="/contacto?mode=asesoria" className="button button-ghost">
                Diagnóstico gratis <ArrowUpRight size={18} />
              </a>
            </div>
            <div className="trust-line">
              <span>Desde Bogotá · 2020</span>
              <span>Pago seguro con Mercado Pago</span>
              <span>Contenido publicando en 7 días</span>
            </div>
          </div>
          <OrbitScene />
          <div className="hero-bottom">
            <span>Scroll para ver el sistema</span>
            <ArrowDownRight size={17} />
            <span className="hero-index">01 — 07</span>
          </div>
        </section>

        <section className="statement" id="problema">
          <Reveal>
            <p className="section-label">01 / EL PROBLEMA</p>
            <h2>
              Publicar sin estrategia <span>quema presupuesto.</span>
            </h2>
            <p className="statement-body">
              Sin diagnóstico, sin calendario y sin medición, cada anuncio parte de cero. Uspkh conecta análisis de mercado,
              producción de contenido, pauta en Meta y reportes en una sola operación mensual, para que tu inversión en
              publicidad tenga dirección desde el día uno.
            </p>
          </Reveal>
          <div className="metrics">
            <strong>1 sistema</strong>
            <span>
              para pasar de piezas sueltas
              <br />
              a decisiones medibles
            </span>
          </div>
          <div className="signal-stamp">
            ATTENTION
            <br />
            <span>IS A BUDGET</span>
          </div>
        </section>

        <section className="services" id="servicios">
          <div className="services-intro">
            <p className="section-label">02 / LO QUE HACEMOS</p>
            <h2>
              Una operación
              <br />
              <i>completa.</i>
            </h2>
            <p>
              Cuatro servicios que trabajan juntos: diagnóstico estratégico, contenido diario, videos UGC y gestión de pauta
              publicitaria en Meta. Todo coordinado desde un calendario único.
            </p>
          </div>
          <div className="service-stack">
            <Reveal>
              <article className="service-card cyan-card">
                <span className="card-num">01</span>
                <Sparkles />
                <h3>
                  Diagnóstico
                  <br />
                  <i>que enfoca.</i>
                </h3>
                <p>Análisis de tu gremio, competencia y público ideal antes de producir un solo anuncio.</p>
                <a className="card-arrow" href="/servicios/asesoria-crecimiento" aria-label="Ver asesoría de crecimiento">
                  <ArrowUpRight />
                </a>
              </article>
            </Reveal>
            <Reveal delay={0.1}>
              <article className="service-card dark-card">
                <span className="card-num">02</span>
                <MoveUpRight />
                <h3>
                  Contenido
                  <br />
                  <i>diario.</i>
                </h3>
                <p>De 30 a 90 piezas gráficas y videos UGC verticales al mes, con copy y hashtags listos para publicar.</p>
                <a className="card-arrow" href="/servicios/contenido-y-ugc" aria-label="Ver contenido y UGC">
                  <ArrowUpRight />
                </a>
              </article>
            </Reveal>
            <Reveal delay={0.2}>
              <article className="service-card blue-card">
                <span className="card-num">03</span>
                <div className="mini-grid" />
                <h3>
                  Pauta
                  <br />
                  <i>en Meta.</i>
                </h3>
                <p>Campañas en Facebook e Instagram montadas, segmentadas y optimizadas con presupuesto visible.</p>
                <a className="card-arrow" href="/servicios/pauta-publicitaria" aria-label="Ver gestión de pauta">
                  <ArrowUpRight />
                </a>
              </article>
            </Reveal>
          </div>
          <p className="services-more">
            <a href="/servicios">
              Ver los 4 servicios de Uspkh <ArrowUpRight size={15} />
            </a>
          </p>
        </section>

        <section className="process" id="sistema">
          <div>
            <p className="section-label">03 / CÓMO FUNCIONA</p>
            <h2>
              Un mes.
              <br />
              <em>Un sistema.</em>
            </h2>
            <p className="process-note">
              Cada etapa deja una señal medible. Cada señal alimenta la decisión del mes siguiente.
            </p>
          </div>
          <div className="process-list">
            {process.map(([number, title, timing, description]) => (
              <div className="process-item" key={number}>
                <span>{number}</span>
                <div>
                  <b>{title}</b>
                  <small>{timing}</small>
                  <p>{description}</p>
                </div>
                <i>↗</i>
              </div>
            ))}
          </div>
        </section>

        <section className="balance-section">
          <div>
            <p className="section-label">04 / SALDO DE PAUTA</p>
            <h2>
              Ver el presupuesto
              <br />
              <em>cambia la conversación.</em>
            </h2>
            <p>
              Registramos por separado el presupuesto aprobado, lo asignado a campañas y el gasto reportado de tu pauta en
              Meta. Tú pones el dinero en tu cuenta publicitaria; nosotros lo operamos y lo reportamos con total
              transparencia.
            </p>
            <a className="text-link" href="/faqs">
              Cómo funciona la pauta <ArrowUpRight size={15} />
            </a>
          </div>
          <Reveal>
            <WalletPreview />
          </Reveal>
        </section>

        <section className="proof-section">
          <div>
            <p className="section-label">05 / EVIDENCIA</p>
            <h2>
              Resultados que
              <br />
              <em>se pueden abrir.</em>
            </h2>
          </div>
          <div className="proof-grid">
            <article>
              <span className="proof-icon">01</span>
              <h3>Qué medimos</h3>
              <p>Alcance, atención, clics, conversaciones, inversión y aprendizaje por campaña, en reportes mensuales.</p>
            </article>
            <article>
              <span className="proof-icon">02</span>
              <h3>Qué publicamos</h3>
              <p>Solo casos, testimonios y logos con autorización del cliente y fuente de datos verificable.</p>
            </article>
            <article>
              <span className="proof-icon">03</span>
              <h3>Qué evitamos</h3>
              <p>Cifras inventadas, promesas de retorno garantizado y referencias sin respaldo. Nada de atajos.</p>
            </article>
          </div>
        </section>

        <section className="plans" id="planes">
          <Reveal>
            <div className="plans-heading">
              <div>
                <p className="section-label">06 / PLANES Y PRECIOS</p>
                <h2>
                  Una membresía
                  <br />
                  <em>para cada etapa.</em>
                </h2>
              </div>
              <p>
                Cada plan incluye estrategia, contenido, calendario y gestión de pauta en Meta durante 30 días. La
                inversión en anuncios se paga aparte, directamente en tu cuenta de Facebook e Instagram.
              </p>
            </div>
          </Reveal>
          <div className="plan-grid">
            {plans.map((plan, index) => (
              <Reveal key={plan.id} delay={index * 0.1}>
                <PlanCard plan={plan} />
              </Reveal>
            ))}
          </div>
          <p className="plans-note">
            Extras: vectorización de logo {formatCOP(extras[0].price)} · re-branding {formatCOP(extras[1].price)}. ¿No sabes
            cuál elegir? <a href="/contacto?mode=asesoria">Pide recomendación sin costo <ArrowUpRight size={14} /></a>
          </p>
          <p className="plans-note">
            <a href="/planes">Comparar planes en detalle <ArrowUpRight size={14} /></a>
          </p>
        </section>

        <section className="proof-section faq-teaser">
          <div>
            <p className="section-label">06.5 / DUDAS FRECUENTES</p>
            <h2>
              Todo claro.
              <br />
              <em>Sin letra pequeña.</em>
            </h2>
          </div>
          <div className="faq-list faq-list-home">
            {faqData.slice(0, 3).map(([question, answer], index) => (
              <details key={question}>
                <summary>
                  <span>0{index + 1}</span>
                  {question}
                </summary>
                <p>{answer}</p>
              </details>
            ))}
            <p className="plans-note">
              <a href="/faqs">Ver las {faqData.length} preguntas frecuentes <ArrowUpRight size={14} /></a>
            </p>
          </div>
        </section>

        <section className="free-cta">
          <div className="cta-flow" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div>
            <p className="section-label">07 / PRIMER MOVIMIENTO</p>
            <h2>
              Activa tu
              <br />
              <em>primera campaña.</em>
            </h2>
            <p>
              Cuéntanos qué negocio quieres hacer crecer. En menos de 24 horas te recomendamos el plan y la estrategia antes
              de pedirte cualquier pago.
            </p>
            <div className="hero-actions">
              <a href="/contacto?mode=asesoria" className="button button-light">
                Solicitar diagnóstico gratis <ArrowUpRight size={18} />
              </a>
              <a href="/planes" className="button button-outline-light">
                Ver planes <ArrowUpRight size={18} />
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
