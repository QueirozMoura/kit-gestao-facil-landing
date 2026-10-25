import React from 'react';
import {useReveal} from './hooks/useMotion';
import {BeforeAfter} from './components/BeforeAfter';
import {Faq} from './components/Faq';
import {Footer} from './components/Footer';
import {Header} from './components/Header';
import {Hero} from './components/Hero';
import {HowItWorks} from './components/HowItWorks';
import {Kit} from './components/Kit';
import {Offer} from './components/Offer';
import {StickyBar} from './components/StickyBar';
import {VideoSection} from './components/VideoSection';

export const App: React.FC = () => {
  useReveal();
  return (
  <>
    <a className="skip-link" href="#conteudo">
      Pular para o conteúdo
    </a>
    <Header />
    <main id="conteudo">
      <Hero />
      <BeforeAfter />
      <VideoSection />
      <Kit />
      <HowItWorks />
      <Offer />
      <Faq />
    </main>
    <Footer />
    <StickyBar />
  </>
  );
};
