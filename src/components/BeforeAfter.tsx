import React from 'react';
import {ClipboardCheck, PackageCheck, Wallet} from 'lucide-react';
import {BEFORE_AFTER as C} from '../content';
import {Picture} from './Picture';

const ICONS = [PackageCheck, Wallet, ClipboardCheck];

export const BeforeAfter: React.FC = () => (
  <section className="section section-light" id="antes-depois" aria-labelledby="ba-title">
    <div className="container">
      <header className="head" data-reveal>
        <h2 id="ba-title" className="display">
          {C.title.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </h2>
        <p className="head-lead">{C.lead}</p>
      </header>

      <div className="ba" data-reveal>
        <figure className="ba-before">
          <div className="ba-tag ba-tag-dashed">{C.beforeTag}</div>
          <div className="scraps" aria-hidden="true">
            {C.scraps.map((s, i) => (
              <p key={i} className={`scrap scrap-${s.kind} s${i + 1}`}>
                {s.text}
              </p>
            ))}
          </div>
          <figcaption>{C.beforeNote}</figcaption>
        </figure>

        <figure className="ba-after">
          <div className="ba-tag">{C.afterTag}</div>
          <div className="ba-shot">
            <Picture name="resumo" alt="Aba Resumo da planilha demonstrativa: OS registradas, ativas, prontas para retirada, atrasadas, valor total, recebido e saldo pendente (dados fictícios)" sizes="(max-width: 900px) 92vw, 620px" />
          </div>
          <figcaption>{C.afterNote}</figcaption>
        </figure>
      </div>

      <ul className="benefits" data-reveal>
        {C.benefits.map((b, i) => {
          const Icon = ICONS[i];
          return (
            <li key={b.title}>
              <Icon aria-hidden="true" size={26} strokeWidth={2} />
              <h3>{b.title}</h3>
              <p>{b.text}</p>
            </li>
          );
        })}
      </ul>
    </div>
  </section>
);
