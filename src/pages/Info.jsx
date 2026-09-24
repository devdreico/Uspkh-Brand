import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Footer, Header, Noise } from '../components/Layout';
import { InnerHero } from './Services';
import { faqData } from '../data/content';

export function FaqsPage() {
  const crumbs = [
    { name: 'Inicio', path: '/' },
    { name: 'Preguntas frecuentes', path: '/faqs' },
  ];
  return (
    <div className="app inner-page">
      <Noise />
      <Header />
      <InnerHero
        crumbs={crumbs}
        label="PREGUNTAS FRECUENTES"
        title={
          <>
            Todo claro.
            <br />
            <em>Sin letra pequeña.</em>
          </>
        }
        subtitle={`Respondemos ${faqData.length} preguntas sobre la membresía, la inversión en pauta, los tiempos de publicación, los contratos y los pagos antes de que actives tu campaña.`}
      />
      <section className="faq-list">
        {faqData.map(([question, answer], index) => (
          <details key={question}>
            <summary>
              <span>{index < 9 ? `0${index + 1}` : index + 1}</span>
              {question}
            </summary>
            <p>{answer}</p>
          </details>
        ))}
      </section>
      <section className="inner-cta">
        <h2>
          ¿Te quedó
          <em> otra duda?</em>
        </h2>
        <p>Escríbenos y un estratega te responde en menos de 24 horas, sin compromiso.</p>
        <div className="hero-actions">
          <a href="/contacto?mode=asesoria" className="button button-dark">
            Hablar con un estratega <ArrowUpRight size={18} />
          </a>
          <a href="/planes" className="button button-ghost">
            Ver planes <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export function AboutPage() {
  const crumbs = [
    { name: 'Inicio', path: '/' },
    { name: 'Nosotros', path: '/nosotros' },
  ];
  return (
    <div className="app inner-page">
      <Noise />
      <Header />
      <InnerHero
        crumbs={crumbs}
        label="NUESTRA HISTORIA"
        title={
          <>
            No hacemos marcas
            <br />
            <em>de molde.</em>
          </>
        }
        subtitle="Desde Bogotá, Uspkh Brand convierte lo que mueve a las personas en sistemas de comunicación, contenido y pauta que crecen mes a mes. Trabajamos con negocios de todo Colombia que quieren ordenar su marketing y ver resultados medibles."
      />
      <section className="values">
        <div className="value-big">
          01
          <br />
          <em>Claridad</em>
          <p>Precios cerrados, calendario visible y reportes entendibles. Sabes qué se publica, cuándo y con cuánto de pauta.</p>
        </div>
        <div className="value-big">
          02
          <br />
          <em>Intención</em>
          <p>Cada pieza, cada anuncio y cada hora de publicación tiene una audiencia y un objetivo, no son relleno de feed.</p>
        </div>
        <div className="value-big">
          03
          <br />
          <em>Movimiento</em>
          <p>Diagnosticamos, producimos, publicamos y optimizamos en ciclo de 30 días. Aprender y ajustar es parte del plan.</p>
        </div>
      </section>
      <section className="service-detail">
        <div className="service-detail-main">
          <h2>Cómo trabajamos</h2>
          <p className="lead-p">
            Uspkh nació en {`2020`} en Bogotá para resolver un problema repetido: marcas que invierten en anuncios sin
            contenido ni estrategia, y marcas con buen contenido que nunca miden. Nuestra respuesta es una membresía
            mensual que junta asesoría, producción y gestión de pauta en un solo flujo de trabajo.
          </p>
          <p className="lead-p">
            Analizamos tu gremio y contexto, definimos público ideal y mensajes, producimos las piezas y los videos UGC, los
            publicamos según un calendario con día y hora, y montamos tus campañas en Facebook e Instagram. Al cierre del mes
            recibes reportes de crecimiento y ajustamos la estrategia del mes siguiente.
          </p>
        </div>
        <aside className="service-detail-aside">
          <p className="section-label">CONTACTO DIRECTO</p>
          <p>
            {`Instagram ${'@uspkhbrandco'}`}
            <br />
            inbox@uspkhbrand.co
            <br />
            Bogotá, Colombia
          </p>
          <a href="/contacto?mode=asesoria" className="button button-dark">
            Solicitar diagnóstico <ArrowUpRight size={17} />
          </a>
        </aside>
      </section>
      <section className="inner-cta">
        <h2>
          Da el
          <em> primer paso.</em>
        </h2>
        <p>Un diagnóstico gratuito basta para saber si tu marketing necesita más contenido, más pauta o mejor estrategia.</p>
        <div className="hero-actions">
          <a href="/contacto?mode=asesoria" className="button button-dark">
            Diagnóstico sin costo <ArrowUpRight size={18} />
          </a>
          <a href="/servicios" className="button button-ghost">
            Ver servicios <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
      <Footer />
    </div>
  );
}
