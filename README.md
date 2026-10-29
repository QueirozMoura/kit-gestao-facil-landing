# Kit Gestão Fácil · landing page

Página de venda do **Kit Gestão Fácil para Assistência Técnica** (R$ 19,90, pagamento único). Página estática: HTML + CSS + ~3 KB de JavaScript (TypeScript + Vite, **sem React**). Todo o conteúdo comercial está em `index.html` e é legível sem JavaScript.

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
| Cena global, câmera e profundidade | `src/scene.ts` |
| Ampliação das capturas | `src/lightbox.ts` |
| Cabeçalho, barra de compra, estado "depois da abertura" | `src/chrome.ts` |
| UTM + evento de clique no checkout | `src/tracking.ts` |

## Cena global (scrollytelling)

Um palco fixo (`.world`, atrás de todo o conteúdo) acompanha a página inteira e é movido por `src/scene.ts` pelo progresso **global** da rolagem nativa (nada é interceptado, nada toca sozinho). Só `transform` e `opacity` são animados.

1. **Quadros reais (43, nunca inventados):** a abertura (`.intro`: 100svh + 360vh no desktop, + 190vh no celular, palco sticky) avança 10–90% do trecho dela; os últimos 10% seguram o quadro final. Perto da oferta, a câmera **recua** por 20 quadros (42 → 22). No resto da página o quadro não muda: quem se mexe é a câmera.
2. **Câmera independente:** escala, deslocamento, escurecimento (`--dim`) e luzes (`--la`, `--lb`) interpolados entre chaves por seção (abertura → demonstração → kit → como funciona → oferta → FAQ), com o ponto de leitura no meio da tela. As chaves estão em `KEYS` (`src/scene.ts`); a imagem fica sempre sob o escurecimento (≥ 50%, 70–76% no conteúdo), então a ampliação acima de 1,3× não aparece como perda de qualidade.
3. **Profundidade do conteúdo:** blocos com `data-fx` entram por baixo (translate, perspectiva e escala) e saem por cima; capturas (`data-fx="shot"`) ganham `rotateX` e paralaxe pela posição.
4. **Fim:** a oferta fica sobre uma base escura (o fundo nunca disputa com o botão), e uma faixa de 9rem dissolve a cena no grafite do FAQ, que é sólido.

- **Origem:** primeiro vídeo da bancada (quadros 1–84, de 2 em 2) + imagem de apoio; o trecho depois do quadro ~88 deforma o notebook e há corte de câmera em ~130, então não é usado. Gerar de novo: `FFMPEG=/caminho/ffmpeg npm run sequence`. Saída em `public/hero` (`d-NNN` 1280×720; `m-NNN` recorte 4:5 de 576×720).
- **Mistura de quadros:** o canvas mistura dois quadros vizinhos reais para o percurso longo não andar aos saltos (`BLEND` em `src/scene.ts`; `false` desliga).
- **Carregamento:** só o poster no início. Os quadros começam na primeira interação (ou 2,5 s após o load), do espaçado ao denso (3 downloads simultâneos no desktop, 2 no celular). Memória: arquivos comprimidos + cache LRU de 10 (desktop) / 16 (celular) quadros decodificados. Canvas no tamanho nativo do quadro.
- **Fallbacks:** movimento reduzido ou sem JavaScript → página comum (poster parado no topo, seções com fundo sólido, nada baixado). Economia de dados/2G ou falha dos quadros → classe `no-frames` (abertura mais curta; a câmera e as luzes continuam).
- **A cena é ilustrativa:** legenda na abertura e frase na demonstração dizem que a planilha ao fundo não é a do kit; as capturas são reais.

## Imagens

`public/img` guarda recortes reais da planilha demonstrativa e das páginas dos documentos, em WebP em 2 larguras. `npm run assets` (`scripts/prepare-assets.sh`) regenera a partir dos originais (precisa de LibreOffice, poppler e Pillow; o build não depende disso). O recorte do Resumo termina na tabela de valores, porque o aviso amarelo abaixo ficava cortado.

## Rastreamento (Meta Pixel `1118427907435809`)

Auditoria do que existia: `index.html` tinha `fbq('init')` + `fbq('track','PageView')` uma única vez (o `<noscript>` só dispara sem JavaScript, então não duplica), sem outros eventos e sem tratamento de UTM. Mantido.

- **PageView:** uma vez, no `<head>`.
- **Clique no botão de compra:** evento **personalizado** `CheckoutClick` (`trackCustom`), com `placement` (abertura, cabeçalho, barra, oferta) e o nome do produto. Sem valor e sem dados pessoais. Não é `Purchase` nem `InitiateCheckout` (este fica para o checkout da Kiwify, para não duplicar).
- **UTM:** `utm_*`, `src` e `sck` da URL da página são repassados ao link do checkout (`https://pay.kiwify.com.br/xP0Ippe`).
- **Compra aprovada (`Purchase`):** **não** é disparada pela página e não foi verificada. Só pode vir da Kiwify (integração de Pixel do produto na Kiwify, com o mesmo ID) ou da API de Conversões. Conferir lá, com uma compra de teste, antes de reativar anúncios.

## Revisão em navegador

Com `npm run preview` rodando e um Chrome/Chromium: `CHROME_PATH=... node scripts/review.mjs` (cenários e fallbacks), `review-journey.mjs [d|m]` (percurso completo, ida e volta), `review-scroll.mjs` (abertura) e `review-page.mjs` (FAQ, ampliação, links). Capturas em `review/` (ignorada pelo git).

## Pendências fora da página

1. Conferir na Kiwify como os arquivos são entregues (a página diz só "acessar e baixar depois da aprovação") e o rastreamento de compra.
2. Política de privacidade, termos e suporte: a página não tem; verifique se são exigidos.
3. Imagem de compartilhamento (og:image) e domínio/hospedagem.
4. Validar a importação no Google Planilhas (a página diz que não foi testada).
