# Kit Gestão Fácil · landing page

Página de venda do **Kit Gestão Fácil para Assistência Técnica** (planilha de serviços, controle de peças e documentos editáveis).
React 19 + TypeScript + Vite. Página única e estática: sem backend, analytics, cookies ou formulários.

## Instalação, execução e build

Requer Node.js 20+.

```bash
npm install        # instala as dependências (versões fixadas)
npm run dev        # desenvolvimento: http://127.0.0.1:5173/
npm run build      # confere os tipos (tsc) e gera dist/
npm run preview    # serve o build: http://127.0.0.1:4173/
```

`dist/` é autossuficiente (caminhos relativos) e pode ser hospedada em qualquer lugar. Este repositório não faz deploy.

## Configurar o checkout (`CHECKOUT_URL`)

Edite **uma linha** em `src/config.ts`:

```ts
export const CHECKOUT_URL = 'https://pay.kiwify.com.br/SEU-LINK';
```

- **Vazio** (estado atual): os botões "Quero o kit" levam à seção da oferta e o botão final de compra aparece desabilitado ("Checkout em preparação").
- **Preenchido:** todos os botões de compra abrem esse endereço. Depois rode `npm run build`.

## Onde editar

| O quê | Arquivo |
|---|---|
| Checkout, nome e **preço** (fonte única) | `src/config.ts` |
| Textos (título, antes/depois, kit, passos, oferta, FAQ) | `src/content.ts` |
| Cores, tipografia, espaçamentos, animações | `src/styles.css` |
| Entradas de seção, inclinação do hero pelo mouse | `src/hooks/useMotion.ts` |
| Movimento ligado à rolagem (variáveis `--s`, `--in`, `--out`) | `src/hooks/scrollScenes.ts` (marque seções com `data-scene`) |
| Fundo em camadas (luzes, planos de grade) e parallax | `src/components/Backdrop.tsx`, `src/depth.css` |
| Estrutura das seções | `src/components/` |
| Dimensões das imagens | `src/images.ts` |

O preço vem só de `src/config.ts` (`PRODUCT`): botões, FAQ, oferta, barra fixa, rodapé e o `<title>`/descrição do `index.html` (via `%PRICE%`, substituído no build) derivam dele.

## Imagens e vídeo

`public/img` tem apenas recortes em baixa resolução da planilha **demonstrativa** (dados fictícios) e de páginas dos documentos, em WebP. `public/video` tem o MP4 de 30 s.
Os arquivos completos vendidos no kit (planilhas, Word, PDFs) **não** fazem parte deste repositório.

`npm run assets` (`scripts/prepare-assets.sh`) regenera as imagens a partir dos originais e só funciona para quem os tem ao lado do projeto; o build não depende disso.

## Revisão visual (opcional)

Com `npm run preview` rodando e um Chrome/Chromium instalado:

```bash
CHROME_PATH=/usr/bin/chromium node scripts/shots.mjs      # capturas em review/ (desktop, celular, movimento reduzido)
CHROME_PATH=/usr/bin/chromium node scripts/interact2.mjs  # hover, foco, inclinação, sem JS
```

## Pendências antes de publicar (fora da página)

1. Preencher `CHECKOUT_URL` com o link da Kiwify.
2. Conferir se "área de membros" descreve a entrega configurada na Kiwify.
3. Política de privacidade, termos e suporte: a página não tem nenhum; verifique se são exigidos.
4. Dados do vendedor, domínio/hospedagem, imagem de compartilhamento e favicon definitivo, se desejar.
5. Validar a importação no Google Planilhas (a página diz que ainda não foi testada).
6. Conferir preço e conteúdo no checkout.
