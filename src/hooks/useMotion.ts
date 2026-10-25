import {useEffect, useRef} from 'react';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Entrada de seções: marca [data-reveal] com .in quando entra na tela (uma vez).
 * Sem IntersectionObserver, ou com movimento reduzido, tudo aparece de imediato.
 */
export function useReveal() {
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (!('IntersectionObserver' in window) || reduced()) {
      items.forEach((el) => el.classList.add('in'));
      return;
    }
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
    return () => io.disconnect();
  }, []);
}

/**
 * Vida da primeira dobra:
 * - data-live liga/desliga a luz de fundo (animação só roda com a seção visível);
 * - inclinação 3D sutil do conjunto seguindo o mouse, escrita direto em variáveis CSS
 *   (sem estado do React). Só com mouse de verdade e sem movimento reduzido.
 */
export function useHeroLife() {
  const hero = useRef<HTMLElement>(null);
  const scene = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = hero.current;
    const el = scene.current;
    if (!root || !el) return;

    let io: IntersectionObserver | undefined;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(([e]) => {
        root.dataset.live = e.isIntersecting ? 'true' : 'false';
      });
      io.observe(root);
    }

    const canTilt = window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduced();
    if (!canTilt) return () => io?.disconnect();

    const MAX = 4.5; // graus: o suficiente para dar profundidade sem atrapalhar a leitura
    let raf = 0;
    let nx = 0;
    let ny = 0;
    const apply = () => {
      raf = 0;
      el.style.setProperty('--rx', `${(-ny * MAX).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${(nx * MAX).toFixed(2)}deg`);
    };
    const move = (ev: PointerEvent) => {
      if (ev.pointerType !== 'mouse') return;
      const r = root.getBoundingClientRect();
      nx = Math.max(-1, Math.min(1, ((ev.clientX - r.left) / r.width - 0.5) * 2));
      ny = Math.max(-1, Math.min(1, ((ev.clientY - r.top) / r.height - 0.5) * 2));
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const leave = () => {
      nx = ny = 0;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    root.addEventListener('pointermove', move);
    root.addEventListener('pointerleave', leave);
    return () => {
      root.removeEventListener('pointermove', move);
      root.removeEventListener('pointerleave', leave);
      if (raf) cancelAnimationFrame(raf);
      io?.disconnect();
    };
  }, []);

  return {hero, scene};
}
