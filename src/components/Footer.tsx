import React from 'react';
import {NAV} from '../content';
import {PRODUCT} from '../config';
import {Brand} from './Header';

export const Footer: React.FC = () => (
  <footer className="site-footer">
    <div className="container footer-inner">
      <div className="footer-brand">
        <Brand />
        <p>
          Planilha de serviços, controle de peças e documentos editáveis para a assistência técnica. Kit digital em{' '}
          {PRODUCT.priceNote.toLowerCase()}.
        </p>
      </div>
      <nav aria-label="Rodapé" className="footer-nav">
        <a href="#topo">Início</a>
        {NAV.map((n) => (
          <a key={n.href} href={n.href}>
            {n.label}
          </a>
        ))}
        <a href="#oferta">Oferta</a>
      </nav>
    </div>
  </footer>
);
