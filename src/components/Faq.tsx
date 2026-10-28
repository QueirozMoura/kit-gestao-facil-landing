import React from 'react';
import {ChevronDown} from 'lucide-react';
import {Backdrop} from './Backdrop';
import {FAQ} from '../content';

export const Faq: React.FC = () => (
  <section className="section section-light" id="duvidas" aria-labelledby="faq-title" data-scene>
    <Backdrop tone="light" />
    <div className="container faq-grid">
      <header className="head" data-reveal>
        <h2 id="faq-title" className="display display-sm">
          <span>Perguntas</span>
          <span>frequentes.</span>
        </h2>
        <p className="head-lead">O que o kit faz e o que ele não faz, sem rodeios.</p>
      </header>
      <div className="faq" data-reveal>
        {FAQ.map((f) => (
          <details key={f.q}>
            <summary>
              <span>{f.q}</span>
              <ChevronDown aria-hidden="true" size={22} strokeWidth={2.4} />
            </summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  </section>
);
