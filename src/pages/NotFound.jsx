import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Footer, Header, Noise } from '../components/Layout';
import { InnerHero } from './Services';

export default function NotFound() {
  return (
    <div className="app inner-page">
      <Noise />
      <Header />
      <InnerHero
        label="404 / PÁGINA NO ENCONTRADA"
        title={
          <>
            Esta página
            <br />
            <em>no existe.</em>
          </>
        }
        subtitle="El enlace puede estar desactualizado. Vuelve al inicio o explora nuestros servicios de marketing, pauta y contenido."
      />
      <section className="inner-cta">
        <div className="hero-actions">
          <a href="/" className="button button-dark">
            Volver al inicio <ArrowUpRight size={18} />
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
