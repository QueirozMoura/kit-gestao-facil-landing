import {PRODUCT} from './config';

// O Pixel da Meta é iniciado uma única vez, no <head> do index.html (init + PageView).
// Aqui ficam só (1) a repasse da campanha ao checkout e (2) o evento de clique no botão de compra.

/** Parâmetros de campanha que a Kiwify entende e que chegam na URL da página. */
const isCampaignParam = (name: string) => name.startsWith('utm_') || name === 'src' || name === 'sck';

function forwardCampaign(links: NodeListOf<HTMLAnchorElement>) {
  const incoming = new URLSearchParams(window.location.search);
  const campaign = [...incoming].filter(([k, v]) => isCampaignParam(k) && v);
  if (!campaign.length) return;
  for (const a of links) {
    const url = new URL(a.href, window.location.href);
    for (const [k, v] of campaign) if (!url.searchParams.has(k)) url.searchParams.set(k, v);
    a.href = url.toString();
  }
}

type Fbq = (...args: unknown[]) => void;

function onCheckoutClick(event: MouseEvent) {
  const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[data-checkout]');
  if (!link) return;
  try {
    // Evento personalizado, sem valor e sem dados pessoais. Não é Purchase: compra aprovada só pode
    // ser confirmada pela Kiwify (ver README, "Rastreamento").
    (window as unknown as {fbq?: Fbq}).fbq?.('trackCustom', 'CheckoutClick', {
      placement: link.dataset.checkout,
      content_name: PRODUCT.name,
    });
  } catch {
    /* o rastreamento nunca pode atrapalhar a navegação até o checkout */
  }
}

export function initTracking() {
  forwardCampaign(document.querySelectorAll<HTMLAnchorElement>('a[data-checkout]'));
  document.addEventListener('click', onCheckoutClick);
}
