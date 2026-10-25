// Dimensões geradas por scripts/prepare-assets.sh (public/img/manifest.json).
const BASE = import.meta.env.BASE_URL;

const DIMS = {
  'os-clientes': {widths: [560, 1120], h: 609},
  'os-status': {widths: [420, 826], h: 610},
  'os-valores': {widths: [364, 728], h: 613},
  'os-situacao': {widths: [334, 669], h: 610},
  'pecas-lista': {widths: [564, 1128], h: 613},
  'pecas-saldo': {widths: [786, 1571], h: 613},
  movimentacoes: {widths: [752, 1504], h: 417},
  resumo: {widths: [640, 1280], h: 977},
  checklist: {widths: [480, 960], h: 1357},
  orcamento: {widths: [480, 960], h: 1357},
  'guia-p1': {widths: [480, 960], h: 1357},
  'guia-p4': {widths: [480, 960], h: 1357},
  'hero-planilha': {widths: [640, 1280], h: 419},
  'hero-planilha-m': {widths: [420, 840], h: 421},
  'hero-saldo': {widths: [440, 880], h: 102},
  'resumo-valores': {widths: [560, 1120], h: 158},
  'video-capa': {widths: [360, 720], h: 1280},
} as const;

export type ImageName = keyof typeof DIMS;

export const image = (name: ImageName) => {
  const d = DIMS[name];
  const max = d.widths[d.widths.length - 1];
  return {
    src: `${BASE}img/${name}-${max}.webp`,
    srcSet: d.widths.map((w) => `${BASE}img/${name}-${w}.webp ${w}w`).join(', '),
    width: max,
    height: d.h,
  };
};

export const asset = (path: string) => `${BASE}${path}`;
