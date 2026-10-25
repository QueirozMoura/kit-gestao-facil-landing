import React from 'react';
import {VIDEO} from '../content';
import {asset, image} from '../images';

export const VideoSection: React.FC = () => {
  const poster = image('video-capa');
  return (
    <section className="section section-dark video cut-top cut-bottom" aria-labelledby="video-title">
      <div className="grid-bg" aria-hidden="true" />
      <div className="container video-grid">
        <div className="video-copy" data-reveal>
          <h2 id="video-title" className="display">
            {VIDEO.title.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </h2>
          <p className="head-lead">{VIDEO.text}</p>
          <p className="tag tag-dark">{VIDEO.tag}</p>
        </div>
        <div className="video-stage" data-reveal>
          <div className="video-frame">
            {/* Sem autoplay e sem pré-carregar o arquivo: só baixa quando a pessoa aperta play. */}
            <video
              controls
              playsInline
              preload="none"
              poster={poster.src}
              width={1080}
              height={1920}
              aria-label="Vídeo de apresentação do Kit Gestão Fácil, 30 segundos"
            >
              <source src={asset('video/kit-gestao-facil-30s.mp4')} type="video/mp4" />
              Seu navegador não reproduz este vídeo.
            </video>
          </div>
        </div>
      </div>
    </section>
  );
};
