// Historia, personajes, vídeos y alojamiento.
// Fuente principal: fuentelespinodeharo.net (historia.htm, famosos.htm, videox.htm, promocionales.htm,
// videosvarios.htm, alojarse.htm), basada en "Fuentelespino de Haro, Apuntes para su Historia",
// de José Ramón Guardia Santaella. Las biografías se han ampliado con datos públicos de cada persona.

const WEB = 'https://www.fuentelespinodeharo.net/'

// ---------- Historia ----------

export type Capitulo = { titulo: string; parrafos: string[] }

export const HISTORIA_INTRO =
  'Fuentelespino de Haro es un pueblo pequeño en el corazón de la provincia de Cuenca, en La Mancha. Su historia se puede seguir desde los castros de la Edad del Bronce hasta su nacimiento como villa independiente en 1673.'

export const HISTORIA: Capitulo[] = [
  {
    titulo: 'Un nombre que nace de una fuente',
    parrafos: [
      'El pueblo toma su nombre del lugar donde se fundó: junto a una fuente rodeada de espinos y abrojos a la que llamaban la Fuente del Espino.',
      'No se sabe con certeza cuál era esa fuente. Lo más probable es que fuera un pozo que hoy está tapado bajo la calle de Lavapiés.',
    ],
  },
  {
    titulo: 'Antes de la historia escrita',
    parrafos: [
      'De la prehistoria se sabe poco, casi siempre por hallazgos casuales de los vecinos al labrar o pasear por el campo.',
      'Desde el primer milenio antes de Cristo, en la Edad del Bronce, aparecen en el término poblados fortificados en lo alto de cerros amesetados: La Morreta de Gilibert, Castilnuño, Peña Moya y El Morrón.',
    ],
  },
  {
    titulo: 'El apellido "de Haro"',
    parrafos: [
      'A finales del siglo XII el pueblo pasa a llamarse "de Haro". Estas tierras pertenecían a Diego López de Haro, alférez y consejero del rey Alfonso VIII, al que acompañó en la conquista de Cuenca en 1177.',
      'Junto a un castillo militar se fundó una población llamada Haro, que puso bajo su jurisdicción y su fuero a Villaescusa, Rada, Carrascosa, Villar de la Encina y la Fuente del Espino.',
    ],
  },
  {
    titulo: 'Aldea de Villaescusa',
    parrafos: [
      'A mediados del siglo XIV, Villaescusa consiguió separarse de Haro gracias a un privilegio del infante don Fadrique dado en Los Hinojosos. Los pueblos vecinos también se fueron independizando.',
      'A principios del siglo XV, por las ventajas que suponía en término y en tributos, estos pueblos se unieron a la jurisdicción de Villaescusa. Fuentelespino quedó como aldea suya durante más de dos siglos.',
    ],
  },
  {
    titulo: 'Siglos XV al XVIII: el Condestable y la Inquisición',
    parrafos: [
      'En el despoblado de Gilibert, dentro del término, nació según la tradición del pueblo don Miguel Lucas de Iranzo, que llegó a Condestable de Castilla. Fue ennoblecido el 2 de junio de 1455 en la corte de Enrique IV.',
      'En la segunda mitad del siglo XVI la Inquisición juzgó a dos vecinos del pueblo.',
      'Durante buena parte del siglo XVIII, don Pedro Gallego, natural de Fuentelespino, fue comisario del Santo Oficio en la provincia de Cuenca. Se le enterró con su sobrino en un pequeño panteón de la cripta de la iglesia, que salió a la luz cuando la iglesia se vino abajo en el siglo XX.',
    ],
  },
  {
    titulo: '1673: villa independiente',
    parrafos: [
      'A finales del siglo XVII, reinando Carlos II, el pueblo pidió el privilegio de villa. Se le concedió en 1673.',
      'Desde entonces dejó de ser aldea de Villaescusa y pasó a tener concejo, término y tributos propios.',
    ],
  },
  {
    titulo: 'Lo que se perdió',
    parrafos: [
      'Hoy no queda en pie ningún edificio civil o religioso antiguo de importancia.',
      'La ermita románica de Santa Ana, del siglo XII, se hundió a finales del siglo XIX. La iglesia, de los siglos XV y XVI, y la Casa del Pósito, del siglo XVIII, se derribaron en la segunda mitad del siglo XX.',
    ],
  },
  {
    titulo: 'Gente, campo y paisaje',
    parrafos: [
      'El pueblo tuvo unos 250 habitantes en el siglo XVI, 599 en 1787 y llegó a 840 en 1960. Hoy viven en él unas 200 personas.',
      'Se ha vivido siempre de la agricultura y la ganadería, con más peso de la agricultura.',
      'El término tiene sierras, montes, cerros y lomas, con pinares de pino carrasco y monte bajo. Hay caza menor (conejo, liebre y perdiz) y jabalí. Solo lo cruza el río Záncara, pero abundan las fuentes y los pozos.',
    ],
  },
]

export const CRONOLOGIA: { cuando: string; que: string }[] = [
  { cuando: 'Edad del Bronce', que: 'Castros en Gilibert, Castilnuño, Peña Moya y El Morrón' },
  { cuando: 'Siglos XI-XIII', que: 'Repoblación junto a la Fuente del Espino' },
  { cuando: '1177', que: 'Conquista de Cuenca; las tierras pasan a Diego López de Haro' },
  { cuando: 'Siglo XIV', que: 'Villaescusa se separa de Haro' },
  { cuando: 'Siglo XV', que: 'Fuentelespino, aldea de Villaescusa' },
  { cuando: '1455', que: 'Miguel Lucas de Iranzo es ennoblecido' },
  { cuando: '1673', que: 'Carlos II le concede el título de villa' },
  { cuando: '1960', que: 'Máximo de población: 840 habitantes' },
]

export const HISTORIA_FUENTE = {
  libro: 'Fuentelespino de Haro, Apuntes para su Historia',
  autor: 'José Ramón Guardia Santaella',
  url: WEB + 'historia.htm',
}

// ---------- Personajes ----------

export type Personaje = {
  id: string
  nombre: string
  epoca: string
  lema: string
  bio: string[]
  enlace?: string
}

export const PERSONAJES_HISTORICOS: Personaje[] = [
  {
    id: 'diego-lopez-de-haro',
    nombre: 'Diego López de Haro',
    epoca: 'Hacia 1152 - 1214',
    lema: 'El noble que dio al pueblo su apellido',
    bio: [
      'Señor de Vizcaya, conocido como "el Bueno", fue alférez mayor y consejero de Alfonso VIII de Castilla.',
      'Acompañó al rey en la conquista de Cuenca en 1177 y recibió tierras en la zona. Por él Fuentelespino y los pueblos de alrededor llevan el apellido "de Haro".',
      'Fue uno de los grandes nobles de su tiempo: mandó la vanguardia cristiana en la batalla de Las Navas de Tolosa, en 1212.',
    ],
  },
  {
    id: 'iranzo',
    nombre: 'Miguel Lucas de Iranzo',
    epoca: 'Siglo XV - 1473',
    lema: 'Condestable de Castilla nacido en Gilibert',
    bio: [
      'Según la tradición del pueblo nació en Gilibert, hoy un despoblado dentro del término municipal. De origen modesto, entró al servicio del futuro Enrique IV y se convirtió en uno de sus hombres de confianza.',
      'Fue ennoblecido el 2 de junio de 1455 y poco después el rey le nombró Condestable de Castilla, el cargo militar más alto del reino.',
      'Se instaló en Jaén, en la frontera con el reino nazarí de Granada, que gobernó y defendió durante años. Su vida y sus fiestas se cuentan en la crónica "Hechos del Condestable don Miguel Lucas de Iranzo".',
      'Murió asesinado en la catedral de Jaén en 1473. La marcha La Iranzada lleva su nombre.',
    ],
    enlace: WEB + 'iranzada.htm',
  },
  {
    id: 'pedro-gallego',
    nombre: 'Pedro Gallego',
    epoca: 'Siglo XVIII',
    lema: 'Comisario del Santo Oficio en Cuenca',
    bio: [
      'Natural de Fuentelespino, fue durante buena parte del siglo XVIII comisario del Santo Oficio de la Inquisición en la provincia de Cuenca.',
      'Fue enterrado junto a su sobrino en un pequeño panteón de la cripta de la iglesia. El panteón apareció al derrumbarse la iglesia en la segunda mitad del siglo XX.',
    ],
  },
  {
    id: 'guardia-santaella',
    nombre: 'José Ramón Guardia Santaella',
    epoca: 'Historiador del pueblo',
    lema: 'Autor de "Apuntes para su Historia"',
    bio: [
      'Escribió "Fuentelespino de Haro, Apuntes para su Historia", el libro en el que se basa casi todo lo que sabemos sobre el pasado del pueblo y del que procede la historia de esta app.',
    ],
    enlace: WEB + 'bibliografia.htm',
  },
]

export const PERSONAJES_FAMOSOS: Personaje[] = [
  {
    id: 'pilar-rubio',
    nombre: 'Pilar Rubio',
    epoca: 'Nacida en 1978',
    lema: 'Presentadora de televisión y actriz',
    bio: [
      'Nació en Torrejón de Ardoz (Madrid). Su familia tiene raíces en Fuentelespino de Haro.',
      'Se dio a conocer como reportera de "Sé lo que hicisteis…" en laSexta, donde sus reportajes la hicieron muy popular. Después presentó programas como "Operación Triunfo" en Telecinco y ha trabajado como actriz en cine y series.',
      'Desde 2014 es colaboradora de "El Hormiguero" en Antena 3, donde es conocida por sus retos. Está casada con el futbolista Sergio Ramos.',
    ],
    enlace: 'http://www.pilarrubio.com',
  },
  {
    id: 'ana-pastor',
    nombre: 'Ana Pastor',
    epoca: 'Nacida en 1977',
    lema: 'Periodista y presentadora',
    bio: [
      'Nació en Madrid y tiene raíces familiares en Fuentelespino de Haro.',
      'Destacó en Televisión Española en "59 segundos" y sobre todo como presentadora de "Los desayunos de TVE", donde se hizo conocida por sus entrevistas incisivas a políticos.',
      'Trabajó después en CNN en Español y desde 2013 presenta "El Objetivo" en laSexta, centrado en la verificación de datos. En 2018 fundó Newtral, una empresa dedicada a comprobar noticias y declaraciones.',
    ],
  },
  {
    id: 'toni-costa',
    nombre: 'Toni Costa',
    epoca: 'Bailarín',
    lema: 'Bailarín de "Mira quién baila"',
    bio: [
      'Bailarín profesional valenciano con raíces familiares en Fuentelespino de Haro.',
      'Se hizo conocido como bailarín profesional de "Mira quién baila" en TVE. Después dio el salto a la versión del programa en Univision, en Estados Unidos.',
      'Se instaló en Miami, donde ha seguido su carrera en el baile y en la televisión en español.',
    ],
  },
]

export const PERSONAJES_FUENTE = WEB + 'famosos.htm'

// ---------- Vídeos ----------

export type Video = { id: string; titulo: string; autor?: string }

export const VIDEOS_PROMOCIONALES: Video[] = [
  { id: 'w1A90cHzAsY', titulo: 'Fuentelespino de Haro', autor: 'Antonio J. Carrascosa Jiménez (golorock)' },
  { id: 'RZFwqr4B3M0', titulo: 'Fuentelespino de Haro (II)', autor: 'Antonio J. Carrascosa Jiménez (golorock)' },
  { id: '6eC2vtmQlsQ', titulo: 'Fuentelespino de Haro', autor: 'Carlos Arce' },
]

export const VIDEOS_VARIOS: Video[] = [
  { id: '3c9mB304v84', titulo: 'Fuentelespino de Haro' },
  { id: 'eJHH-5YSREI', titulo: 'Promoción IV Marcha MTB' },
  { id: 'SX2Wpx-7S5E', titulo: 'El Cerrete de Haro' },
  { id: '4RPTV-mm9Ok', titulo: 'Antigua Peña Barcelonista de Fuentelespino de Haro' },
]

export const VIDEOS_FUENTE = WEB + 'videox.htm'

// ---------- Dónde alojarse ----------

export type Alojamiento = {
  nombre: string
  tipo: string
  resumen: string
  telefonos: string[]
  web?: string
  gerencia?: string
  casas: string[]
  servicios: string[]
  actividades: string[]
  extras: { titulo: string; texto: string }[]
  cerca: { lugar: string; km: number }[]
  videos: Video[]
}

export const ALOJAMIENTOS: Alojamiento[] = [
  {
    nombre: 'El Cerrete de Haro',
    tipo: 'Complejo de turismo rural',
    resumen:
      'Siete casas rurales en plena Mancha Alta, la comarca que recorre Don Quijote en la novela de Cervantes. Cada casa tiene capacidad para 8 personas.',
    telefonos: ['967187800', '680809336'],
    web: 'http://www.elcerretedeharo.com',
    gerencia: 'Pedro José y Santiago Jiménez Martínez',
    casas: ['2 dormitorios', 'Baño con ducha en acabado de madera', 'Cocina con frigorífico, microondas y vitrocerámica', 'Salón comedor amplio con chimenea'],
    servicios: ['Piscina', 'Pistas polideportivas', 'Parque infantil', 'Aula de naturaleza', 'Cafetería', 'Restaurante'],
    actividades: ['Senderismo y trekking', 'Rutas en bici de montaña', 'Quads', 'Tiro con arco', 'Paintball', 'Enoturismo', 'Talleres de medio ambiente'],
    extras: [
      { titulo: 'Salón de celebraciones', texto: 'Para comidas de empresa, celebraciones, congresos y despedidas de soltero.' },
      { titulo: 'Albergue', texto: 'Albergue abuhardillado para campamentos, convivencias y jornadas. Hay que consultar disponibilidad y precios.' },
    ],
    cerca: [
      { lugar: 'Villaescusa de Haro', km: 12 },
      { lugar: 'Belmonte', km: 18 },
      { lugar: 'Segóbriga', km: 27 },
      { lugar: 'Mota del Cuervo', km: 34 },
      { lugar: 'Alarcón', km: 70 },
      { lugar: 'Cuenca', km: 82 },
    ],
    videos: [
      { id: 'SX2Wpx-7S5E', titulo: 'El Cerrete de Haro' },
      { id: 'uEmog4Yzd0g', titulo: 'El Cerrete de Haro (II)' },
      { id: '0Isd3b4nyZQ', titulo: 'El Cerrete de Haro (III)' },
    ],
  },
]

export const ALOJAMIENTO_FUENTE = WEB + 'alojarse.htm'
