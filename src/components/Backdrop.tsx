import React from 'react';

/**
 * Fundo decorativo com profundidade: luzes suaves e planos de "grade de planilha" em perspectiva.
 * Cada camada tem amplitude própria (--ay/--ax) e se move com o --s da seção ([data-scene]) que a contém.
 * Só decoração: ignora o ponteiro e fica fora da árvore de acessibilidade.
 */
export const Backdrop: React.FC<{tone: 'dark' | 'light'}> = ({tone}) => (
  <div className={`bd bd-${tone}`} aria-hidden="true">
    <span className="bd-glow bd-glow-a" />
    <span className="bd-glow bd-glow-b" />
    <span className="bd-plane bd-plane-a" />
    <span className="bd-plane bd-plane-b" />
    <span className="bd-cell" />
  </div>
);
