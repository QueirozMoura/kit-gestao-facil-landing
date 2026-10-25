import React from 'react';
import {STEPS} from '../content';

export const HowItWorks: React.FC = () => (
  <section className="section section-light steps-section" id="como-funciona" aria-labelledby="como-title">
    <div className="container">
      <header className="head" data-reveal>
        <h2 id="como-title" className="display display-sm">
          <span>Da compra ao primeiro</span>
          <span>atendimento registrado.</span>
        </h2>
      </header>
      <ol className="steps" data-reveal>
        {STEPS.map((s, i) => (
          <li key={s.title}>
            <span className="step-n" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </li>
        ))}
      </ol>
    </div>
  </section>
);
