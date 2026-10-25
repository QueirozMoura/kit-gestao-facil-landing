import React from 'react';
import {Check} from 'lucide-react';
import {OFFER} from '../content';
import {PRODUCT} from '../config';
import {BuyButton} from './Cta';
import {Picture} from './Picture';

export const Offer: React.FC = () => (
  <section className="section section-dark offer cut-top" id="oferta" aria-labelledby="oferta-title">
    <div className="grid-bg" aria-hidden="true" />
    <div className="container offer-grid">
      <div className="offer-main" data-reveal>
        <p className="tag tag-dark">Kit completo</p>
        <h2 id="oferta-title" className="display">
          {OFFER.title.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </h2>
        <div className="price-block">
          <p className="price" aria-label={`${PRODUCT.price}, ${PRODUCT.priceNote.toLowerCase()}`}>
            <span className="price-cur">{PRODUCT.currency}</span>
            <span className="price-val">{PRODUCT.amount}</span>
          </p>
          <p className="price-note">{PRODUCT.priceNote}</p>
        </div>
        <ul className="offer-list">
          {OFFER.includes.map((i) => (
            <li key={i}>
              <Check aria-hidden="true" size={18} strokeWidth={3} />
              {i}
            </li>
          ))}
        </ul>
        <div className="offer-cta">
          <BuyButton label={OFFER.buy} unavailable={OFFER.unavailable} />
        </div>
        <ul className="offer-facts">
          {OFFER.facts.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        <p className="offer-fine">{OFFER.note}</p>
      </div>

      <div className="offer-files" aria-hidden="true" data-reveal>
        <Picture name="guia-p1" alt="" className="of of3" sizes="(max-width: 900px) 40vw, 260px" />
        <Picture name="checklist" alt="" className="of of2" sizes="(max-width: 900px) 40vw, 260px" />
        <Picture name="orcamento" alt="" className="of of1" sizes="(max-width: 900px) 40vw, 260px" />
        <Picture name="os-valores" alt="" className="of of4" sizes="(max-width: 900px) 70vw, 380px" />
      </div>
    </div>
  </section>
);
