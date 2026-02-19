/**
 * LISTA MAESTRA DE EJERCICIOS Y GRUPOS - EVOLUTFIT
 * Fuente de verdad para validaciones de Zod (workoutValidator.js).
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
  "Glúteo",
];

const EXERCISE_NAMES = [
  // PECHO
  "Press de Banca Plano con barra",
  "Press de Banca Plano con  mancuernas",
  "Press Inclinado con Mancuernas",
  "Press Inclinado con Maquina Smith",
  "Aperturas en Peck Deck",
  "Aperturas con mancuernas",
  "Cruces en Polea Alta",
  "Press Declinado con Barra",
  "Fondos en Paralelas (Pecho)",
  "Flexiones de Brazos",
  "Press de Banca en Máquina",
  "Cruces en Polea Baja",

  // ESPALDA
  "Dominadas",
  "Dominadas Lastradas",
  "Jalón al Pecho",
  "Remo con Barra",
  "Remo en Polea Baja",
  "Remo con Mancuerna a una Mano",
  "Pull-over en Polea Alta",
  "Remo en maquina",
  "Hiperextensiones",
  "Remo unilateral en maquina",
  "Face Pull",

  // DELTOIDES
  "Press Militar con Barra",
  "Elevaciones Laterales con Mancuerna",
  "Press Arnold",
  "Face Pull en Polea",
  "Pájaros (Deltoide Posterior) con mancuernas",
  "Elevaciones Frontales con Disco",
  "Remo al Cuello en Polea",
  "Press de Hombro en Máquina",
  "Elevaciones Laterales en Polea",
  "Press Militar con Mancuernas",
  "Elevaciones Posteriores en Polea",
  "Remo al Cuello con Barra",
  "Elevaciones Frontales con Mancuerna",
  "Pájaros en Peck Deck",
  "Press de Hombro con Mancuernas en Banco Inclinado",
  "Elevaciones Laterales con Mancuerna en Banco Inclinado",
  "Remo al Cuello con Mancuerna",
  "Press de Hombro en Máquina Smith",
  "Elevaciones Laterales con Mancuerna en Banco Plano",
  "Elevaciones Frontales con Mancuerna a una Mano",
  "Pájaros con Mancuerna en Banco Inclinado",

  // BÍCEPS
  "Curl con Barra Z",
  "Curl Alterno con Mancuernas",
  "Curl Martillo",
  "Curl en Banco Predicador",
  "Curl Concentrado",
  "Curl en Polea Baja",
  "Curl tipo Spider",
  "Curl con Barra Recta",
  "Curl con Mancuerna en Banco Inclinado",
  "Curl en Polea Alta con Cuerda",
  "Curl de Bíceps en Máquina",
  "Curl Alterno con Supinación",
  "Curl Concentrado con Mancuerna",

  // TRÍCEPS
  "Extensiones en Polea Alta con Cuerda",
  "Press Francés con Barra Z",
  "Fondos entre Bancos",
  "Copa a una Mano con Mancuerna",
  "Copa a dos Manos con Mancuerna",
  "Patada de Tríceps en Polea",
  "Press de Banca Agarre Cerrado",
  "Extensiones tras nuca con cuerda",
  "Flexiones Diamante",
  "Press Francés con Mancuerna",
  "Fondos en Maquina",
  "Extensiones en Polea Alta con Barra",
  "Extensiones en Polea Unilateral",

  // CUÁDRICEPS
  "Sentadilla Libre con Barra",
  "Prensa de Piernas 45°",
  "Extensiones de Cuádriceps",
  "Zancadas con Mancuernas",
  "Sentadilla Hack",
  "Sentadilla Búlgara",
  "Sentadilla Frontal",
  "Sentadilla en Máquina Smith",
  "Prensa de Piernas Horizontal",
  "Sentadilla con Mancuernas",
  "Sentadilla Sissy",
  "Zancadas en Máquina Smith",
  "Sentadilla con Sumo",

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

  // GLÚTEO
  "Hip Thrust con Barra",
  "Kicks de Glúteo en Polea",
  "Abducción de Cadera en Máquina",
  "Clamshells con Banda",
  "Step Up en Cajón",
  "Puente de Glúteo Unilateral",
  "Frog Pumps",
  "Peso Muerto Sumo con Mancuerna",
];

module.exports = {
  MUSCLE_GROUPS,
  EXERCISE_NAMES,
};
