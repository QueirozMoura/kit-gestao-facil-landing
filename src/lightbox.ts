// Ampliação das capturas: <dialog> modal (Esc fecha, foco volta ao link), setas e botões para navegar.
// Sem JavaScript, os links `a[data-zoom]` simplesmente abrem a imagem grande.
export function initLightbox() {
  const dialog = document.querySelector<HTMLDialogElement>('[data-lightbox]');
  const links = [...document.querySelectorAll<HTMLAnchorElement>('a[data-zoom]')];
  if (!dialog || typeof dialog.showModal !== 'function' || !links.length) return;

  const img = dialog.querySelector<HTMLImageElement>('[data-lb-img]')!;
  const caption = dialog.querySelector<HTMLElement>('[data-lb-caption]')!;
  const count = dialog.querySelector<HTMLElement>('[data-lb-count]')!;
  const scroller = dialog.querySelector<HTMLElement>('.lb-scroll')!;
  const prev = dialog.querySelector<HTMLButtonElement>('[data-lb-prev]')!;
  const next = dialog.querySelector<HTMLButtonElement>('[data-lb-next]')!;
  let index = 0;

  const show = (n: number) => {
    index = Math.min(Math.max(n, 0), links.length - 1);
    const link = links[index];
    scroller.classList.remove('is-portrait');
    scroller.scrollLeft = 0;
    img.src = link.href;
    img.alt = link.querySelector('img')?.alt ?? '';
    caption.textContent = link.dataset.caption ?? '';
    count.textContent = `${index + 1} de ${links.length}`;
    prev.hidden = index === 0;
    next.hidden = index === links.length - 1;
  };
  img.addEventListener('load', () => scroller.classList.toggle('is-portrait', img.naturalHeight > img.naturalWidth));

  links.forEach((link, i) => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return; // deixa abrir em nova aba
      e.preventDefault();
      show(i);
      document.documentElement.classList.add('lb-open');
      dialog.showModal();
    });
  });

  dialog.querySelector('[data-lb-close]')!.addEventListener('click', () => dialog.close());
  prev.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  // clique fora da imagem fecha
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target === scroller) dialog.close();
  });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(index - 1);
    else if (e.key === 'ArrowRight') show(index + 1);
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('lb-open');
    links[index].focus({preventScroll: true});
  });
}
