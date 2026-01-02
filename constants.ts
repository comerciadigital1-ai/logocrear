
import { FontOption } from './types';

export const FONT_OPTIONS: FontOption[] = [
  // --- MODERNAS SANS SERIF (Adobe Clean & Tech) ---
  { id: 'm-neo', name: 'Modern Neo-Grotesque (Tipo Helvetica/Inter)', description: 'Neutralidad suiza, máxima claridad y profesionalismo contemporáneo.' },
  { id: 'm-geo', name: 'Modern Geometric (Tipo Futura/Gotham)', description: 'Basada en formas circulares puras. Vanguardista, limpia y equilibrada.' },
  { id: 'm-hum', name: 'Modern Humanist (Tipo Myriad/Gill Sans)', description: 'Trazos orgánicos que imitan la caligrafía humana. Amigable y moderna.' },
  { id: 'm-wide', name: 'Modern Expanded (Tipo Avenue/Space Grotesk)', description: 'Tipografía ancha que transmite autoridad, espacio y modernidad tecnológica.' },
  { id: 'm-cond', name: 'Modern Condensed (Tipo Roboto/Din)', description: 'Estrecha y alta. Ideal para marcas industriales o de alto impacto visual.' },

  // --- CLÁSICAS SERIF (Adobe Heritage & Editorial) ---
  { id: 'c-old', name: 'Classic Old Style (Tipo Garamond/Minion)', description: 'Elegancia renacentista. Refinada, tradicional y altamente legible.' },
  { id: 'c-trans', name: 'Classic Transitional (Tipo Baskerville/Caslon)', description: 'El equilibrio entre lo antiguo y lo moderno. Formal, culta y confiable.' },
  { id: 'c-didone', name: 'Classic Didone (Tipo Bodoni/Didot)', description: 'Contraste extremo entre trazos. El estándar del lujo, la moda y la alta gama.' },
  { id: 'c-slab', name: 'Classic Slab Serif (Tipo Clarendon/Rockwell)', description: 'Remates rectangulares fuertes. Transmite solidez, honestidad e impacto.' },
  { id: 'c-ven', name: 'Classic Venetian (Tipo Centaur/Jenson)', description: 'Inspirada en los primeros tipos móviles. Carácter histórico y artesanal.' },

  // --- LUXE & DISPLAY (Fashion & High-End) ---
  { id: 'l-minimal', name: 'Luxury Minimalist Serif (Tipo Cormorant)', description: 'Trazos extra finos y elegantes. Estética de joyería y belleza.' },
  { id: 'l-deco', name: 'Art Deco Stylized (Tipo Peignot/Metropolis)', description: 'Geometría decorativa de los años 20. Glamour, estilo y distinción.' },
  { id: 'l-stencil', name: 'Editorial Stencil (Tipo Futura Stencil)', description: 'Cortes limpios en la letra. Estilo de diseño de autor y vanguardia.' },
  { id: 'l-brut', name: 'Brutalist Heavy (Tipo Neue Haas Black)', description: 'Peso extremo, sin adornos. Fuerza cruda y diseño honesto.' },

  // --- SCRIPTS & CALIGRAFÍA (Persona & Signature) ---
  { id: 's-formal', name: 'Formal Script (Tipo Bickham/Zapfino)', description: 'Caligrafía clásica de pluma. Tradición, eventos de gala y lujo extremo.' },
  { id: 's-sign', name: 'Casual Signature (Tipo Autograph)', description: 'Estilo firma rápida. Personal, auténtico y creativo.' },
  { id: 's-brush', name: 'Urban Brush (Tipo Mistral/Street)', description: 'Trazos de pincel con textura. Energía, movimiento y arte urbano.' },

  // --- TECH & MONOSPACE (Digital & Code) ---
  { id: 't-mono', name: 'Technical Mono (Tipo Source Code Pro)', description: 'Espaciado fijo. Estética de programación, ingeniería y precisión.' },
  { id: 't-pixel', name: 'Digital Pixel (Tipo 8-bit)', description: 'Estética retro-gaming. Nostalgia digital y cultura geek.' },
  { id: 't-fut', name: 'Display Futurista (Tipo Michroma/Orbitron)', description: 'Formas cuadradas y abiertas. Ciencia ficción y alta tecnología.' },

  // --- CREATIVAS & RETRO ---
  { id: 'r-vintage', name: 'Vintage Stamp (Tipo Cooper Black)', description: 'Formas redondeadas y pesadas. Estética de los años 70 y nostalgia pop.' },
  { id: 'r-western', name: 'Wild West Slab (Tipo French Canon)', description: 'Remates exagerados. Estilo artesanal, rústico y con historia.' },
  { id: 'r-hand', name: 'Hand-Drawn Quirky (Tipo Amatic/Indie)', description: 'Hecho a mano. Juguetón, cercano y con imperfecciones artísticas.' },
  { id: 'r-goth', name: 'Gothic Blackletter (Tipo Fraktur)', description: 'Estilo medieval. Fuerza, misticismo y caligrafía germánica.' }
];

export const DISTRIBUTION_OPTIONS = [
  { id: 'vertical', name: 'Icono Arriba (Vertical)', description: 'Icono sobre el nombre y eslogan' },
  { id: 'horizontal-left', name: 'Icono Izquierda (Horizontal)', description: 'Icono al lado izquierdo del texto' },
  { id: 'horizontal-right', name: 'Icono Derecha', description: 'Icono al lado derecho del texto' },
  { id: 'centered', name: 'Icono Centrado / Integrado', description: 'Icono y texto integrados armónicamente' },
  { id: 'icon-only', name: 'Solo Icono', description: 'Omitir texto del logo' },
  { id: 'text-only', name: 'Solo Tipografía', description: 'Logo basado puramente en texto' }
];

export const LOGO_TYPE_OPTIONS = [
  { 
    id: 'wordmark', 
    name: 'Logotipo (Wordmark)', 
    description: 'Identidad basada puramente en tipografía. El nombre de la marca es el diseño principal sin iconos adicionales.' 
  },
  { 
    id: 'pictorial', 
    name: 'Isotipo (Pictorial)', 
    description: 'Símbolo gráfico o icono representativo. Es la parte visual de la marca que funciona sin necesidad de texto.' 
  },
  { 
    id: 'imagotype', 
    name: 'Imagotipo', 
    description: 'Combinación de icono y texto que se presentan separados. Ambos elementos pueden funcionar de forma independiente o conjunta.' 
  },
  { 
    id: 'isologo', 
    name: 'Isologo', 
    description: 'Texto e icono integrados en una sola unidad. Los elementos son inseparables y forman un todo indivisible.' 
  },
  { 
    id: 'lettermark', 
    name: 'Monograma (Lettermark)', 
    description: 'Diseño centrado en las iniciales de la marca, creando un símbolo tipográfico estilizado.' 
  },
  { 
    id: 'emblem', 
    name: 'Emblema', 
    description: 'El texto aparece contenido dentro de un escudo, sello o forma geométrica cerrada.' 
  },
  { 
    id: 'abstract', 
    name: 'Abstracto', 
    description: 'Uso de formas geométricas no figurativas para representar conceptos únicos y abstractos de la marca.' 
  }
];

export const COLOR_PALETTES = [
  { name: 'Corporativo', colors: ['#003366', '#FFFFFF', '#CCCCCC'], hex: 'Azul marino, Blanco, Gris' },
  { name: 'Energético', colors: ['#FF5733', '#FFC300', '#000000'], hex: 'Naranja, Dorado, Negro' },
  { name: 'Naturaleza', colors: ['#2ECC71', '#27AE60', '#F1C40F'], hex: 'Verde esmeralda, Verde bosque, Amarillo' },
  { name: 'Lujo', colors: ['#1A1A1A', '#D4AF37', '#FFFFFF'], hex: 'Negro mate, Oro, Blanco' },
  { name: 'Pastel', colors: ['#FFB6C1', '#B0E0E6', '#FFFACD'], hex: 'Rosa claro, Azul polvo, Crema' }
];
