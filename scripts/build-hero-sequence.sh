#!/usr/bin/env bash
# Gera a sequência de quadros da cena (public/hero) a partir do vídeo da oficina, na RESOLUÇÃO NATIVA.
# Requer ffmpeg e python3 com Pillow (use FFMPEG=/caminho/ffmpeg se o ffmpeg não estiver no PATH).
#   d-NNN.webp  desktop: quadro inteiro 1920×1080, 1 a cada 2 quadros do vídeo (12/s) → 96 quadros
#   m-NNN.webp  celular: recorte 4:5 (864×1080, altura nativa) que acompanha o assunto, 1 a cada 3 (8/s) → 64 quadros
# O vídeo original não é alterado. WebP qualidade 82 (QUALITY=… para mudar): em comparação 1:1 com o PNG sem
# perdas não há diferença visível; o limite de nitidez é o próprio vídeo.
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
FFMPEG="${FFMPEG:-ffmpeg}"
VIDEO="${VIDEO:-$(ls "$HERE"/../Camera_moving_across_workshop*1080p.mp4 | head -1)}"
OUT="$HERE/public/hero"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT

rm -rf "$OUT"; mkdir -p "$OUT"
for spec in "d 2" "m 3"; do
  set -- $spec; v=$1; step=$2
  mkdir -p "$TMP/$v"
  "$FFMPEG" -v error -y -i "$VIDEO" -an -vf "select='not(mod(n\,$step))'" -fps_mode passthrough "$TMP/$v/%03d.png"
  python3 -I "$HERE/scripts/encode-hero-frames.py" "$TMP/$v" "$OUT" "$v" "$step"
done
du -ch "$OUT"/d-*.webp | tail -1; du -ch "$OUT"/m-*.webp | tail -1
