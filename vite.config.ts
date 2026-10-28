import {defineConfig} from 'vite';
import {CHECKOUT_URL, PRODUCT} from './src/config';

// base relativa: a pasta dist funciona em qualquer domínio ou subpasta.
// Os marcadores %PRICE%, %AMOUNT% e %CHECKOUT_URL% do index.html vêm de src/config.ts (fonte única).
export default defineConfig({
  base: './',
  plugins: [
    {
      name: 'product-placeholders',
      transformIndexHtml: (html) =>
        html
          .replaceAll('%PRICE%', PRODUCT.price)
          .replaceAll('%AMOUNT%', PRODUCT.amount)
          .replaceAll('%CHECKOUT_URL%', CHECKOUT_URL.trim()),
    },
  ],
  server: {host: '127.0.0.1', port: 5173},
  preview: {host: '127.0.0.1', port: 4173},
});
