import React from 'react';
import {image, ImageName} from '../images';

type Props = {
  name: ImageName;
  alt: string;
  sizes: string;
  eager?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

// Largura/altura definidas para evitar saltos de layout; abaixo da primeira dobra carrega sob demanda.
export const Picture: React.FC<Props> = ({name, alt, sizes, eager = false, className, style}) => {
  const img = image(name);
  return (
    <img
      className={className}
      style={style}
      src={img.src}
      srcSet={img.srcSet}
      sizes={sizes}
      width={img.width}
      height={img.height}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={eager ? 'high' : 'auto'}
    />
  );
};
