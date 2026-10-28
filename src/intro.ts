/**
 * Abertura cinematográfica: a cena fica presa na tela e a sequência de quadros (public/hero) avança e
 * retrocede com a rolagem NATIVA. Nada toca sozinho e nenhum scroll é interceptado.
 *
 * - O poster (<img> no HTML) aparece sem esperar JavaScript; o <canvas> só assume depois que o primeiro
 *   quadro estiver decodificado, e é idêntico ao poster (mesmo recorte, via object-fit).
 * - Os quadros só começam a baixar na primeira interação (ou 2,5 s após o carregamento), do mais espaçado
 *   para o mais denso, então qualquer ponto da rolagem já tem um quadro próximo.
 * - Na memória ficam os arquivos comprimidos (poucos KB) e um cache pequeno de quadros decodificados.
 * - Economia de dados, conexão lenta ou falha de carregamento: o poster fica parado (modo estático).
 */

const FRAMES = 43; // mesmo número de scripts/build-hero-sequence.sh
const MOBILE_QUERY = '(max-width: 760px)';
const SIZES = {d: {w: 1280, h: 720}, m: {w: 576, h: 720}} as const;
const CACHE = {d: 10, m: 16}; // quadros decodificados mantidos (1280×720 ≈ 3,7 MB cada)
const CONCURRENCY = {d: 3, m: 2};
const BASE = import.meta.env.BASE_URL;

type Variant = keyof typeof SIZES;
type Drawable = ImageBitmap | HTMLImageElement;

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Ordem de download: espaçado primeiro (0, 8, 16…), depois os intermediários. */
function loadOrder(): number[] {
  const seen = new Set<number>();
  const out: number[] = [];
  for (const step of [8, 4, 2, 1]) {
    for (let i = 0; i < FRAMES; i += step) if (!seen.has(i)) (seen.add(i), out.push(i));
    if (!seen.has(FRAMES - 1)) (seen.add(FRAMES - 1), out.push(FRAMES - 1));
  }
  return out;
}

function shouldStayStatic(): boolean {
  const c = (navigator as Navigator & {connection?: {saveData?: boolean; effectiveType?: string}}).connection;
  return Boolean(c?.saveData) || c?.effectiveType === 'slow-2g' || c?.effectiveType === '2g';
}

export function initIntro(): {destroy: () => void} | undefined {
  const root = document.querySelector<HTMLElement>('[data-intro]');
  const canvas = document.querySelector<HTMLCanvasElement>('[data-intro-canvas]');
  const stage = root?.querySelector<HTMLElement>('.intro-stage');
  const ctx = canvas?.getContext('2d', {alpha: false});
  if (!root || !canvas || !stage || !ctx) return;

  if (shouldStayStatic()) {
    root.classList.add('is-static');
    return;
  }

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia(MOBILE_QUERY);

  let variant: Variant = mobile.matches ? 'm' : 'd';
  let destroyed = false;
  let visible = true;
  let dirty = true;
  let raf = 0;
  let want = 0; // quadro desejado para o progresso atual
  let drawn = -1;
  let lastKey = '';
  let engaged = false;
  let failed = false;
  let failures = 0;
  let abort = new AbortController();

  const blobs = new Map<number, Blob>(); // arquivos comprimidos
  const bitmaps = new Map<number, Drawable>(); // decodificados (ordem de inserção = LRU)
  const decoding = new Map<number, Promise<Drawable | undefined>>();
  const requested = new Set<number>();

  const url = (i: number) => `${BASE}hero/${variant}-${String(i).padStart(3, '0')}.webp`;

  function sizeCanvas() {
    const {w, h} = SIZES[variant];
    if (canvas!.width !== w || canvas!.height !== h) {
      canvas!.width = w; // tamanho nativo do quadro: sem ampliar e sem depender do devicePixelRatio
      canvas!.height = h;
    }
  }

  function release(d: Drawable) {
    if ('close' in d) d.close();
  }

  function resetFrames() {
    abort.abort();
    abort = new AbortController();
    blobs.clear();
    bitmaps.forEach(release);
    bitmaps.clear();
    decoding.clear();
    requested.clear();
    drawn = -1;
    canvas!.classList.remove('is-ready');
    queue = loadOrder();
    sizeCanvas();
  }

  // ---------- decodificação e cache ----------
  function decode(i: number): Promise<Drawable | undefined> {
    const cached = bitmaps.get(i);
    if (cached) {
      bitmaps.delete(i);
      bitmaps.set(i, cached); // marca como recente
      return Promise.resolve(cached);
    }
    const blob = blobs.get(i);
    if (!blob) return Promise.resolve(undefined);
    let p = decoding.get(i);
    if (!p) {
      const v = variant;
      p = (async () => {
        let d: Drawable;
        if ('createImageBitmap' in window) {
          d = await createImageBitmap(blob);
        } else {
          const el = new Image();
          el.src = URL.createObjectURL(blob);
          await el.decode();
          URL.revokeObjectURL(el.src);
          d = el;
        }
        if (destroyed || v !== variant) {
          release(d);
          return undefined;
        }
        bitmaps.set(i, d);
        trim();
        return d;
      })()
        .catch(() => undefined)
        .finally(() => decoding.delete(i));
      decoding.set(i, p);
    }
    return p;
  }

  function trim() {
    const max = CACHE[variant];
    for (const key of bitmaps.keys()) {
      if (bitmaps.size <= max) break;
      if (key === want || key === drawn) continue;
      release(bitmaps.get(key)!);
      bitmaps.delete(key);
    }
  }

  /** Quadro carregado mais próximo do desejado. */
  function nearest(target: number): number {
    if (blobs.has(target)) return target;
    for (let d = 1; d < FRAMES; d++) {
      if (blobs.has(target - d)) return target - d;
      if (blobs.has(target + d)) return target + d;
    }
    return -1;
  }

  async function render() {
    if (destroyed || failed) return;
    const target = want;
    const use = nearest(target);
    if (use < 0 || use === drawn) return;
    const frame = await decode(use);
    if (!frame || destroyed) return;
    // chegou tarde? só desenha se ainda for o melhor quadro disponível
    if (nearest(want) !== use && bitmaps.has(nearest(want))) return render();
    ctx!.drawImage(frame, 0, 0);
    drawn = use;
    canvas!.classList.add('is-ready');
    // aquece o vizinho na direção da rolagem
    const ahead = use + (target >= use ? 1 : -1);
    if (blobs.has(ahead)) void decode(ahead);
  }

  // ---------- download progressivo ----------
  let queue = loadOrder();
  let inflight = 0;

  async function fetchFrame(i: number) {
    const signal = abort.signal;
    const v = variant;
    try {
      const res = await fetch(url(i), {signal, priority: 'low'} as RequestInit);
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      if (destroyed || v !== variant) return;
      blobs.set(i, blob);
      dirty = true;
      schedule();
    } catch {
      if (signal.aborted || destroyed) return;
      requested.delete(i); // uma segunda chance no final da fila
      if (++failures > 6 && blobs.size < 2) giveUp();
      else if (failures <= 6) queue.push(i);
    }
  }

  function pump() {
    if (destroyed || failed || !engaged) return;
    while (inflight < CONCURRENCY[variant] && queue.length) {
      const i = queue.shift()!;
      if (requested.has(i) || blobs.has(i)) continue;
      requested.add(i);
      inflight++;
      void fetchFrame(i).finally(() => {
        inflight--;
        pump();
      });
    }
  }

  function giveUp() {
    failed = true;
    abort.abort();
    // se a pessoa ainda não rolou, volta a uma página comum (sem trecho de rolagem vazio)
    if (window.scrollY < 4) root!.classList.add('is-static');
    canvas!.classList.remove('is-ready');
  }

  function engage() {
    if (engaged || destroyed || motion.matches) return; // movimento reduzido: não baixa a sequência
    engaged = true;
    removeEngageListeners();
    pump();
  }
  const engageEvents = ['scroll', 'pointerdown', 'touchstart', 'keydown', 'wheel'] as const;
  const removeEngageListeners = () => engageEvents.forEach((e) => window.removeEventListener(e, engage));
  engageEvents.forEach((e) => window.addEventListener(e, engage, {passive: true, once: true}));
  const idleTimer = window.setTimeout(engage, 2500);

  // ---------- progresso da rolagem ----------
  function update() {
    raf = 0;
    if (destroyed) return;
    if (motion.matches || root!.classList.contains('is-static')) return;
    const run = root!.offsetHeight - stage!.offsetHeight;
    if (run <= 0) return;
    const p = clamp(-root!.getBoundingClientRect().top / run);
    // quadros: pequena pausa no começo e no fim para o texto respirar
    const t = clamp((p - 0.03) / 0.89);
    want = Math.round(t * (FRAMES - 1));
    const a = 1 - smooth(0.3, 0.46, p);
    const b = smooth(0.52, 0.68, p);
    const key = `${want}|${a.toFixed(3)}|${b.toFixed(3)}`;
    if (key !== lastKey) {
      lastKey = key;
      root!.style.setProperty('--a', a.toFixed(3));
      root!.style.setProperty('--b', b.toFixed(3));
    }
    if (dirty) {
      dirty = false;
      void render();
    }
  }

  function schedule() {
    if (!raf && visible && !destroyed) raf = requestAnimationFrame(update);
  }

  const onScroll = () => {
    dirty = true;
    schedule();
  };
  window.addEventListener('scroll', onScroll, {passive: true});
  window.addEventListener('resize', onScroll, {passive: true});

  // só trabalha enquanto a abertura está perto da tela
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver(
        ([e]) => {
          visible = e.isIntersecting;
          if (visible) onScroll();
        },
        {rootMargin: '25% 0px'},
      )
    : undefined;
  io?.observe(root);

  const onMobileChange = () => {
    variant = mobile.matches ? 'm' : 'd';
    resetFrames();
    if (engaged) pump();
    onScroll();
  };
  mobile.addEventListener('change', onMobileChange);
  motion.addEventListener('change', () => {
    if (!motion.matches) engage();
    onScroll();
  });

  resetFrames();
  onScroll();

  return {
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      clearTimeout(idleTimer);
      removeEngageListeners();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      mobile.removeEventListener('change', onMobileChange);
            io?.disconnect();
      abort.abort();
      bitmaps.forEach(release);
      bitmaps.clear();
      blobs.clear();
    },
  };
}
