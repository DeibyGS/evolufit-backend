/**
 * LISTA MAESTRA DE EJERCICIOS Y GRUPOS - EVOLUTFIT
 * Esta es la fuente de verdad para validaciones de Zod y consultas de DB.
 */

const MUSCLE_GROUPS = [
  "Pecho",
  "Espalda",
  "Deltoides",
  "Bíceps",
  "Tríceps",
  "Cuádriceps",
  "Isquiotibiales",
  "Abdomen",
];

const EXERCISE_NAMES = [
  // PECHO
  "Press de Banca Plano",
  "Press Inclinado con Mancuernas",
  "Aperturas en Peck Deck",
  "Cruces en Polea Alta",
  "Press Declinado con Barra",
  "Fondos en Paralelas (Pecho)",
  "Flexiones de Brazos",
  "Press de Banca en Máquina",

  // ESPALDA
  "Dominadas Lastradas",
  "Jalón al Pecho",
  "Remo con Barra",
  "Remo en Polea Baja",
  "Remo con Mancuerna a una Mano",
  "Pull-over en Polea Alta",
  "Remo T con Apoyo",
  "Hiperextensiones",

  // DELTOIDES
  "Press Militar con Barra",
  "Elevaciones Laterales con Mancuerna",
  "Press Arnold",
  "Face Pull en Polea",
  "Pájaros (Deltoide Posterior)",
  "Elevaciones Frontales con Disco",
  "Remo al Cuello en Polea",
  "Press de Hombro en Máquina",

  // BÍCEPS
  "Curl con Barra Z",
  "Curl Alterno con Mancuernas",
  "Curl Martillo",
  "Curl en Banco Predicador",
  "Curl Concentrado",
  "Curl en Polea Baja",
  "Curl tipo Spider",
  "Chin-ups (Bíceps)",

  // TRÍCEPS
  "Extensiones en Polea Alta",
  "Press Francés con Barra Z",
  "Fondos entre Bancos",
  "Copa a una Mano con Mancuerna",
  "Patada de Tríceps en Polea",
  "Press de Banca Agarre Cerrado",
  "Extensiones tras nuca con cuerda",
  "Flexiones Diamante",

  // CUÁDRICEPS
  "Sentadilla Libre con Barra",
  "Prensa de Piernas 45°",
  "Extensiones de Cuádriceps",
  "Zancadas con Mancuernas",
  "Sentadilla Hack",
  "Sentadilla Búlgara",
  "Sentadilla Frontal",
  "Step Up con Peso",

  // ISQUIOTIBIALES
  "Peso Muerto Rumano",
  "Curl Femoral Tumbado",
  "Curl Femoral Sentado",
  "Buenos Días con Barra",
  "Curl Femoral de Pie",
  "Puente de Glúteo / Isquio",
  "Peso Muerto con Piernas Rígidas",
  "Hip Thrust",

  // ABDOMEN
  "Crunch Abdominal en Máquina",
  "Elevación de Piernas Colgado",
  "Plancha Abdominal",
  "Rueda Abdominal",
  "Twist Ruso con Disco",
  "Woodchopper en Polea",
  "Crunch con Cable (Polea)",
  "Bicicleta Abdominal",
];

module.exports = {
  MUSCLE_GROUPS,
  EXERCISE_NAMES,
};
