#!/usr/bin/env bash
# Gera a sequência de quadros da abertura (public/hero) a partir do vídeo da bancada e da imagem de apoio.
# Requer ffmpeg com libwebp (use FFMPEG=/caminho/ffmpeg se não estiver no PATH).
#
# Trecho escolhido: quadros 1–84 do vídeo (0–3,5 s). A câmera avança de forma contínua e os objetos
# mantêm a forma. Depois do quadro ~88 o teclado e a caneta do notebook começam a se deformar e
# em ~130 há um corte de câmera, então esse trecho não é usado.
# Quadro 0 = a imagem original (mesma cena do primeiro quadro do vídeo), para o poster e a sequência coincidirem.
#   d-NNN.webp  desktop, 1280×720 (resolução nativa do vídeo, sem ampliar)
#   m-NNN.webp  celular, recorte 4:5 (576×720) que acompanha o notebook enquanto a câmera se move
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
ROOT="$HERE/.."
FFMPEG="${FFMPEG:-ffmpeg}"
VIDEO="${VIDEO:-$ROOT/Objects_organizing_on_desk_77193c5b.mp4}"
STILL="${STILL:-$ROOT/Cell_phone_and_laptop_repair_78a7463c.jpg}"
OUT="$HERE/public/hero"
STEP=2          # 1 quadro a cada 2 (12 quadros/s do vídeo original de 24)
LAST=84
N=$(( LAST / STEP ))   # quadros de vídeo na sequência (além do quadro 0)
QD="${QD:-68}"  # qualidade WebP desktop
QM="${QM:-66}"  # qualidade WebP celular
# posição horizontal do notebook (fração da largura): 0,75 no início → 0,61 no fim
CROP="crop=576:720:x='clip((0.75-0.14*(n+1)/$N)*1280-288,0,704)':y=0"
CROP0="crop=576:720:x='clip(0.75*1280-288,0,704)':y=0"

rm -rf "$OUT"; mkdir -p "$OUT"
SEL="select='not(mod(n+1\,$STEP))*between(n+1\,$STEP\,$LAST)',setpts=N/24/TB"

# quadro 0 (imagem original, ajustada ao 1280×720 do vídeo)
"$FFMPEG" -v error -y -i "$STILL" -vf "scale=1280:720:flags=lanczos" -c:v libwebp -quality "$QD" -compression_level 6 "$OUT/d-000.webp"
"$FFMPEG" -v error -y -i "$STILL" -vf "scale=1280:720:flags=lanczos,$CROP0" -c:v libwebp -quality "$QM" -compression_level 6 "$OUT/m-000.webp"

# quadros do vídeo (numerados a partir de 1)
"$FFMPEG" -v error -y -i "$VIDEO" -an -vf "$SEL" -fps_mode passthrough -start_number 1 \
  -c:v libwebp -quality "$QD" -compression_level 6 "$OUT/d-%03d.webp"
"$FFMPEG" -v error -y -i "$VIDEO" -an -vf "$SEL,$CROP" -fps_mode passthrough -start_number 1 \
  -c:v libwebp -quality "$QM" -compression_level 6 "$OUT/m-%03d.webp"

printf '{"frames":%d,"desktop":{"w":1280,"h":720},"mobile":{"w":576,"h":720}}\n' $((N + 1)) > "$OUT/manifest.json"
echo "Quadros: $((N + 1)) por versão"; du -ch "$OUT"/d-*.webp | tail -1; du -ch "$OUT"/m-*.webp | tail -1
