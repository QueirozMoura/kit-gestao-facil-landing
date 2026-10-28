// Estado da página que o CSS usa: cabeçalho sólido após rolar, botão de compra visível depois da abertura
// e barra do celular escondida quando a oferta já está na tela.
export function initChrome() {
  const root = document.documentElement;
  const header = document.querySelector<HTMLElement>('.site-header');
  const intro = document.querySelector<HTMLElement>('[data-intro]');
  const offer = document.getElementById('oferta');

  let ticking = false;
  const update = () => {
    ticking = false;
    header?.classList.toggle('is-solid', window.scrollY > 24);
  };
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    {passive: true},
  );
  update();

  if (!('IntersectionObserver' in window)) {
    root.classList.add('past-intro'); // sem observador, o botão fica sempre disponível
    return;
  }
  if (intro) {
    // "depois da abertura": o fim da cena passou de 55% da altura da tela
    new IntersectionObserver(([e]) => root.classList.toggle('past-intro', !e.isIntersecting), {rootMargin: '0px 0px -55% 0px'}).observe(intro);
  }
  if (offer) {
    new IntersectionObserver(([e]) => root.classList.toggle('offer-in-view', e.isIntersecting), {threshold: 0.25}).observe(offer);
  }
}
