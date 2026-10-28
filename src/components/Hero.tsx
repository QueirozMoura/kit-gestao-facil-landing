import React from 'react';
import {HERO} from '../content';
import {PRODUCT} from '../config';
import {image} from '../images';
import {useHeroLife} from '../hooks/useMotion';
import {Backdrop} from './Backdrop';
import {CtaLink} from './Cta';
import {Picture} from './Picture';

const d = (ms: number) => ({'--d': `${ms}ms`}) as React.CSSProperties;

export const Hero: React.FC = () => {
  const {hero} = useHeroLife();
  const wide = image('hero-planilha');
  const narrow = image('hero-planilha-m');

  return (
    <section className="hero" id="topo" aria-labelledby="hero-title" ref={hero} data-live="true" data-scene data-span="0.7">
      <div className="hero-bg" aria-hidden="true" />
      <Backdrop tone="dark" />
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="hero-eyebrow rise" style={d(0)}>
            {HERO.eyebrow}
          </p>
          <h1 id="hero-title">
            {HERO.titleLines.map((l, i) => (
              <span key={l} className="hl rise" style={d(40 + i * 90)}>
                {l}
              </span>
            ))}
          </h1>
          <p className="hero-lead rise" style={d(200)}>
            {HERO.subtitle}
          </p>
          <div className="hero-buy rise" style={d(240)}>
            <CtaLink size="lg">{HERO.cta}</CtaLink>
            <p className="hero-price">
              <strong>{PRODUCT.price}</strong>
              <span>{PRODUCT.priceNote}</span>
            </p>
          </div>
        </div>

        <div
          className="hero-visual"
          role="img"
          aria-label="Planilha de serviços com o status Pronto para retirada e o saldo pendente de cada OS, ao lado do checklist de entrada e do modelo de orçamento"
        >
          <div className="scene">
            <div className="hv hv-quote">
              <div className="hv-in" style={d(240)}>
                <Picture name="orcamento" alt="" sizes="(max-width: 700px) 42vw, 280px" eager />
              </div>
            </div>
            <div className="hv hv-check">
              <div className="hv-in" style={d(300)}>
                <Picture name="checklist" alt="" sizes="(max-width: 700px) 42vw, 280px" eager />
              </div>
            </div>
            <div className="hv hv-sheet">
              <div className="hv-in" style={d(120)}>
                <div className="sheet">
                  <picture>
                    <source media="(max-width: 700px)" srcSet={narrow.srcSet} sizes="94vw" width={narrow.width} height={narrow.height} />
                    <img
                      src={wide.src}
                      srcSet={wide.srcSet}
                      sizes="(max-width: 1100px) 56vw, 660px"
                      width={wide.width}
                      height={wide.height}
                      alt=""
                      fetchPriority="high"
                      decoding="async"
                    />
                  </picture>
                  <span className="ring ring-status" />
                  <span className="ring ring-saldo" />
                </div>
                <span className="pin pin-ready">
                  <span className="chip">{HERO.chips.ready}</span>
                </span>
                <span className="pin pin-balance">
                  <span className="chip">{HERO.chips.balance}</span>
                </span>
              </div>
            </div>
            <div className="hv hv-saldo">
              <div className="hv-in" style={d(400)}>
                <Picture name="hero-saldo" alt="" sizes="(max-width: 700px) 70vw, 400px" eager />
              </div>
            </div>
            <p className="hv-caption">{HERO.caption}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
