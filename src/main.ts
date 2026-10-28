import '@fontsource-variable/archivo/wght.css';
import './styles.css';
import {initChrome} from './chrome';
import {initIntro} from './intro';
import {initLightbox} from './lightbox';
import {initTracking} from './tracking';

// Todo o conteúdo comercial está no index.html; estes módulos só acrescentam comportamento.
initTracking();
initChrome();
initLightbox();
const intro = initIntro();

// Em desenvolvimento, ao recarregar o módulo, solta listeners e quadros do módulo antigo.
import.meta.hot?.dispose(() => intro?.destroy());
