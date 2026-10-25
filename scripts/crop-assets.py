"""Recortes legíveis das capturas reais + conversão para WebP em 2 larguras.
Uso: python3 crop-assets.py <pasta_tmp> <pasta_saida> <capa_video.png>"""
import json, sys
from PIL import Image

tmp, out, poster = sys.argv[1], sys.argv[2], sys.argv[3]
manifest = {}

def save(name, im, widths):
    im = im.convert('RGB')
    for w in widths:
        h = round(im.height * w / im.width)
        im.resize((w, h), Image.LANCZOS).save(f'{out}/{name}-{w}.webp', 'WEBP', quality=86, method=6)
    manifest[name] = {'w': widths[-1], 'h': round(im.height * widths[-1] / im.width), 'widths': widths}

def crop(src, box):
    return Image.open(f'{tmp}/{src}.png').crop(box)

# Aba ORDENS DE SERVIÇO (450 dpi): cabeçalho y≈165–298, 10 linhas até y≈767.
save('os-clientes', crop('os', (0, 160, 1121, 770)), [560, 1120])
save('os-status', crop('os', (3246, 160, 4072, 770)), [420, 826])
save('os-valores', crop('os', (4800, 160, 5524, 770)), [364, 728])
save('os-situacao', crop('os', (6295, 160, 6964, 770)), [334, 669])
# Aba PEÇAS E ESTOQUE (300 dpi)
save('pecas-lista', crop('pecas', (0, 220, 1128, 833)), [564, 1128])
save('pecas-saldo', crop('pecas', (3094, 220, 4665, 833)), [786, 1571])
# Aba MOVIMENTAÇÕES (600 dpi): Data → OS relacionada, 7 lançamentos
save('movimentacoes', crop('mov', (0, 145, 1504, 562)), [752, 1504])
# Aba RESUMO (300 dpi): blocos de OS e valores
save('resumo', crop('resumo', (0, 0, 1900, 1450)), [640, 1280])
# Páginas dos documentos
for name in ('checklist', 'orcamento', 'guia-p1', 'guia-p4'):
    save(name, Image.open(f'{tmp}/{name}.png'), [480, 960])
# Capa do vídeo (poster)
save('video-capa', Image.open(poster), [360, 720])

with open(f'{out}/manifest.json', 'w') as f:
    json.dump(manifest, f, indent=1)
print(json.dumps(manifest))
