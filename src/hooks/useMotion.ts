import {useEffect, useRef} from 'react';
import {initPointerTilt, initScrollScenes} from './scrollScenes';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Entrada de seções: marca [data-reveal] com .in quando entra na tela (uma vez).
 * Sem IntersectionObserver, ou com movimento reduzido, tudo aparece de imediato.
 */
export function useReveal() {
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const showAll = () => items.forEach((el) => el.classList.add('in'));
    if (!('IntersectionObserver' in window) || reduced()) {
      showAll();
      return;
    }
    // Se a pessoa ativar "reduzir movimento" durante a visita, tudo aparece na hora.
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onPref = () => mq.matches && showAll();
    mq.addEventListener('change', onPref);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).classList.add('in');
          io.unobserve(e.target);
        }
      },
      {rootMargin: '0px 0px -12% 0px', threshold: 0.12},
    );
    items.forEach((el) => io.observe(el));
    return () => {
      mq.removeEventListener('change', onPref);
      io.disconnect();
    };
  }, []);
}

/**
 * Vida da primeira dobra:
 * - data-live liga/desliga as animações contínuas do fundo (só rodam com a seção visível);
 * - no desktop, o mouse inclina o conjunto (--mx/--my), somando-se ao movimento do scroll.
 */
export function useHeroLife() {
  const hero = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = hero.current;
    if (!root) return;
    let io: IntersectionObserver | undefined;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(([e]) => {
        root.dataset.live = e.isIntersecting ? 'true' : 'false';
      });
      io.observe(root);
    }
    const stopTilt = initPointerTilt(root);
    return () => {
      io?.disconnect();
      stopTilt();
    };
  }, []);

  return {hero};
}

/** Liga o progresso de rolagem aos elementos [data-scene] (ver scrollScenes.ts). */
export function useScrollScenes() {
  useEffect(() => initScrollScenes(), []);
}
