import {PRODUCT} from './config';
import type {ImageName} from './images';

// ---- Textos da página. Preço e nome do produto vêm de config.ts. ----

export const HERO = {
  eyebrow: 'KIT DIGITAL PARA ASSISTÊNCIAS TÉCNICAS',
  titleLines: ['Conserte aparelhos.', 'Organize o resto.'],
  subtitle:
    'Planilha de serviços, controle de peças e documentos editáveis para acompanhar o que falta entregar e receber.',
  cta: 'Quero o kit',
  chips: {ready: 'Pronto para retirada', balance: 'Saldo pendente'},
  caption: 'Planilha demonstrativa, com dados fictícios',
};

export const NAV = [
  {label: 'Antes e depois', href: '#antes-depois'},
  {label: 'O kit', href: '#kit'},
  {label: 'Dúvidas', href: '#duvidas'},
];

export const BEFORE_AFTER = {
  title: ['Saia do caderno', 'e da conversa perdida.'],
  lead: 'Quando cada aparelho tem uma linha, ninguém precisa lembrar de cabeça quem já pagou o sinal ou o que está atrasado.',
  beforeTag: 'Antes · ilustração',
  beforeNote: 'Cena ilustrativa do problema. Não faz parte do kit.',
  afterTag: 'Depois · aba Resumo do kit',
  afterNote: 'Captura real da planilha demonstrativa (dados fictícios).',
  scraps: [
    {kind: 'note', text: 'Fernanda: tela\npagou 60?? ver caderno'},
    {kind: 'msg-in', text: 'Já ficou pronto?'},
    {kind: 'note', text: 'Dell Inspiron\navisar qdo chegar a peça'},
    {kind: 'msg-in', text: 'Mandei o sinal ontem'},
    {kind: 'msg-out', text: 'Vou olhar aqui…'},
  ] as {kind: 'note' | 'msg-in' | 'msg-out'; text: string}[],
  benefits: [
    {title: 'Falta entregar', text: 'Ativas, prontas para retirada e atrasadas, contadas pela planilha.'},
    {title: 'Falta receber', text: 'Total, valor recebido e saldo pendente em cada ordem de serviço.'},
    {title: 'Estado do aparelho', text: 'Checklist de entrada para registrar tela, carcaça e acessórios na chegada.'},
  ],
};

export const VIDEO = {
  title: ['Veja o kit', 'em 30 segundos.'],
  text: 'Um resumo do que vem nos arquivos. Não é um tutorial: o passo a passo está no guia rápido em PDF.',
  tag: 'Vídeo · 30 s · toque para assistir',
};

export type KitIcon = 'sheet' | 'parts' | 'doc' | 'guide';

export type KitItem = {
  id: string;
  icon: KitIcon;
  title: string;
  format: string;
  question: string;
  text: string;
  points: string[];
  images: {name: ImageName; alt: string}[];
  layout: 'sheet' | 'parts' | 'docs' | 'guide';
};

export const KIT_ITEMS: KitItem[] = [
  {
    id: 'planilha',
    icon: 'sheet',
    title: 'Planilha de serviços e resumo',
    format: 'Excel (.xlsx) · versão para uso e versão demonstrativa',
    question: 'Qual aparelho está pronto? O prazo venceu?',
    text: 'Uma linha por ordem de serviço, com cliente, aparelho, defeito, prazo, status e valores. A aba Resumo conta o que está ativo, pronto e atrasado, e quanto falta receber.',
    points: ['Versão para uso, vazia e pronta para o dia a dia', 'Versão demonstrativa com 10 atendimentos fictícios'],
    images: [
      {name: 'resumo', alt: 'Aba Resumo da planilha demonstrativa, com contagem de OS e valores a receber (dados fictícios)'},
      {name: 'os-situacao', alt: 'Coluna Situação com alerta de OS atrasada e de aparelho pronto para retirada (dados fictícios)'},
    ],
    layout: 'sheet',
  },
  {
    id: 'pecas',
    icon: 'parts',
    title: 'Controle de peças e movimentações',
    format: 'Abas da própria planilha',
    question: 'Ainda tem essa peça no estoque?',
    text: 'Cadastre cada peça com estoque mínimo. As entradas e saídas são lançadas à mão na aba Movimentações, uma linha por movimento. O saldo é calculado e o alerta de estoque baixo aparece sozinho.',
    points: ['Mudar o status de uma OS não mexe no estoque: você registra a saída', 'Preparado para 300 peças e 2.000 movimentações por arquivo'],
    images: [
      {name: 'pecas-saldo', alt: 'Saldo atual, valor em estoque e alerta de estoque baixo de peças (dados fictícios)'},
      {name: 'movimentacoes', alt: 'Aba de movimentações de estoque com entradas e saídas (dados fictícios)'},
    ],
    layout: 'parts',
  },
  {
    id: 'documentos',
    icon: 'doc',
    title: 'Checklist de entrada e modelo de orçamento',
    format: 'Word (.docx) e PDF · 1 folha A4 cada',
    question: 'Em que estado o aparelho chegou?',
    text: 'O checklist registra tela, carcaça, acessórios e testes na chegada, sem pedir senha. O orçamento traz diagnóstico, peças, prazo, validade e aprovação. Troque o nome da sua assistência no Word e imprima.',
    points: ['Checklist é registro operacional, não contrato', 'No orçamento, subtotais e total são preenchidos à mão'],
    images: [
      {name: 'checklist', alt: 'Checklist de entrada do aparelho'},
      {name: 'orcamento', alt: 'Modelo de orçamento'},
    ],
    layout: 'docs',
  },
  {
    id: 'guia',
    icon: 'guide',
    title: 'Guia rápido',
    format: 'PDF · 8 páginas',
    question: 'Por onde eu começo?',
    text: 'Do primeiro uso ao dia a dia: campos a preencher, um atendimento completo de exemplo, status, estoque, cópias de segurança e cuidado com os dados dos clientes.',
    points: ['Passo a passo escrito: o kit não inclui vídeo tutorial'],
    images: [
      {name: 'guia-p1', alt: 'Primeira página do guia rápido'},
      {name: 'guia-p4', alt: 'Quarta página do guia rápido'},
    ],
    layout: 'guide',
  },
];

export const STEPS = [
  {title: 'Compre pela Kiwify', text: 'O pagamento é feito no checkout da Kiwify, em pagamento único.'},
  {title: 'Acesse os arquivos', text: 'Depois que o pagamento for aprovado, os arquivos ficam disponíveis na área de membros.'},
  {title: 'Baixe, leia o guia e preencha', text: 'Abra a versão demonstrativa para ver tudo funcionando e comece a registrar na sua própria cópia da planilha.'},
];

export const OFFER = {
  title: ['Tudo em um', 'único kit.'],
  includes: [
    'Planilha de serviços, versão para uso e demonstrativa',
    'Controle de peças e movimentações',
    'Checklist de entrada em Word e PDF',
    'Modelo de orçamento em Word e PDF',
    'Guia rápido em PDF',
  ],
  buy: `Comprar o kit por ${PRODUCT.price}`,
  unavailable: 'Checkout em preparação',
  facts: ['Produto digital', 'Sem assinatura do kit', 'Arquivos para usar no computador'],
  note: 'Acesso pela área de membros após a aprovação do pagamento. Mensagens de WhatsApp são vendidas separadamente.',
};

export const FAQ = [
  {
    q: 'É um sistema online?',
    a: 'Não. O kit é um pacote de arquivos digitais: uma planilha em Excel (.xlsx) e documentos em Word e PDF. Você baixa e usa no seu computador, sem login e sem aplicativo.',
  },
  {
    q: 'O que eu recebo?',
    a: 'A planilha de ordens de serviço (versão para uso e versão demonstrativa, com dados fictícios), com controle de peças, movimentações de estoque e resumo; o checklist de entrada e o modelo de orçamento, cada um em Word e PDF; e o guia rápido em PDF.',
  },
  {
    q: 'Preciso saber usar planilhas?',
    a: 'Ajuda saber o básico, como digitar em células e salvar arquivos. A planilha separa o que você preenche (cabeçalho azul) do que ela calcula (cabeçalho verde), e o guia rápido mostra um atendimento completo, da chegada do aparelho à entrega.',
  },
  {
    q: 'Funciona no Google Planilhas?',
    a: 'O kit foi feito para o Excel (2010 ou mais novo) e foi conferido no LibreOffice Calc. No Google Planilhas, a importação ainda não foi testada: o guia traz o passo a passo e recomenda conferir tudo com a versão demonstrativa antes de usar com clientes. Algumas proteções e listas podem se comportar de forma diferente.',
  },
  {
    q: 'Tem mensalidade?',
    a: `Não há assinatura do kit. O valor é ${PRODUCT.price} em pagamento único.`,
  },
  {
    q: 'O estoque é automático?',
    a: 'Não. Mudar o status de uma OS não movimenta o estoque. Você registra cada Entrada e Saída na aba Movimentações; a partir desses lançamentos, a planilha calcula o saldo e mostra o alerta de estoque baixo.',
  },
  {
    q: 'A planilha calcula lucro, emite nota ou envia mensagens?',
    a: 'Não. Ela acompanha serviços, valores a receber e peças. Não calcula lucro ou faturamento do mês, não emite nota fiscal e não envia mensagens nem avisa clientes.',
  },
  {
    q: 'O kit inclui mensagens de WhatsApp?',
    a: 'Não. As mensagens de WhatsApp são vendidas separadamente. Este kit traz a planilha, o controle de peças, o checklist, o orçamento e o guia.',
  },
  {
    q: 'Tem vídeo tutorial?',
    a: 'Não. O vídeo desta página é só um resumo de 30 segundos. O passo a passo de uso está no guia rápido em PDF.',
  },
  {
    q: 'Quantos atendimentos cabem?',
    a: 'A planilha foi preparada para 1.000 OS, 300 peças e 2.000 movimentações por arquivo. Quando encher, guarde o arquivo e comece um novo.',
  },
  {
    q: 'Como recebo os arquivos?',
    a: 'Depois que o pagamento for aprovado na Kiwify, os arquivos ficam disponíveis na área de membros, para você baixar.',
  },
  {
    q: 'Posso editar o checklist e o orçamento?',
    a: 'Sim. Os dois vêm em Word (.docx), então você troca o nome e os dados da sua assistência e ajusta o que quiser. Também vêm em PDF para imprimir.',
  },
];
