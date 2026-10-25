"""Recortes extras da primeira dobra, a partir da planilha demonstrativa renderizada.
Uso: python3 crop-hero.py <pasta_tmp> <pasta_saida>
- hero-planilha: colunas reais (Nº, Cliente | Status | Saldo pendente) das 6 primeiras OS, lado a lado.
- resumo-valores: bloco real "Valores das OS" da aba Resumo."""
import sys
from PIL import Image

tmp, out = sys.argv[1], sys.argv[2]

def save(name, im, widths):
    im = im.convert('RGB')
    for w in widths:
        h = round(im.height * w / im.width)
        im.resize((w, h), Image.LANCZOS).save(f'{out}/{name}-{w}.webp', 'WEBP', quality=88, method=6)
    print(name, widths[-1], round(im.height * widths[-1] / im.width))

os_ = Image.open(f'{tmp}/os.png').convert('RGB')
Y0, Y1 = 160, 585  # cabeçalho + 6 OS
groups = [(0, 175), (390, 820), (3696, 4072), (5275, 5532)]  # Nº | Cliente | Status | Saldo pendente
GAP = 20
parts = [os_.crop((a, Y0, b, Y1)) for a, b in groups]
# cada grupo vira um bloco separado por um respiro escuro: são colunas distintas da mesma aba.
sheet = Image.new('RGB', (sum(p.width for p in parts) + GAP * 3, Y1 - Y0), (11, 26, 56))
x = 0
for i, p in enumerate(parts):
    sheet.paste(p, (x, 0))
    x += p.width + (GAP if i < 3 else 0)
save('hero-planilha', sheet, [640, 1280])

# versão estreita para o celular: só Nº | Status | Saldo pendente (texto maior em tela pequena).
mp = [parts[0], parts[2], parts[3]]
sheet_m = Image.new('RGB', (sum(p.width for p in mp) + GAP * 2, Y1 - Y0), (11, 26, 56))
x = 0
for i, p in enumerate(mp):
    sheet_m.paste(p, (x, 0))
    x += p.width + GAP
save('hero-planilha-m', sheet_m, [420, 840])

res = Image.open(f'{tmp}/resumo.png').convert('RGB')
save('resumo-valores', res.crop((0, 810, 1840, 1070)), [560, 1120])

# hero-saldo: as linhas "Valor já recebido" e "Saldo pendente", só rótulo + valor (colunas intermediárias vazias omitidas).
Y0, Y1 = 943, 1070
lab, val = res.crop((0, Y0, 620, Y1)), res.crop((1365, Y0, 1840, Y1))
saldo = Image.new('RGB', (lab.width + val.width, Y1 - Y0))
saldo.paste(lab, (0, 0))
saldo.paste(val, (lab.width, 0))
save('hero-saldo', saldo, [440, 880])
