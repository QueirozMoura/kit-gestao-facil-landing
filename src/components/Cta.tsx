import React from 'react';
import {ArrowRight, Lock} from 'lucide-react';
import {CHECKOUT_URL, ctaHref, hasCheckout} from '../config';

// Botão de ação (navega ao checkout, ou à oferta enquanto o checkout não existe).
export const CtaLink: React.FC<{children: React.ReactNode; size?: 'md' | 'lg'; className?: string}> = ({
  children,
  size = 'md',
  className = '',
}) => (
  <a className={`btn btn-primary btn-${size} ${className}`} href={ctaHref} {...(hasCheckout ? {rel: 'noopener'} : {})}>
    <span>{children}</span>
    <ArrowRight className="btn-arrow" aria-hidden="true" size={size === 'lg' ? 22 : 18} strokeWidth={2.8} />
  </a>
);

// Ação final de compra: indisponível até existir CHECKOUT_URL.
export const BuyButton: React.FC<{label: string; unavailable: string}> = ({label, unavailable}) =>
  hasCheckout ? (
    <a className="btn btn-primary btn-lg btn-block" href={CHECKOUT_URL.trim()} rel="noopener">
      <span>{label}</span>
      <ArrowRight className="btn-arrow" aria-hidden="true" size={22} strokeWidth={2.8} />
    </a>
  ) : (
    <button type="button" className="btn btn-disabled btn-lg btn-block" disabled aria-disabled="true">
      <Lock aria-hidden="true" size={20} strokeWidth={2.4} />
      <span>{unavailable}</span>
    </button>
  );
