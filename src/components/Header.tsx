import React from 'react';
import {NAV} from '../content';
import {PRODUCT} from '../config';
import {CtaLink} from './Cta';

export const Brand: React.FC = () => (
  <a className="brand" href="#topo" aria-label={`${PRODUCT.shortName}, início da página`}>
    <svg className="brand-mark" viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
      <rect width="32" height="32" rx="7" />
      <path d="M8.5 16.5l5 5L23.5 10" />
    </svg>
    <span className="brand-name">
      Kit Gestão <strong>Fácil</strong>
    </span>
  </a>
);

export const Header: React.FC = () => (
  <header className="site-header">
    <div className="container header-inner">
      <Brand />
      <nav aria-label="Principal" className="nav">
        {NAV.map((n) => (
          <a key={n.href} href={n.href}>
            {n.label}
          </a>
        ))}
      </nav>
      <CtaLink>Quero o kit</CtaLink>
    </div>
  </header>
);
