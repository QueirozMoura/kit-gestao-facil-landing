/**
 * Motor de rolagem: liga o progresso do scroll a variáveis CSS, sem estado do React.
 *
 * Cada elemento [data-scene] recebe, só enquanto está perto da tela:
 *   --p    0 → 1   travessia pela tela (0: entrando por baixo, 1: saindo por cima)
 *   --s   -1 → 1   o mesmo, centrado (0: no meio da tela). Usado pelo fundo.
 *   --in   0 → 1   "acomodar": 0 com o topo na borda de baixo, 1 com o topo a 25% da altura
 *   --out  0 → 1   "afastar": 0 com o topo na borda de cima, 1 quando já passou
 * O CSS declara valores padrão (peças acomodadas), então sem JS ou com movimento reduzido
 * a página aparece pronta. data-span="0.6" encurta o trecho de --in/--out (fração da altura).
 *
 * Regras que mantêm a rolagem leve:
 * - um único listener de scroll (passivo) e um único requestAnimationFrame por quadro;
 * - medidas (posição e altura) ficam em cache e só são refeitas ao redimensionar ou quando a página muda de altura;
 * - por quadro: lê scrollY uma vez e só depois escreve as variáveis (sem alternar leitura e escrita de layout);
 * - elementos fora da tela não são atualizados; aba oculta pausa tudo;
 * - [data-scene] nunca recebe transform (as medidas dependem disso): só os filhos se movem.
 */

type Scene = {el: HTMLElement; top: number; h: number; span: number; visible: boolean; last: string};

const scenes = new Map<HTMLElement, Scene>();
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (t: number) => t * t * (3 - 2 * t);
const fmt = (v: number) => (Math.round(v * 500) / 500).toString();

let io: IntersectionObserver | null = null;
let ro: ResizeObserver | null = null;
let running = false;
let raf = 0;
let measureRaf = 0;
let lastW = 0;

function measure() {
  measureRaf = 0;
  const y = window.scrollY;
  for (const s of scenes.values()) {
    const r = s.el.getBoundingClientRect();
    s.top = r.top + y;
    s.h = r.height;
  }
  schedule();
}

function scheduleMeasure() {
  if (!measureRaf) measureRaf = requestAnimationFrame(measure);
}

function write() {
  raf = 0;
  if (!running) return;
  const y = window.scrollY;
  const vh = window.innerHeight;
  // Fase de leitura terminada: só escrita a partir daqui.
  for (const s of scenes.values()) {
    if (!s.visible) continue;
    const p = clamp01((y + vh - s.top) / (vh + s.h));
    const span = Math.max(s.h * s.span, 1);
    const settle = smooth(clamp01((y + vh - s.top) / (vh * 0.75)));
    const out = smooth(clamp01((y - s.top) / span));
    const sig = `${fmt(p)}|${fmt(settle)}|${fmt(out)}`;
    if (sig === s.last) continue;
    s.last = sig;
    const st = s.el.style;
    st.setProperty('--p', fmt(p));
    st.setProperty('--s', fmt(p * 2 - 1));
    st.setProperty('--in', fmt(settle));
    st.setProperty('--out', fmt(out));
  }
}

function schedule() {
  if (running && !raf) raf = requestAnimationFrame(write);
}

function onResize() {
  // Barra de endereço do celular só muda a altura: as medidas continuam valendo.
  if (window.innerWidth !== lastW) {
    lastW = window.innerWidth;
    scheduleMeasure();
  }
  schedule();
}

function onVisibility() {
  document.documentElement.dataset.tab = document.hidden ? 'hidden' : 'visible';
  if (!document.hidden) schedule();
}

function start() {
  if (running) return;
  running = true;
  document.documentElement.dataset.motion = 'on';
  lastW = window.innerWidth;
  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const s = scenes.get(e.target as HTMLElement);
        if (!s) continue;
        s.visible = e.isIntersecting;
        // Dica de composição só enquanto a seção está perto da tela (evita camadas permanentes).
        s.el.toggleAttribute('data-on', s.visible);
      }
      schedule();
    },
    {rootMargin: '25% 0px 25% 0px'},
  );
  for (const s of scenes.values()) io.observe(s.el);
  // Imagens carregadas sob demanda mudam a altura da página: refaz as medidas.
  if ('ResizeObserver' in window) {
    ro = new ResizeObserver(scheduleMeasure);
    ro.observe(document.body);
  }
  window.addEventListener('scroll', schedule, {passive: true});
  window.addEventListener('resize', onResize, {passive: true});
  window.addEventListener('orientationchange', scheduleMeasure);
  window.addEventListener('load', scheduleMeasure);
  document.addEventListener('visibilitychange', onVisibility);
  scheduleMeasure();
}

function stop() {
  if (!running) return;
  running = false;
  document.documentElement.dataset.motion = 'off';
  cancelAnimationFrame(raf);
  cancelAnimationFrame(measureRaf);
  raf = measureRaf = 0;
  io?.disconnect();
  ro?.disconnect();
  io = ro = null;
  window.removeEventListener('scroll', schedule);
  window.removeEventListener('resize', onResize);
  window.removeEventListener('orientationchange', scheduleMeasure);
  window.removeEventListener('load', scheduleMeasure);
  document.removeEventListener('visibilitychange', onVisibility);
  // Volta aos valores padrão do CSS (peças acomodadas, nada deslocado).
  for (const s of scenes.values()) {
    s.last = '';
    s.visible = false;
    s.el.removeAttribute('data-on');
    for (const k of ['--p', '--s', '--in', '--out']) s.el.style.removeProperty(k);
  }
}

/** Liga o motor à página e acompanha a preferência de movimento, inclusive se mudar durante a sessão. */
export function initScrollScenes(): () => void {
  for (const el of document.querySelectorAll<HTMLElement>('[data-scene]')) {
    scenes.set(el, {el, top: 0, h: 0, span: Number(el.dataset.span) || 1, visible: false, last: ''});
  }
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sync = () => (mq.matches ? stop() : start());
  sync();
  mq.addEventListener('change', sync);
  return () => {
    mq.removeEventListener('change', sync);
    stop();
    scenes.clear();
  };
}

/**
 * Inclinação do conjunto do hero pelo mouse (só com mouse de verdade e sem movimento reduzido).
 * Escreve --mx/--my (-1 a 1), suavizados; o loop só roda enquanto o valor ainda está mudando.
 */
export function initPointerTilt(root: HTMLElement): () => void {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  let tx = 0;
  let ty = 0;
  let x = 0;
  let y = 0;
  let raf = 0;
  let rect: DOMRect | null = null;

  const tick = () => {
    raf = 0;
    x += (tx - x) * 0.12;
    y += (ty - y) * 0.12;
    root.style.setProperty('--mx', x.toFixed(3));
    root.style.setProperty('--my', y.toFixed(3));
    if (Math.abs(tx - x) > 0.002 || Math.abs(ty - y) > 0.002) raf = requestAnimationFrame(tick);
  };
  const kick = () => {
    if (!raf) raf = requestAnimationFrame(tick);
  };
  const enter = () => {
    rect = root.getBoundingClientRect();
  };
  const move = (ev: PointerEvent) => {
    if (ev.pointerType !== 'mouse' || mq.matches || !fine.matches || document.hidden) return;
    if (!rect) rect = root.getBoundingClientRect();
    tx = clamp01((ev.clientX - rect.left) / rect.width) * 2 - 1;
    ty = clamp01((ev.clientY - rect.top) / rect.height) * 2 - 1;
    kick();
  };
  const leave = () => {
    rect = null;
    tx = ty = 0;
    kick();
  };
  const reset = () => {
    if (!mq.matches) return;
    tx = ty = x = y = 0;
    root.style.removeProperty('--mx');
    root.style.removeProperty('--my');
  };

  root.addEventListener('pointerenter', enter);
  root.addEventListener('pointermove', move);
  root.addEventListener('pointerleave', leave);
  mq.addEventListener('change', reset);
  return () => {
    root.removeEventListener('pointerenter', enter);
    root.removeEventListener('pointermove', move);
    root.removeEventListener('pointerleave', leave);
    mq.removeEventListener('change', reset);
    cancelAnimationFrame(raf);
  };
}
