/**
 * LINK DO CHECKOUT (Kiwify)
 * -------------------------
 * Cole aqui o endereço do checkout quando ele estiver pronto, por exemplo:
 *   export const CHECKOUT_URL = 'https://pay.kiwify.com.br/XXXXXXX';
 *
 * Vazio  → os botões de navegação levam à seção da oferta e o botão final de compra
 *          fica indisponível ("Checkout em preparação").
 * Preenchido → TODOS os botões de compra passam a abrir este endereço.
 */
export const CHECKOUT_URL = 'https://pay.kiwify.com.br/xP0Ippe';

/** Fonte única de preço e dados do produto: textos, botões, FAQ e <meta> derivam daqui. */
const CURRENCY = 'R$';
const AMOUNT = '39,90';

export const PRODUCT = {
  name: 'Kit Gestão Fácil para Assistência Técnica',
  shortName: 'Kit Gestão Fácil',
  currency: CURRENCY,
  amount: AMOUNT,
  price: `${CURRENCY}${AMOUNT}`,
  priceNote: 'Pagamento único',
  tagline: 'Kit digital para assistências técnicas',
} as const;

export const hasCheckout = CHECKOUT_URL.trim().length > 0;
/** Destino dos botões de ação: checkout (se configurado) ou a seção da oferta. */
export const ctaHref = hasCheckout ? CHECKOUT_URL.trim() : '#oferta';
