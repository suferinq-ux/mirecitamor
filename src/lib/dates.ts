export type Category =
  | "aventura"
  | "casa"
  | "comida"
  | "cultura"
  | "naturaleza"
  | "especial";

export interface DateIdea {
  id: number;
  title: string;
  emoji: string;
  cat: Category;
  tip: string;
  special?: boolean;
}

export const CATEGORIES: Record<
  Category,
  { label: string; emoji: string; chip: string; tint: string }
> = {
  aventura: {
    label: "Aventura",
    emoji: "🧭",
    chip: "from-amber-400/20 to-orange-500/20 text-amber-200 border-amber-300/30",
    tint: "from-amber-500/15 via-orange-500/5 to-transparent"
  },
  casa: {
    label: "En casa",
    emoji: "🏠",
    chip: "from-sky-400/20 to-indigo-500/20 text-sky-200 border-sky-300/30",
    tint: "from-sky-500/15 via-indigo-500/5 to-transparent"
  },
  comida: {
    label: "Antojos",
    emoji: "🍓",
    chip: "from-rose-400/20 to-pink-500/20 text-rose-200 border-rose-300/30",
    tint: "from-rose-500/15 via-pink-500/5 to-transparent"
  },
  cultura: {
    label: "Cultura",
    emoji: "🎭",
    chip: "from-violet-400/20 to-purple-500/20 text-violet-200 border-violet-300/30",
    tint: "from-violet-500/15 via-purple-500/5 to-transparent"
  },
  naturaleza: {
    label: "Naturaleza",
    emoji: "🌿",
    chip: "from-emerald-400/20 to-teal-500/20 text-emerald-200 border-emerald-300/30",
    tint: "from-emerald-500/15 via-teal-500/5 to-transparent"
  },
  especial: {
    label: "Especiales",
    emoji: "💖",
    chip: "from-fuchsia-400/20 to-rose-500/20 text-fuchsia-200 border-fuchsia-300/30",
    tint: "from-fuchsia-500/15 via-rose-500/5 to-transparent"
  }
};

export const DATES: DateIdea[] = [
  { id: 1, title: "Ir al cine", emoji: "🎬", cat: "cultura", tip: "Palomitas, tu mano en la mía y ninguna prisa." },
  { id: 2, title: "Salir a comer", emoji: "🍽️", cat: "comida", tip: "Ese lugar que siempre decimos “un día vamos”." },
  { id: 3, title: "Ir al parque", emoji: "🌳", cat: "naturaleza", tip: "Caminar sin rumbo: nuestro rumbo favorito." },
  { id: 4, title: "Día de picnic", emoji: "🧺", cat: "naturaleza", tip: "Mantel, fruta y el sol de testigo." },
  { id: 5, title: "Cenar en un restaurante bonito", emoji: "🕯️", cat: "comida", tip: "Brindis lento y sobremesa larga." },
  { id: 6, title: "Viaje fuera de la ciudad", emoji: "🧳", cat: "aventura", tip: "Maleta pequeña, recuerdos gigantes." },
  { id: 7, title: "Ir a un museo", emoji: "🖼️", cat: "cultura", tip: "Susurrar comentarios de expertos fingidos." },
  { id: 8, title: "Pedir cena a domicilio", emoji: "🛵", cat: "comida", tip: "Pijama, peli y que llueva allá afuera." },
  { id: 9, title: "Armar un rompecabezas", emoji: "🧩", cat: "casa", tip: "Mil piezas y ninguna tan difícil como elegir película." },
  { id: 10, title: "Preparar un postre", emoji: "🍰", cat: "comida", tip: "Harina en la nariz y besos con sabor a vainilla." },
  { id: 11, title: "Pintar un cuadro", emoji: "🎨", cat: "casa", tip: "Dos brochas, un lienzo y nuestro caos bonito." },
  { id: 12, title: "Ir a patinar", emoji: "⛸️", cat: "aventura", tip: "Sostenernos del brazo y reírnos de las caídas." },
  { id: 13, title: "Ir a un partido de béisbol", emoji: "⚾", cat: "aventura", tip: "Gritar como si fuéramos dueños del estadio." },
  { id: 14, title: "Maratón de series", emoji: "📺", cat: "casa", tip: "“Un episodio más” ×14." },
  { id: 15, title: "Ir a la playa", emoji: "🏖️", cat: "naturaleza", tip: "Arena en todos lados y felicidad también." },
  { id: 16, title: "Ir a un concierto", emoji: "🎸", cat: "cultura", tip: "Cantar desafinados las mismas canciones." },
  { id: 17, title: "Ir por bebidas con tapioca", emoji: "🧋", cat: "comida", tip: "Dos popotes, un brindis bobo." },
  { id: 18, title: "Ir al zoológico", emoji: "🐘", cat: "naturaleza", tip: "Imitar animales y elegir nuestro favorito." },
  { id: 19, title: "Ir de compras", emoji: "🛍️", cat: "aventura", tip: "Probadores, opiniones sinceras y un antojo compartido." },
  { id: 20, title: "Ir a remar o pescar", emoji: "🎣", cat: "naturaleza", tip: "Silencio bueno, agua calma y tú." },
  { id: 21, title: "Ir a un tour", emoji: "🗺️", cat: "aventura", tip: "Ser turistas en nuestra propia ciudad." },
  { id: 22, title: "Ir a un circo", emoji: "🎪", cat: "cultura", tip: "Asombrarnos como niños de cinco años." },
  { id: 23, title: "Ir a una fiesta", emoji: "💃", cat: "especial", tip: "Bailar pegaditos aunque suene lo de siempre." },
  { id: 24, title: "Pasear en la plaza", emoji: "🌷", cat: "naturaleza", tip: "Banquita, helado derretido y conversación larga." },
  { id: 25, title: "Ir por un helado", emoji: "🍦", cat: "comida", tip: "Dos cucharitas, un solo helado." },
  { id: 26, title: "Ir a un cumpleaños", emoji: "🎂", cat: "especial", tip: "Regalo elegido juntos y pastel duplicado." },
  { id: 27, title: "Cenar en el coche", emoji: "🚗", cat: "aventura", tip: "Ventanas empañadas y nuestra playlist de fondo." },
  { id: 28, title: "Ir a una boda", emoji: "💒", cat: "especial", tip: "Llorar en los votos y robarnos flores." },
  { id: 29, title: "Ir a una cascada", emoji: "💦", cat: "naturaleza", tip: "El ruido del agua tapando nuestros secretos." },
  { id: 30, title: "Cena romántica", emoji: "🌹", cat: "comida", tip: "Velas, carta escrita a mano y tu mirada." },
  { id: 31, title: "Cocinar juntos", emoji: "👩🍳", cat: "casa", tip: "Receta nueva, desastre delicioso." },
  { id: 32, title: "Acampar", emoji: "⛺", cat: "aventura", tip: "Contar estrellas hasta quedarnos dormidos." },
  { id: 33, title: "Caminar bajo la lluvia", emoji: "☔", cat: "naturaleza", tip: "Sin paraguas: así se siente más." },
  { id: 34, title: "Ver un atardecer", emoji: "🌇", cat: "naturaleza", tip: "El cielo compitiendo contigo." },
  { id: 35, title: "Leer juntos", emoji: "📚", cat: "casa", tip: "Un capítulo cada uno, en voz alta." },
  { id: 36, title: "Desayuno en la cama", emoji: "🥐", cat: "casa", tip: "Café, fruta y “cinco minutitos más”." },
  { id: 37, title: "Ver partidos en la TV", emoji: "📺", cat: "casa", tip: "Porras opuestas y apuestas con besos." },
  { id: 38, title: "Ir al supermercado", emoji: "🛒", cat: "casa", tip: "Carrito lleno de antojos y nada necesario." },
  { id: 39, title: "Trabajar juntos", emoji: "💻", cat: "casa", tip: "Compañía bonita hasta en lunes." },
  { id: 40, title: "Pintar una pared", emoji: "🖌️", cat: "casa", tip: "Un color nuevo para una vida nueva." },
  { id: 41, title: "Dibujar / pintar juntos", emoji: "✏️", cat: "casa", tip: "Retratos feos y hermosos de nosotros." },
  { id: 42, title: "Subirnos en un globo aerostático", emoji: "🎈", cat: "aventura", tip: "El mundo chiquito allá abajo y tú acá arriba." },
  { id: 43, title: "Armar un Lego", emoji: "🧱", cat: "casa", tip: "Instrucciones ignoradas, castillo improvisado." },
  { id: 44, title: "Vestir iguales", emoji: "👯", cat: "especial", tip: "Matchy matchy y fotos para el recuerdo." },
  { id: 45, title: "Jugar videojuegos", emoji: "🎮", cat: "casa", tip: "Co-op o versus: igual ganamos nosotros." },
  { id: 46, title: "Viajar en barco o yate", emoji: "⛵", cat: "aventura", tip: "Viento, sal y horizonte compartido." },
  { id: 47, title: "Ponernos mascarillas", emoji: "🥒", cat: "casa", tip: "Spa casero: pepino, risas y cero fotos dignas." },
  { id: 48, title: "Salir a bailar", emoji: "🕺", cat: "cultura", tip: "La pista es nuestra aunque esté llena." },
  { id: 49, title: "Disfrazarnos en pareja", emoji: "🎭", cat: "especial", tip: "El dúo más icónico de cualquier fiesta." },
  { id: 50, title: "Ir por un café", emoji: "☕", cat: "comida", tip: "Nuestra cafetería, nuestra mesa, nuestro ritual." },
  { id: 51, title: "Escuchar música", emoji: "🎧", cat: "cultura", tip: "Un audífono cada uno, la misma canción." },
  { id: 52, title: "Armar un mueble", emoji: "🪑", cat: "casa", tip: "Sobran tornillos, falta paciencia, sobra amor." },
  { id: 53, title: "Volar un papalote", emoji: "🪁", cat: "naturaleza", tip: "Correr, soltar hilo y mirar hacia arriba juntos." },
  { id: 54, title: "Guerra de almohadas", emoji: "🛏️", cat: "casa", tip: "Tregua prohibida hasta rendirse a besos." },
  { id: 55, title: "Pijamada", emoji: "🌙", cat: "casa", tip: "Mascarillas, snacks y chismes hasta tarde." },
  { id: 56, title: "Observar las estrellas", emoji: "✨", cat: "naturaleza", tip: "Constelaciones inventadas con tu nombre." },
  { id: 57, title: "Hacer una cita con temática", emoji: "🎪", cat: "especial", tip: "Noche italiana, mexicana o de los años 50." },
  { id: 58, title: "Pasear a nuestras mascotas", emoji: "🐶", cat: "naturaleza", tip: "Correas, lametadas y fotos obligatorias." },
  { id: 59, title: "Pedir pizza", emoji: "🍕", cat: "comida", tip: "Mitad tú, mitad yo, orilla compartida." },
  { id: 60, title: "Salir a caminar", emoji: "🚶", cat: "naturaleza", tip: "Sin destino: el destino es ir juntos." },
  { id: 61, title: "Hacer una fogata", emoji: "🔥", cat: "aventura", tip: "Malvaviscos dorados y canciones bajitas." },
  { id: 62, title: "Hacer una sesión de fotos", emoji: "📸", cat: "especial", tip: "Luz dorada, poses tontas, recuerdos eternos." },
  { id: 63, title: "Hacer manualidades", emoji: "✂️", cat: "casa", tip: "Tijeras, pegamento y orgullo por nuestra obra." },
  { id: 64, title: "Jugar juegos de mesa", emoji: "🎲", cat: "casa", tip: "UNO, Catán y una rivalidad adorable." },
  { id: 65, title: "Ir a un bazar", emoji: "🏺", cat: "aventura", tip: "Tesoros raros y un recuerdito para nosotros." },
  { id: 66, title: "Ir a comer donas", emoji: "🍩", cat: "comida", tip: "Glaseado en los dedos y en los besos." },
  { id: 67, title: "Comer en un buffet", emoji: "🍱", cat: "comida", tip: "Reto: probar todo y repetir lo mejor." },
  { id: 68, title: "Empezar una alcancía", emoji: "🐷", cat: "especial", tip: "Moneditas hoy, aventura gigante mañana." },
  { id: 69, title: "Ver la luna", emoji: "🌕", cat: "naturaleza", tip: "Confirmar que no brilla tanto como tú." },
  { id: 70, title: "Escribirnos una carta", emoji: "💌", cat: "especial", tip: "Palabras que guardaremos para siempre." },
  { id: 71, title: "Hacernos un tatuaje", emoji: "🖋️", cat: "especial", tip: "Un símbolo nuestro, en la piel, para siempre." },
  { id: 72, title: "Ir a un pueblo mágico", emoji: "🏘️", cat: "aventura", tip: "Calles empedradas y pan recién horneado." },
  { id: 73, title: "Ir a un spa", emoji: "💆", cat: "especial", tip: "Masajes, vapor y cero pendientes." },
  { id: 74, title: "Cena familiar", emoji: "🍲", cat: "especial", tip: "Presumirnos con los nuestros." },
  { id: 75, title: "Ir por hamburguesas", emoji: "🍔", cat: "comida", tip: "Con todo: queso extra y papas compartidas." },
  { id: 76, title: "Ir a una posada", emoji: "🎄", cat: "especial", tip: "Ponche, velitas y cantos abrazados." },
  { id: 77, title: "Viajar en avión", emoji: "✈️", cat: "aventura", tip: "Ventanilla compartida y manos apretadas al despegar." },
  { id: 78, title: "Salir con amigos", emoji: "🥂", cat: "especial", tip: "Nuestra gente favorita celebrándonos." },
  { id: 79, title: "Noche de películas", emoji: "🎥", cat: "casa", tip: "Manta, snacks y debate de finales." },
  { id: 80, title: "Ir a cenar tacos", emoji: "🌮", cat: "comida", tip: "De pastor, de suadero… y de postre, tú." },
  { id: 81, title: "Ir a un parque de diversiones", emoji: "🎢", cat: "aventura", tip: "Gritos en la montaña rusa y algodón de azúcar." },
  { id: 82, title: "Salir por un elote / esquite", emoji: "🌽", cat: "comida", tip: "Con todo: mayo, queso, chile y limón." },
  { id: 83, title: "Comprar plantas", emoji: "🪴", cat: "naturaleza", tip: "Una selva nueva bajo nuestro cuidado." },
  { id: 84, title: "Ir a jugar bolos", emoji: "🎳", cat: "aventura", tip: "Strike cantado y beso de celebración." },
  { id: 85, title: "Ir al planetario", emoji: "🪐", cat: "cultura", tip: "El universo entero y tú a mi lado." },
  { id: 86, title: "Visitar el acuario", emoji: "🐠", cat: "naturaleza", tip: "Medusas iluminadas y reflejos azules en tu cara." },
  { id: 87, title: "Pasear en bicicleta", emoji: "🚲", cat: "naturaleza", tip: "Ruta larga con paradas por helados." },
  { id: 88, title: "Ver una obra de teatro", emoji: "🎭", cat: "cultura", tip: "Aplaudir hasta que duelan las manos." },
  { id: 89, title: "Ir a una feria", emoji: "🎡", cat: "aventura", tip: "Juegos, luces y un peluche ganado por mí." },
  { id: 90, title: "Sacar un peluche de una máquina", emoji: "🧸", cat: "aventura", tip: "Monedas, suerte y nuestro primer “hijo” de peluche." },
  { id: 91, title: "Hora de ser espontáneos", emoji: "💫", cat: "especial", tip: "Lo que surja: hoy manda el corazón." },
  { id: 92, title: "Hora de ser espontáneos", emoji: "💫", cat: "especial", tip: "Regla: decir que sí a lo primero que proponga." },
  { id: 93, title: "Hora de ser espontáneos", emoji: "💫", cat: "especial", tip: "Sorteo secreto: el otro lo prepara todo." },
  { id: 94, title: "Hora de ser espontáneos", emoji: "💫", cat: "especial", tip: "Salir sin teléfono y sin plan." },
  { id: 95, title: "Hora de ser espontáneos", emoji: "💫", cat: "especial", tip: "Al azar: ¿doblar a la izquierda o a la derecha?" },
  { id: 96, title: "Hora de ser espontáneos", emoji: "💫", cat: "especial", tip: "Recrear nuestra primera cita." },
  { id: 97, title: "Hora de ser espontáneos", emoji: "💫", cat: "especial", tip: "Intercambiar roles por un día." },
  { id: 98, title: "Hora de ser espontáneos", emoji: "💫", cat: "especial", tip: "Presupuesto sorpresa: lo que haya en la bolsa." },
  { id: 99, title: "Hora de ser espontáneos", emoji: "💫", cat: "especial", tip: "Dejar que el otro elija TODO." },
  {
    id: 100,
    title: "Modelar plastilina juntos",
    emoji: "🎨",
    cat: "especial",
    special: true,
    tip: "Figuritas de nosotros: la obra de arte más tierna del mundo."
  }
];
