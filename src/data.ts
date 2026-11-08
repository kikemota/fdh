// Contenido inicial tomado de https://www.fuentelespinodeharo.net/ (nov. 2026).
// Avisos y eventos marcados como "ejemplo" son de demostración hasta tener panel real.

export type Aviso = {
  id: string
  titulo: string
  texto: string
  fecha: string // ISO
  tipo: 'bando' | 'aviso' | 'urgente'
  ejemplo?: boolean
}

export type Evento = {
  id: string
  titulo: string
  cuando: string // texto libre, p. ej. "13 de junio"
  fecha?: string // ISO si se conoce, para ordenar
  lugar?: string
  texto: string
  enlace?: string
  categoria: 'fiestas' | 'deporte' | 'cultura'
}

export type Telefono = { nombre: string; numeros: string[]; nota?: string; grupo: 'pueblo' | 'salud' | 'seguridad' | 'transporte' }

export const AVISOS_INICIALES: Aviso[] = [
  {
    id: 'a1',
    titulo: 'Bienvenidos a la app del pueblo',
    texto:
      'Aquí encontraréis los avisos y bandos del pueblo, la agenda de fiestas y eventos, los teléfonos de interés y todo sobre la historia de Fuentelespino de Haro.',
    fecha: '2026-11-08T10:00:00Z',
    tipo: 'aviso',
  },
  {
    id: 'a2',
    titulo: 'Corte de agua programado',
    texto: 'Ejemplo de aviso: el martes de 9:00 a 13:00 habrá corte de agua en la calle Mayor por obras en la red.',
    fecha: '2026-11-06T09:00:00Z',
    tipo: 'urgente',
    ejemplo: true,
  },
  {
    id: 'a3',
    titulo: 'Bando: recogida de enseres',
    texto: 'Ejemplo de bando: el primer viernes de cada mes se recogen muebles y enseres. Avisad en el Ayuntamiento.',
    fecha: '2026-11-03T09:00:00Z',
    tipo: 'bando',
    ejemplo: true,
  },
]

export const EVENTOS: Evento[] = [
  {
    id: 'e1',
    titulo: 'Fiestas de San Antonio de Padua',
    cuando: '13 de junio',
    fecha: '2027-06-13',
    lugar: 'Fuentelespino de Haro',
    texto: 'Fiestas patronales en honor a San Antonio de Padua.',
    enlace: 'https://www.fuentelespinodeharo.net/fiestas.htm',
    categoria: 'fiestas',
  },
  {
    id: 'e2',
    titulo: 'Corpus Christi',
    cuando: 'Domingo después del Corpus (27 de mayo de 2027)',
    fecha: '2027-05-30',
    lugar: 'Fuentelespino de Haro',
    texto: 'Celebración tradicional del Corpus Christi en el pueblo.',
    enlace: 'https://www.fuentelespinodeharo.net/fiestas.htm',
    categoria: 'fiestas',
  },
  {
    id: 'e3',
    titulo: 'La Iranzada',
    cuando: 'Fecha por confirmar',
    texto: 'Marcha de cicloturismo y senderismo por los caminos del término, en recuerdo del Condestable Miguel Lucas de Iranzo.',
    enlace: 'https://www.instagram.com/la.iranzada/',
    categoria: 'deporte',
  },
  {
    id: 'e4',
    titulo: 'Marcha MTB Fuentelespino de Haro',
    cuando: 'Fecha por confirmar',
    texto: 'Carrera ciclista de montaña organizada por el Club Ciclista.',
    enlace: 'https://www.fuentelespinodeharo.net/cdeharo.htm',
    categoria: 'deporte',
  },
  {
    id: 'e5',
    titulo: 'Legua Castellana',
    cuando: 'Fecha por confirmar',
    texto: 'Carrera popular de una legua castellana.',
    enlace: 'https://laleguafdh.weebly.com/',
    categoria: 'deporte',
  },
  {
    id: 'e6',
    titulo: 'Torneo de Pádel Vida',
    cuando: 'Fecha por confirmar',
    texto: 'Torneo benéfico de pádel.',
    enlace: 'https://www.instagram.com/padelvida_13_fdh/',
    categoria: 'deporte',
  },
]

export const TELEFONOS: Telefono[] = [
  { nombre: 'Ayuntamiento', numeros: ['967187843'], grupo: 'pueblo' },
  { nombre: 'Farmacia', numeros: ['967187838', '667624438'], grupo: 'salud' },
  { nombre: 'Centro Médico de Belmonte (Urgencias)', numeros: ['967170904'], nota: 'Emergencias: 112', grupo: 'salud' },
  { nombre: 'Residencia de Mayores', numeros: ['967187856'], grupo: 'salud' },
  { nombre: 'CTR El Cerrete de Haro', numeros: ['967187800', '654392198'], grupo: 'pueblo' },
  { nombre: 'Guardia Civil (Villarejo de Fuentes)', numeros: ['969131578'], grupo: 'seguridad' },
  { nombre: 'Emergencias', numeros: ['112'], grupo: 'seguridad' },
  { nombre: 'Estación de autobuses de Cuenca', numeros: ['969227087'], grupo: 'transporte' },
  { nombre: 'Estación Ruiz (Madrid)', numeros: ['914680850'], grupo: 'transporte' },
]

export const GRUPOS_TEL: Record<Telefono['grupo'], string> = {
  pueblo: 'Pueblo',
  salud: 'Salud',
  seguridad: 'Seguridad',
  transporte: 'Transporte',
}

export type Seccion = { id: string; titulo: string; resumen: string; parrafos: string[]; fuente?: string }

export const PUEBLO: Seccion[] = [
  {
    id: 'historia',
    titulo: 'Historia',
    resumen: 'De la Fuente del Espino a villa independiente en 1673.',
    parrafos: [
      'El pueblo nace en la segunda repoblación castellana (siglos XI al XIII), junto a una fuente rodeada de espinos: la "Fuente del Espino".',
      'El apellido "de Haro" le llega a finales del siglo XII por Diego López de Haro, señor de Vizcaya.',
      'En 1673 Carlos II le concede el privilegio de villa, separándose de la jurisdicción de la que dependía.',
      'Las construcciones más antiguas, como la ermita románica de Santa Ana (siglo XII), la iglesia de los siglos XV y XVI y la Casa del Pósito (siglo XVIII), se perdieron con el tiempo.',
      'Para saber más: "Fuentelespino de Haro, Apuntes para su Historia", de José Ramón Guardia Santaella.',
    ],
    fuente: 'https://www.fuentelespinodeharo.net/historia.htm',
  },
  {
    id: 'datos',
    titulo: 'El pueblo en datos',
    resumen: 'La Mancha conquense, entre 700 y 934 metros.',
    parrafos: [
      'Situado en la provincia de Cuenca, en la comarca de La Mancha. Limita con Villarejo de Fuentes, Villaescusa de Haro, Alconchel de la Estrella, Belmonte y Tresjuncos.',
      'Altitud entre 700 y 900 metros; el punto más alto es el Cerro Pinillo (934 m).',
      'Lo atraviesa el río Záncara, afluente del Guadiana, que lleva agua incluso en años de sequía.',
      'Clima continental: 11,9 °C de media anual y unos 585 litros por metro cuadrado de lluvia al año.',
      'Vive sobre todo de la agricultura y la ganadería. Llegó a tener 840 habitantes en 1960.',
    ],
    fuente: 'https://www.fuentelespinodeharo.net/datos.htm',
  },
  {
    id: 'personajes',
    titulo: 'Personajes',
    resumen: 'El Condestable Iranzo y otros hijos de la villa.',
    parrafos: [
      'Miguel Lucas de Iranzo, Condestable de Castilla en el siglo XV, nació en el despoblado de Gilibert, dentro del término. La Iranzada lleva su nombre.',
      'Pedro Gallego fue comisario del Santo Oficio en el siglo XVIII.',
      'El maestro Teófilo Azabal Molina dejó huella en varias generaciones del pueblo.',
    ],
    fuente: 'https://www.fuentelespinodeharo.net/ilustres.htm',
  },
  {
    id: 'castros',
    titulo: 'Yacimientos',
    resumen: 'Castros de la Edad del Bronce en el término.',
    parrafos: [
      'En el término municipal hay restos de poblados de la Edad del Bronce: la Morreta de Gilibert, Castilnuño, Peña Moya y El Morrón.',
      'El despoblado de Gilibert (Geliberte) es uno de los lugares con más historia del término.',
    ],
    fuente: 'https://www.fuentelespinodeharo.net/gilibert.htm',
  },
]

export type Lugar = { nombre: string; km: number; texto: string }

export const ALREDEDORES: Lugar[] = [
  { nombre: 'Belmonte', km: 18, texto: 'Castillo del siglo XV y colegiata. Cuna de Fray Luis de León.' },
  { nombre: 'Segóbriga', km: 30, texto: 'Parque arqueológico romano con teatro, anfiteatro y termas.' },
  { nombre: 'Mota del Cuervo', km: 34, texto: 'Molinos de viento en la sierra de los Molinos.' },
  { nombre: 'Uclés', km: 43, texto: 'El Monasterio, conocido como "El Escorial de La Mancha".' },
  { nombre: 'Castillo de Garcimuñoz', km: 43, texto: 'Castillo donde murió Jorge Manrique.' },
  { nombre: 'El Toboso', km: 50, texto: 'La casa de Dulcinea y la ruta del Quijote.' },
  { nombre: 'Cuenca', km: 80, texto: 'Casas Colgadas y casco antiguo, Patrimonio de la Humanidad.' },
]

export const REDES = [
  { nombre: 'Canal de WhatsApp', url: 'https://whatsapp.com/channel/0029VayM5Je17Emnl2PFRo2O' },
  { nombre: 'Facebook', url: 'https://www.facebook.com/fuentelespinodeharo/' },
  { nombre: 'Instagram', url: 'https://www.instagram.com/fuentelespinodeharo.fdh/' },
  { nombre: 'Web del pueblo', url: 'https://www.fuentelespinodeharo.net/' },
]

// Coordenadas aproximadas del casco urbano
export const COORDS = { lat: 39.703, lon: -2.536 }
export const AEMET_URL = 'https://www.aemet.es/es/eltiempo/prediccion/municipios/fuentelespino-de-haro-id16087'
