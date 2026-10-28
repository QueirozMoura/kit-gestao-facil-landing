# Kit Gestão Fácil · landing page

Página de venda do **Kit Gestão Fácil para Assistência Técnica** (R$ 39,90, pagamento único). Página estática: HTML + CSS + ~3 KB de JavaScript (TypeScript + Vite, **sem React**). Todo o conteúdo comercial está em `index.html` e é legível sem JavaScript.

```bash
npm install
npm run dev        # http://127.0.0.1:5173/
npm run build      # tsc --noEmit + vite build → dist/ (caminhos relativos, sem deploy)
npm run preview    # http://127.0.0.1:4173/
```

Não há linter configurado; a verificação estática é o `tsc` do build.

## Estrutura

| O quê | Onde |
|---|---|
| Textos e seções (abertura, demonstração, kit, como funciona, oferta, FAQ, rodapé) | `index.html` |
| Checkout, nome e preço (fonte única; entram no HTML no build via `%CHECKOUT_URL%`, `%PRICE%`, `%AMOUNT%`) | `src/config.ts` |
| Visual | `src/styles.css` |
| Animação da abertura | `src/intro.ts` |
| Ampliação das capturas | `src/lightbox.ts` |
| Cabeçalho, barra de compra, estado "depois da abertura" | `src/chrome.ts` |
| UTM + evento de clique no checkout | `src/tracking.ts` |

## Abertura com rolagem

`.intro` é uma faixa alta (100svh + 200vh no desktop, + 105vh no celular) com um palco `position: sticky`. `src/intro.ts` calcula o progresso pela posição da faixa (rolagem nativa, nada é interceptado) e, em `requestAnimationFrame` e só quando o valor muda, desenha o quadro correspondente num `<canvas>` e atualiza `--a`/`--b` (opacidade dos dois textos). Rolar para cima retrocede a cena; nada toca sozinho.

- **Origem:** primeiro vídeo da bancada (1280×720, 24 fps) + imagem de apoio. Usados os quadros 1–84 (0–3,5 s), de 2 em 2 (12 quadros/s). Depois do quadro ~88 o teclado e a caneta do notebook se deformam e em ~130 há corte de câmera; esse trecho foi descartado, sem zoom nem interpolação. O quadro 0 é a própria imagem, igual ao poster.
- **Gerar de novo:** `FFMPEG=/caminho/ffmpeg npm run sequence` (`scripts/build-hero-sequence.sh`). Saída em `public/hero`: `d-NNN.webp` (desktop, 1280×720, nativo) e `m-NNN.webp` (celular, recorte 4:5 de 576×720 que acompanha o notebook), 43 quadros cada.
- **Carregamento:** só o poster no início (`<img>` + `preload`). Os quadros começam na primeira interação (ou 2,5 s após o load), em ordem espaçada→densa, com 3 (desktop) ou 2 (celular) downloads simultâneos. Na memória: arquivos comprimidos + cache LRU de 10 (desktop) / 16 (celular) quadros decodificados. O canvas usa o tamanho nativo do quadro (sem ampliar nem depender do devicePixelRatio); a imagem para de crescer acima de 1664 px de largura.
- **Fallbacks:** `prefers-reduced-motion` → página comum, imagem parada, os dois textos em sequência e nenhum quadro baixado. `Save-Data`/2G ou falha dos quadros → modo estático (`.is-static`). Sem JavaScript → idem. Quadros que faltam no meio da rolagem: usa o mais próximo já carregado.
- **A cena é ilustrativa:** há uma legenda na abertura dizendo que a planilha na tela não é a do kit. As capturas reais (versão demonstrativa, dados fictícios) vêm logo abaixo.

## Imagens

`public/img` guarda recortes reais da planilha demonstrativa e das páginas dos documentos, em WebP em 2 larguras. `npm run assets` (`scripts/prepare-assets.sh`) regenera a partir dos originais (precisa de LibreOffice, poppler e Pillow; o build não depende disso). O recorte do Resumo termina na tabela de valores, porque o aviso amarelo abaixo ficava cortado.

## Rastreamento (Meta Pixel `1118427907435809`)

Auditoria do que existia: `index.html` tinha `fbq('init')` + `fbq('track','PageView')` uma única vez (o `<noscript>` só dispara sem JavaScript, então não duplica), sem outros eventos e sem tratamento de UTM. Mantido.

- **PageView:** uma vez, no `<head>`.
- **Clique no botão de compra:** evento **personalizado** `CheckoutClick` (`trackCustom`), com `placement` (abertura, cabeçalho, barra, oferta) e o nome do produto. Sem valor e sem dados pessoais. Não é `Purchase` nem `InitiateCheckout` (este fica para o checkout da Kiwify, para não duplicar).
- **UTM:** `utm_*`, `src` e `sck` da URL da página são repassados ao link do checkout (`https://pay.kiwify.com.br/xP0Ippe`).
- **Compra aprovada (`Purchase`):** **não** é disparada pela página e não foi verificada. Só pode vir da Kiwify (integração de Pixel do produto na Kiwify, com o mesmo ID) ou da API de Conversões. Conferir lá, com uma compra de teste, antes de reativar anúncios.

## Revisão em navegador

Com `npm run preview` rodando e um Chrome/Chromium: `CHROME_PATH=... node scripts/review.mjs` (abertura em vários cenários) e `node scripts/review-page.mjs` (página inteira, FAQ, ampliação, links). Capturas em `review/` (ignorada pelo git).

## Pendências fora da página

1. Conferir na Kiwify como os arquivos são entregues (a página diz só "acessar e baixar depois da aprovação") e o rastreamento de compra.
2. Política de privacidade, termos e suporte: a página não tem; verifique se são exigidos.
3. Imagem de compartilhamento (og:image) e domínio/hospedagem.
4. Validar a importação no Google Planilhas (a página diz que não foi testada).
