/**
 * Cena global: um palco fixo por trás da página inteira (.world) que evolui com o progresso GLOBAL da
 * rolagem nativa. Nada toca sozinho e nenhum scroll é interceptado.
 *
 * Fonte: o vídeo da oficina (1920×1080, 24 fps, 191 quadros), em resolução nativa. A câmera dele percorre a
 * bancada, entra na placa do celular, ajusta o foco no notebook (quadro HOLD, de frente) e se afasta até a
 * oficina inteira. O mapeamento acompanha essa história:
 *  1. Abertura: do primeiro rolar da página até o quadro HOLD (sem pausa inicial).
 *  2. Demonstração e kit: o quadro HOLD fica parado e quem se move é a câmera da página (escala, deslocamento,
 *     luzes, escurecimento) e a profundidade do conteúdo.
 *  3. Como funciona → oferta: o vídeo volta a tocar, afastando a câmera até a oficina inteira, que fica atrás da
 *     oferta (cena escura, boa para o botão de compra).
 *
 * Quadros: poster no HTML; o resto só após a primeira interação (ou 2,5 s). O próximo quadro a baixar é sempre o
 * mais próximo da posição atual da rolagem (primeiro uma malha espaçada). Na memória: arquivos comprimidos + um
 * cache pequeno de quadros decodificados (LRU). Movimento reduzido: nada disto roda.
 */

const SRC_LAST = 190; // último quadro (base 0) do vídeo
const HOLD = 126; // notebook de frente: fim da abertura
const INTRO_FRAMES_END = 0.92; // a abertura chega ao HOLD aos 92% do trecho e segura o resto
// Ritmo da abertura: [progresso (0–1), quadro do vídeo]. As duas "chicotadas" borradas do vídeo (quadros ~56–76 e
// ~96–110, a câmera mergulhando na placa e trocando o foco) passam rápido; a placa nítida (76–96) e a chegada
// ao notebook (110–126) ganham mais rolagem.
const PACE: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [0.42, 56],
  [0.5, 76],
  [0.7, 96],
  [0.76, 110],
  [1, HOLD],
];
function paceToFrame(t: number): number {
  for (let i = 1; i < PACE.length; i++) {
    const [t1, f1] = PACE[i];
    if (t <= t1) {
      const [t0, f0] = PACE[i - 1];
      return f0 + ((f1 - f0) * (t - t0)) / (t1 - t0);
    }
  }
  return HOLD;
}

// Cada variante guarda 1 a cada `step` quadros do vídeo (scripts/build-hero-sequence.sh).
const VARIANTS = {
  d: {w: 1920, h: 1080, step: 2, count: 96, cache: 8, conc: 4}, // quadro inteiro, nativo
  m: {w: 864, h: 1080, step: 3, count: 64, cache: 12, conc: 3}, // recorte 4:5, altura nativa
} as const;
type Variant = keyof typeof VARIANTS;

// Chaves da câmera por seção: [abertura, demonstração, kit, como funciona, oferta, FAQ].
// Entre duas chaves o valor corre linearmente com a rolagem pela seção. Escalas baixas: o vídeo já se move, e
// quanto menor o zoom, mais nítida a cena.
const KEYS = {
  d: {
    s: [1, 1.04, 1.08, 1.12, 1.04, 1.0],
    x: [0, -1, -2.5, -4, -1, 0], // deslocamento, % da largura
    y: [0, 0, -1.5, -2.5, 0, 0],
    dim: [0, 0.8, 0.8, 0.76, 0.5, 0.92],
    la: [0, 0.3, 0.38, 0.34, 0.18, 0],
    lax: [70, 22, 74, 26, 50, 50],
    lay: [30, 62, 34, 66, 40, 40],
  },
  m: {
    s: [1, 1.18, 1.24, 1.3, 1.15, 1.05],
    x: [0, -2, -4, -6, -2, 0],
    y: [0, -1, -3, -4, -1, 0],
    dim: [0, 0.84, 0.86, 0.8, 0.6, 0.94],
    la: [0, 0.3, 0.38, 0.34, 0.18, 0],
    lax: [70, 22, 74, 26, 50, 50],
    lay: [30, 62, 34, 66, 40, 40],
  },
} as const;
const SECTIONS = ['demonstracao', 'kit', 'como-funciona', 'oferta', 'duvidas'];
const ZOOM_HEADROOM = 1.12; // o buffer do canvas já prevê o zoom máximo da câmera
const BLEND = true; // mistura de quadros vizinhos reais (ver render)
const MOBILE_QUERY = '(max-width: 760px)';
const BASE = import.meta.env.BASE_URL;

type Drawable = ImageBitmap | HTMLImageElement;

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

function lowData(): boolean {
  const c = (navigator as Navigator & {connection?: {saveData?: boolean; effectiveType?: string}}).connection;
  return Boolean(c?.saveData) || c?.effectiveType === 'slow-2g' || c?.effectiveType === '2g';
}

export function initScene(): {destroy: () => void} | undefined {
  const root = document.querySelector<HTMLElement>('[data-intro]');
  const world = document.querySelector<HTMLElement>('[data-world]');
  const canvas = document.querySelector<HTMLCanvasElement>('[data-intro-canvas]');
  const stage = root?.querySelector<HTMLElement>('.intro-stage');
  const ctx = canvas?.getContext('2d', {alpha: false});
  if (!root || !world || !canvas || !stage || !ctx) return;
  const html = document.documentElement;
  const sections = SECTIONS.map((id) => document.getElementById(id));
  const offer = document.getElementById('oferta');
  const fx = [...document.querySelectorAll<HTMLElement>('[data-fx]')].map((el) => ({el, delay: Number(el.dataset.fxDelay ?? 0), key: ''}));

  // Economia de dados: sem quadros (o poster fica), mas a câmera e as luzes continuam.
  let noFrames = lowData();
  if (noFrames) html.classList.add('no-frames');

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia(MOBILE_QUERY);

  let variant: Variant = mobile.matches ? 'm' : 'd';
  let destroyed = false;
  let dirty = true;
  let raf = 0;
  let pos = 0; // posição desejada, em quadros do vídeo (0 … SRC_LAST)
  let lastPos = 0;
  let dir = 1; // sentido da rolagem (+1 = avançando)
  let drawnKey = '';
  let lastKey = '';
  let engaged = noFrames; // sem quadros, nunca engata o download
  let failed = false;
  let failures = 0;
  let abort = new AbortController();

  const blobs = new Map<number, Blob>(); // arquivos comprimidos, por índice da variante
  const bitmaps = new Map<number, Drawable>(); // decodificados (ordem de inserção = LRU)
  const decoding = new Map<number, Promise<Drawable | undefined>>();
  const requested = new Set<number>();
  const retries = new Map<number, number>();
  const inUse = new Set<number>(); // quadros do desenho atual: nunca descartados
  let inflight = 0;

  const V = () => VARIANTS[variant];
  const url = (k: number) => `${BASE}hero/${variant}-${String(k).padStart(3, '0')}.webp`;

  // ---------- canvas: resolução interna ----------
  // O buffer nunca passa do quadro nativo (não há detalhe a mais para ampliar). Só encolhe quando a tela
  // (em pixels físicos, com devicePixelRatio limitado a 2) mostra muito menos do que o quadro tem.
  function sizeCanvas() {
    const {w, h} = V();
    const cssW = canvas!.offsetWidth || w;
    const cssH = canvas!.offsetHeight || h;
    const cover = Math.max(cssW / w, cssH / h);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let s = clamp(cover * dpr * ZOOM_HEADROOM, 0.5, 1);
    if (s > 0.85) s = 1; // quase nativo: deixa o navegador fazer uma única reamostragem
    const bw = Math.round(w * s);
    const bh = Math.round(h * s);
    if (canvas!.width !== bw || canvas!.height !== bh) {
      canvas!.width = bw; // redimensionar limpa o canvas: força redesenho
      canvas!.height = bh;
      drawnKey = '';
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
    retries.clear();
    inUse.clear();
    inflight = 0;
    drawnKey = '';
    canvas!.classList.remove('is-ready');
    sizeCanvas();
  }

  // ---------- decodificação e cache ----------
  function decode(k: number): Promise<Drawable | undefined> {
    const cached = bitmaps.get(k);
    if (cached) {
      bitmaps.delete(k);
      bitmaps.set(k, cached); // marca como recente
      return Promise.resolve(cached);
    }
    const blob = blobs.get(k);
    if (!blob) return Promise.resolve(undefined);
    let p = decoding.get(k);
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
        bitmaps.set(k, d);
        trim();
        return d;
      })()
        .catch(() => undefined)
        .finally(() => decoding.delete(k));
      decoding.set(k, p);
    }
    return p;
  }

  function trim() {
    const max = V().cache;
    for (const key of bitmaps.keys()) {
      if (bitmaps.size <= max) break;
      if (inUse.has(key)) continue;
      release(bitmaps.get(key)!);
      bitmaps.delete(key);
    }
  }

  /** Quadro carregado mais próximo de k (índice da variante). */
  function nearest(k: number): number {
    if (blobs.has(k)) return k;
    for (let d = 1; d < V().count; d++) {
      if (blobs.has(k - d)) return k - d;
      if (blobs.has(k + d)) return k + d;
    }
    return -1;
  }

  async function render() {
    if (destroyed || failed) return;
    const {step, count, w, h} = V();
    const kPos = clamp(pos / step, 0, count - 1);
    const lo = BLEND ? Math.floor(kPos) : Math.round(kPos);
    const mix = BLEND ? Math.round((kPos - lo) * 8) / 8 : 0;
    const a = nearest(lo);
    const b = mix > 0 ? nearest(Math.min(lo + 1, count - 1)) : -1;
    if (a < 0) return;
    const key = `${variant}|${canvas!.width}|${a}|${b}|${mix}`;
    if (key === drawnKey) return;
    inUse.clear();
    inUse.add(a);
    if (b >= 0) inUse.add(b);
    const [fa, fb] = await Promise.all([decode(a), b >= 0 && b !== a ? decode(b) : Promise.resolve(undefined)]);
    if (!fa || destroyed) return;
    // chegou tarde? só desenha se ainda for o que se quer
    const kNow = clamp(pos / step, 0, count - 1);
    if ((BLEND ? Math.floor(kNow) : Math.round(kNow)) !== lo || (BLEND ? Math.round((kNow - lo) * 8) / 8 : 0) !== mix) return;
    const bw = canvas!.width;
    const bh = canvas!.height;
    ctx!.imageSmoothingEnabled = true;
    ctx!.imageSmoothingQuality = 'high';
    ctx!.globalAlpha = 1;
    ctx!.drawImage(fa, 0, 0, w, h, 0, 0, bw, bh);
    if (fb) {
      ctx!.globalAlpha = mix;
      ctx!.drawImage(fb, 0, 0, w, h, 0, 0, bw, bh);
      ctx!.globalAlpha = 1;
    }
    drawnKey = key;
    canvas!.classList.add('is-ready');
    // aquece o próximo quadro na direção da rolagem
    const ahead = nearest(clamp(lo + (dir > 0 ? 2 : -1), 0, count - 1));
    if (ahead >= 0 && !inUse.has(ahead)) void decode(ahead);
  }

  // ---------- download progressivo, guiado pela posição ----------
  /** Próximo quadro a baixar: primeiro uma malha espaçada (qualquer ponto tem um vizinho perto), depois o mais perto da posição atual. */
  function pickNext(): number {
    const {step, count} = V();
    const kPos = pos / step;
    let best = -1;
    let bestScore = Infinity;
    const consider = (k: number) => {
      if (requested.has(k) || blobs.has(k)) return;
      const d = k - kPos;
      const score = Math.abs(d) + (d * dir < 0 ? 3 : 0); // um pouco de preferência pelo sentido da rolagem
      if (score < bestScore) {
        bestScore = score;
        best = k;
      }
    };
    for (let k = 0; k < count; k += 8) consider(k);
    if (best >= 0) return best;
    for (let k = 0; k < count; k++) consider(k);
    return best;
  }

  async function fetchFrame(k: number) {
    const signal = abort.signal;
    const v = variant;
    try {
      const res = await fetch(url(k), {signal, priority: 'low'} as RequestInit);
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      if (destroyed || v !== variant) return;
      blobs.set(k, blob);
      dirty = true;
      schedule();
    } catch {
      if (signal.aborted || destroyed) return;
      const n = (retries.get(k) ?? 0) + 1;
      retries.set(k, n);
      if (n <= 2) requested.delete(k); // até duas novas tentativas
      if (++failures > 6 && blobs.size < 2) giveUp();
    }
  }

  function pump() {
    if (destroyed || failed || !engaged) return;
    while (inflight < V().conc) {
      const k = pickNext();
      if (k < 0) return;
      requested.add(k);
      inflight++;
      void fetchFrame(k).finally(() => {
        inflight--;
        pump();
      });
    }
  }

  function giveUp() {
    failed = true;
    abort.abort();
    // sem quadros o trecho da abertura encurta; a câmera e as luzes seguem funcionando
    if (!noFrames) html.classList.add('no-frames');
    noFrames = true;
    canvas!.classList.remove('is-ready');
  }

  function engage() {
    if (noFrames || engaged || destroyed || motion.matches) return; // movimento reduzido: não baixa a sequência
    engaged = true;
    removeEngageListeners();
    pump();
  }
  const engageEvents = ['scroll', 'pointerdown', 'touchstart', 'keydown', 'wheel'] as const;
  const removeEngageListeners = () => engageEvents.forEach((e) => window.removeEventListener(e, engage));
  engageEvents.forEach((e) => window.addEventListener(e, engage, {passive: true, once: true}));
  const idleTimer = window.setTimeout(engage, 2500);
  if (noFrames) removeEngageListeners();

  // ---------- progresso global da rolagem ----------
  const lerpKey = (arr: readonly number[], m: number) => {
    const i = Math.min(Math.floor(m), arr.length - 1);
    const f = m - i;
    return arr[i] + ((arr[Math.min(i + 1, arr.length - 1)] ?? arr[i]) - arr[i]) * f;
  };

  function update() {
    raf = 0;
    if (destroyed || motion.matches) return;
    const vh = window.innerHeight;
    const run = root!.offsetHeight - stage!.offsetHeight;
    if (run <= 0) return;

    // --- leituras (sem escrever entre elas) ---
    const introTop = root!.getBoundingClientRect().top;
    const secTops = sections.map((el) => el?.getBoundingClientRect());
    const offerTop = offer?.getBoundingClientRect().top ?? Infinity;
    const fxRects = fx.map((f) => f.el.getBoundingClientRect());

    // --- progresso da abertura (0–1) e posição global da câmera (m: 0 = abertura, 1 = demonstração, … 5 = FAQ) ---
    const p = clamp(-introTop / run);
    let m = p;
    if (p >= 1) {
      m = 1;
      const y = vh * 0.5; // ponto de leitura
      secTops.forEach((r, i) => {
        if (r && r.top <= y) m = 1 + i + clamp((y - r.top) / r.height);
      });
    }

    // --- posição no vídeo ---
    let nextPos: number;
    if (p < 1) {
      nextPos = paceToFrame(clamp(p / INTRO_FRAMES_END)); // começa a andar no primeiro rolar
    } else {
      // de "como funciona" até a oferta, a câmera do vídeo se afasta (HOLD → último quadro)
      const steps = secTops[2];
      if (steps && Number.isFinite(offerTop)) {
        const D = offerTop - steps.top;
        const t = clamp((vh * 0.9 - steps.top) / (vh * 0.9 + D));
        nextPos = HOLD + t * (SRC_LAST - HOLD);
      } else nextPos = HOLD;
    }
    if (Math.abs(nextPos - lastPos) > 0.01) dir = nextPos > lastPos ? 1 : -1;
    lastPos = pos = nextPos;
    const q = p < 1 ? 0 : clamp((vh - offerTop) / (vh * 1.1)); // brilho verde na chegada da oferta

    // --- câmera, escurecimento e luzes ---
    const k = mobile.matches ? KEYS.m : KEYS.d;
    const mc = m < 1 ? smooth(0.6, 1, m) : m; // na abertura a câmera da página só se move perto do fim
    const dim = m < 1 ? k.dim[1] * smooth(0.6, 1, m) : lerpKey(k.dim, m);
    const shade = 1 - smooth(0.9, 1, m); // o degradê do texto fica até o notebook de frente aparecer
    const vars: Record<string, string> = {
      '--s': lerpKey(k.s, mc).toFixed(4),
      '--tx': lerpKey(k.x, mc).toFixed(3) + '%',
      '--ty': lerpKey(k.y, mc).toFixed(3) + '%',
      '--dim': dim.toFixed(3),
      '--shade': shade.toFixed(3),
      '--la': lerpKey(k.la, mc).toFixed(3),
      '--lax': lerpKey(k.lax, mc).toFixed(1) + '%',
      '--lay': lerpKey(k.lay, mc).toFixed(1) + '%',
      '--lb': (q * 0.5).toFixed(3),
    };
    const a = 1 - smooth(0.36, 0.45, p); // o título nunca some: um sai, o outro entra
    const b = smooth(0.45, 0.54, p);
    const key = Object.values(vars).join('|') + `|${pos.toFixed(2)}|${a.toFixed(3)}|${b.toFixed(3)}`;

    // --- blocos de conteúdo: entrada embaixo, saída em cima ---
    const fxVals = fxRects.map((r, i) => {
      const d = fx[i].delay * 0.18;
      const inn = clamp((vh * 0.98 - r.top) / (vh * 0.32) - d);
      const out = clamp((vh * 0.2 - r.bottom) / (vh * 0.25));
      const c = clamp((r.top + r.height / 2 - vh / 2) / vh, -1, 1);
      return [inn.toFixed(2), out.toFixed(2), c.toFixed(2)] as const;
    });

    // --- escritas ---
    if (key !== lastKey) {
      lastKey = key;
      for (const [n, v] of Object.entries(vars)) world!.style.setProperty(n, v);
      root!.style.setProperty('--a', a.toFixed(3));
      root!.style.setProperty('--b', b.toFixed(3));
    }
    fxVals.forEach(([inn, out, c], i) => {
      const k2 = `${inn}|${out}|${c}`;
      if (fx[i].key === k2) return;
      fx[i].key = k2;
      const st = fx[i].el.style;
      st.setProperty('--in', inn);
      st.setProperty('--out', out);
      st.setProperty('--c', c);
    });
    if (dirty) {
      dirty = false;
      void render();
      pump(); // a posição mudou: o próximo download é o mais perto dela
    }
  }

  function schedule() {
    if (!raf && !destroyed) raf = requestAnimationFrame(update);
  }

  const onScroll = () => {
    dirty = true;
    schedule();
  };
  const onResize = () => {
    sizeCanvas();
    onScroll();
  };
  window.addEventListener('scroll', onScroll, {passive: true});
  window.addEventListener('resize', onResize, {passive: true});

  const onMobileChange = () => {
    variant = mobile.matches ? 'm' : 'd';
    resetFrames();
    if (engaged) pump();
    onScroll();
  };
  mobile.addEventListener('change', onMobileChange);
  const onMotionChange = () => {
    if (!motion.matches) engage();
    onScroll();
  };
  motion.addEventListener('change', onMotionChange);

  resetFrames();
  onScroll();

  return {
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      clearTimeout(idleTimer);
      removeEngageListeners();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      mobile.removeEventListener('change', onMobileChange);
      motion.removeEventListener('change', onMotionChange);
      abort.abort();
      bitmaps.forEach(release);
      bitmaps.clear();
      blobs.clear();
    },
  };
}
