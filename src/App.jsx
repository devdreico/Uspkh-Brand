import React from 'react';
import Home from './pages/Home';
import { PlansPage, ServiceDetailPage, ServicesPage } from './pages/Services';
import { AboutPage, FaqsPage } from './pages/Info';
import { BlogIndexPage, BlogPostPage } from './pages/Blog';
import { FormPage, RequestReceived, Result } from './pages/Form';
import NotFound from './pages/NotFound';
import { blogPosts, services } from './data/content';

export function resolvePath(pathname) {
  const path = pathname !== '/' && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  if (path === '/') return { key: 'home' };
  if (path === '/servicios') return { key: 'services' };
  if (path.startsWith('/servicios/')) {
    const slug = path.replace('/servicios/', '');
    if (services.some((item) => item.slug === slug)) return { key: 'service', slug };
    return { key: 'notfound' };
  }
  if (path === '/planes') return { key: 'plans' };
  if (path === '/nosotros') return { key: 'about' };
  if (path === '/faqs') return { key: 'faqs' };
  if (path === '/blog') return { key: 'blog' };
  if (path.startsWith('/blog/')) {
    const slug = path.replace('/blog/', '');
    if (blogPosts.some((item) => item.slug === slug)) return { key: 'post', slug };
    return { key: 'notfound' };
  }
  if (path === '/contacto' || path === '/formulario') return { key: 'form' };
  if (path === '/solicitud-recibida') return { key: 'received' };
  if (path === '/pago/exito') return { key: 'result-approved' };
  if (path === '/pago/pendiente') return { key: 'result-pending' };
  if (path === '/pago/error') return { key: 'result-rejected' };
  return { key: 'notfound' };
}

export default function App({ path = '/', search = '' }) {
  const route = resolvePath(path);
  switch (route.key) {
    case 'home':
      return <Home />;
    case 'services':
      return <ServicesPage />;
    case 'service':
      return <ServiceDetailPage slug={route.slug} />;
    case 'plans':
      return <PlansPage />;
    case 'about':
      return <AboutPage />;
    case 'faqs':
      return <FaqsPage />;
    case 'blog':
      return <BlogIndexPage />;
    case 'post':
      return <BlogPostPage slug={route.slug} />;
    case 'form':
      return <FormPage search={search} />;
    case 'received':
      return <RequestReceived />;
    case 'result-approved':
      return <Result kind="approved" search={search} />;
    case 'result-pending':
      return <Result kind="pending" search={search} />;
    case 'result-rejected':
      return <Result kind="rejected" search={search} />;
    default:
      return <NotFound />;
  }
}
