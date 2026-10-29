/**
 * Checkout (Kiwify) e dados do produto. Fonte única: o index.html recebe estes valores no build
 * (%CHECKOUT_URL%, %PRICE%, %AMOUNT%) e o JavaScript só acrescenta os parâmetros de campanha (UTM) ao link.
 */
export const CHECKOUT_URL = 'https://pay.kiwify.com.br/xP0Ippe';

export const PRODUCT = {
  name: 'Kit Gestão Fácil para Assistência Técnica',
  shortName: 'Kit Gestão Fácil',
  amount: '19,90',
  price: 'R$ 19,90',
  priceNote: 'Pagamento único',
} as const;
