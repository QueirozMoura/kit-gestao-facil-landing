"""Codifica os quadros extraídos do vídeo em WebP, SEM redimensionar.
Uso: python3 encode-hero-frames.py <pasta_png> <pasta_saida> <d|m> <passo>
Os PNGs são os quadros 1, 1+passo, … do vídeo (resolução nativa). O desktop usa o quadro inteiro;
o celular usa um recorte 4:5 na altura nativa que acompanha o assunto (centro horizontal interpolado
entre pontos marcados à mão, em fração da largura)."""
import sys, glob, os
from PIL import Image

src, out, variant, step = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])
QUALITY = int(os.environ.get('QUALITY', '82'))

# quadro do vídeo (1 = primeiro) → centro horizontal do assunto (notebook / placa), fração da largura
KNOTS = [(1, .69), (13, .57), (31, .47), (43, .42), (55, .48), (67, .5), (109, .5), (127, .5), (139, .42), (151, .45), (191, .46)]

def center(n):
    for (a, xa), (b, xb) in zip(KNOTS, KNOTS[1:]):
        if a <= n <= b:
            return xa + (xb - xa) * (n - a) / (b - a)
    return KNOTS[-1][1]

files = sorted(glob.glob(f'{src}/*.png'))
os.makedirs(out, exist_ok=True)
for k, f in enumerate(files):
    n = 1 + k * step  # número do quadro no vídeo
    im = Image.open(f).convert('RGB')
    w, h = im.size
    if variant == 'm':
        cw = round(h * 4 / 5)
        x0 = min(max(round(center(n) * w - cw / 2), 0), w - cw)
        im = im.crop((x0, 0, x0 + cw, h))
    im.save(f'{out}/{variant}-{k:03d}.webp', 'WEBP', quality=QUALITY, method=6)
print(variant, len(files), 'quadros', im.size)
