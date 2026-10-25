import React, {useEffect, useState} from 'react';
import {PRODUCT} from '../config';
import {CtaLink} from './Cta';

// Barra de ação fixa só no celular: aparece depois da primeira dobra e some quando a oferta está à vista.
export const StickyBar: React.FC = () => {
  const [pastHero, setPastHero] = useState(false);
  const [offerVisible, setOfferVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById('topo');
    const offer = document.getElementById('oferta');
    if (!hero || !offer || !('IntersectionObserver' in window)) return;
    const h = new IntersectionObserver(([e]) => setPastHero(!e.isIntersecting), {threshold: 0});
    const o = new IntersectionObserver(([e]) => setOfferVisible(e.isIntersecting), {threshold: 0.15});
    h.observe(hero);
    o.observe(offer);
    return () => {
      h.disconnect();
      o.disconnect();
    };
  }, []);

  const show = pastHero && !offerVisible;
  return (
    <div className={`sticky-bar ${show ? 'is-on' : ''}`} aria-hidden={!show} inert={!show}>
      <p>
        <strong>{PRODUCT.price}</strong>
        <span> {PRODUCT.priceNote.toLowerCase()}</span>
      </p>
      <CtaLink>Quero o kit</CtaLink>
    </div>
  );
};
