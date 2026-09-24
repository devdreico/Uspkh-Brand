import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Camera, Mail, Menu, X } from 'lucide-react';
import { SITE, footerLinks } from '../data/content';

export function Logo() {
  return (
    <a className="brand-mark" href="/" aria-label="Uspkh Brand — inicio">
      <img src="/assets/uspkh-logo.png" alt="Uspkh Brand — agencia de marketing y pauta en Bogotá" width="34" height="34" />
      <span>
        USPKH<span className="brand-dot">.</span>
      </span>
    </a>
  );
}

export function Noise() {
  return <div className="noise" aria-hidden="true" />;
}

export function Header() {
  const [open, setOpen] = useState(false);
  const links = [
    ['Servicios', '/servicios'],
    ['Planes', '/planes'],
    ['Blog', '/blog'],
    ['Nosotros', '/nosotros'],
    ['FAQs', '/faqs'],
  ];
  return (
    <>
      <header className="site-header">
        <Logo />
        <nav aria-label="Navegación principal">
          {links.map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <a className="header-cta" href="/contacto">
          Activar campaña <ArrowUpRight size={16} />
        </a>
        <button
          className="menu-btn"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </button>
      </header>
      <AnimatePresence>
        {open && (
          <motion.div className="mobile-menu" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}>
            <button onClick={() => setOpen(false)} aria-label="Cerrar menú">
              <X />
            </button>
            {links.map(([label, href]) => (
              <a key={href} href={href} onClick={() => setOpen(false)}>
                {label}
              </a>
            ))}
            <a href="/contacto" onClick={() => setOpen(false)}>
              Diagnóstico gratis
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function Reveal({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Breadcrumbs({ items }) {
  if (!items?.length) return null;
  return (
    <nav className="breadcrumbs" aria-label="Migas de pan">
      <ol>
        {items.map((item, index) => (
          <li key={item.path}>
            {index < items.length - 1 ? <a href={item.path}>{item.name}</a> : <span aria-current="page">{item.name}</span>}
            {index < items.length - 1 && <i aria-hidden="true">/</i>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>
            Agencia de marketing, contenido y pauta publicitaria en {SITE.city}. Membresías mensuales para marcas que quieren
            crecer con intención.
          </p>
        </div>
        <nav className="footer-nav" aria-label="Enlaces del pie de página">
          {footerLinks.map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <div className="footer-contact">
          <a href={SITE.instagram}>
            <Camera size={17} /> {SITE.instagramHandle}
          </a>
          <a href={`mailto:${SITE.email}`}>
            <Mail size={17} /> {SITE.email}
          </a>
        </div>
      </div>
      <small>
        © 2026 USPKH BRAND · {SITE.city}, {SITE.country} · Operación de crecimiento publicitario
      </small>
    </footer>
  );
}
