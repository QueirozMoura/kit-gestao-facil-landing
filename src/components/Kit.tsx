import React from 'react';
import {BookOpen, Boxes, ClipboardCheck, FileSpreadsheet} from 'lucide-react';
import {KIT_ITEMS} from '../content';
import {Picture} from './Picture';

const ICONS = {sheet: FileSpreadsheet, parts: Boxes, doc: ClipboardCheck, guide: BookOpen} as const;

export const Kit: React.FC = () => (
  <section className="section section-paper" id="kit" aria-labelledby="kit-title">
    <div className="container">
      <header className="head" data-reveal>
        <p className="tag">O que vem no kit</p>
        <h2 id="kit-title" className="display">
          <span>Cinco arquivos,</span>
          <span>um mesmo atendimento.</span>
        </h2>
        <p className="head-lead">Capturas reais dos arquivos do kit. Nomes, telefones e valores das imagens são fictícios.</p>
      </header>

      <div className="kit-list">
        {KIT_ITEMS.map((k, i) => {
          const Icon = ICONS[k.icon];
          return (
            <article key={k.id} className={`kit-row kit-${k.layout} ${i % 2 ? 'is-flip' : ''}`} data-reveal>
              <div className="kit-text">
                <p className="kit-q">{k.question}</p>
                <h3>
                  <Icon aria-hidden="true" size={24} strokeWidth={2.1} />
                  {k.title}
                </h3>
                <p className="kit-format">{k.format}</p>
                <p>{k.text}</p>
                <ul className="kit-points">
                  {k.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
              <div className="kit-stack">
                {k.images.map((im, n) => (
                  <Picture
                    key={im.name}
                    name={im.name}
                    alt={im.alt}
                    className={`k k${n + 1}`}
                    sizes={k.layout === 'docs' || k.layout === 'guide' ? '(max-width: 900px) 46vw, 300px' : '(max-width: 900px) 92vw, 640px'}
                  />
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  </section>
);
