import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import { getSeo } from './data/seo';
import { blogPosts, services } from './data/content';

export { getSeo, blogPosts, services };

export function render(url) {
  const [path = '/', search = ''] = url.split('?');
  return renderToString(<App path={path} search={search ? `?${search}` : ''} />);
}
