#!/usr/bin/env bash
# Gera as imagens da página a partir dos arquivos reais do kit (originais não são alterados).
# ATENÇÃO: uso restrito a quem tem os arquivos originais do kit (não estão neste repositório).
# As imagens e o vídeo já geradas estão em public/ — para rodar e fazer o build da página isto NÃO é necessário.
# Requer: libreoffice (soffice), poppler-utils (pdftoppm), python3 + Pillow com WebP.
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
KIT="$HERE/../Kit_Gestao_Facil_Produto_Principal"
OUT="$HERE/public/img"
if [ ! -d "$KIT" ]; then
  echo "Arquivos originais do kit não encontrados ao lado deste projeto. Usando as imagens já incluídas em public/." >&2
  exit 1
fi
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# Planilha DEMONSTRATIVA (dados fictícios): uma página por aba.
cp "$KIT/Kit_Gestao_Facil_DEMONSTRACAO.xlsx" "$TMP/demo.xlsx"
soffice --headless -env:UserInstallation="file://$TMP/lo" \
  --convert-to 'pdf:calc_pdf_Export:{"SinglePageSheets":{"type":"boolean","value":"true"}}' \
  --outdir "$TMP" "$TMP/demo.xlsx" >/dev/null 2>&1
pdftoppm -f 2 -l 2 -r 450 -x 0 -y 0 -W 6969 -H 800 -png -singlefile "$TMP/demo.pdf" "$TMP/os"
pdftoppm -f 3 -l 3 -r 300 -x 0 -y 0 -W 4671 -H 833 -png -singlefile "$TMP/demo.pdf" "$TMP/pecas"
pdftoppm -f 4 -l 4 -r 600 -x 0 -y 0 -W 2700 -H 700 -png -singlefile "$TMP/demo.pdf" "$TMP/mov"
pdftoppm -f 5 -l 5 -r 300 -png -singlefile "$TMP/demo.pdf" "$TMP/resumo"

# Páginas dos documentos (PDFs do kit).
pdftoppm -r 150 -png -singlefile "$KIT/Checklist_de_Entrada_do_Aparelho.pdf" "$TMP/checklist"
pdftoppm -r 150 -png -singlefile "$KIT/Modelo_de_Orcamento.pdf" "$TMP/orcamento"
pdftoppm -f 1 -l 1 -r 150 -png -singlefile "$KIT/Guia_Rapido.pdf" "$TMP/guia-p1"
pdftoppm -f 4 -l 4 -r 150 -png -singlefile "$KIT/Guia_Rapido.pdf" "$TMP/guia-p4"

python3 "$HERE/scripts/crop-assets.py" "$TMP" "$OUT"
echo "Assets prontos."
