// Banco de preguntas de trivia sobre la Liga BetPlay de Colombia
// Cada pregunta tiene 4 opciones y una respuesta correcta
// ÚLTIMA VERIFICACIÓN: 30 de abril de 2026
// Todas las respuestas han sido verificadas con fuentes oficiales

export interface TriviaQuestionData {
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: 'A' | 'B' | 'C' | 'D'
  category: string
  teamSlug?: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export const triviaQuestions: TriviaQuestionData[] = [
  // === ESTADIOS ===
  {
    question: "¿En qué estadio juega como local Millonarios FC?",
    optionA: "Estadio El Campín",
    optionB: "Estadio Atanasio Girardot",
    optionC: "Estadio Pascual Guerrero",
    optionD: "Estadio Metropolitano",
    correctAnswer: "A",
    category: "estadios",
    teamSlug: "millonarios",
    difficulty: "easy"
  },
  {
    question: "¿Cuál es el estadio del Atlético Nacional?",
    optionA: "Estadio Palogrande",
    optionB: "Estadio Atanasio Girardot",
    optionC: "Estadio El Campín",
    optionD: "Estadio Nemesio Camacho",
    correctAnswer: "B",
    category: "estadios",
    teamSlug: "atletico-nacional",
    difficulty: "easy"
  },
  {
    question: "¿En qué estadio juega el Junior FC?",
    optionA: "Estadio El Campín",
    optionB: "Estadio Pascual Guerrero",
    optionC: "Estadio Metropolitano Roberto Meléndez",
    optionD: "Estadio Alfonso López",
    correctAnswer: "C",
    category: "estadios",
    teamSlug: "junior-fc",
    difficulty: "easy"
  },
  {
    question: "¿Cuál es el estadio del América de Cali?",
    optionA: "Estadio Deportivo Cali",
    optionB: "Estadio Pascual Guerrero",
    optionC: "Estadio Hernán Ramírez Villegas",
    optionD: "Estadio Libertad",
    correctAnswer: "B",
    category: "estadios",
    teamSlug: "america-de-cali",
    difficulty: "easy"
  },
  {
    question: "¿Qué equipo juega en el Estadio Palogrande de Manizales?",
    optionA: "Deportes Tolima",
    optionB: "Deportivo Pereira",
    optionC: "Once Caldas",
    optionD: "Envigado FC",
    correctAnswer: "C",
    category: "estadios",
    teamSlug: "once-caldas",
    difficulty: "medium"
  },
  {
    question: "¿Cuál es el estadio del Deportivo Cali?",
    optionA: "Estadio Pascual Guerrero",
    optionB: "Estadio Deportivo Cali",
    optionC: "Estadio Hernán Ramírez Villegas",
    optionD: "Estadio Palogrande",
    correctAnswer: "B",
    category: "estadios",
    teamSlug: "deportivo-cali",
    difficulty: "medium"
  },
  {
    question: "¿En qué estadio juega Deportes Tolima como local?",
    optionA: "Estadio Manuel Murillo Toro",
    optionB: "Estadio La Independencia",
    optionC: "Estadio Jaraguay",
    optionD: "Estadio Alberto Grisales",
    correctAnswer: "A",
    category: "estadios",
    teamSlug: "deportes-tolima",
    difficulty: "medium"
  },
  // CORREGIDO: Pregunta anterior era ambigua (2 equipos juegan en Metropolitano de Techo)
  {
    question: "¿En qué estadio de Bogotá juega como local Fortaleza CEIF?",
    optionA: "Estadio El Campín",
    optionB: "Estadio Metropolitano de Techo",
    optionC: "Estadio Alfonso López",
    optionD: "Estadio Palogrande",
    correctAnswer: "B",
    category: "estadios",
    teamSlug: "fortaleza-ceif",
    difficulty: "medium"
  },
  {
    question: "¿Cuál es el único estadio de Colombia que es propiedad de un club de fútbol?",
    optionA: "Estadio El Campín",
    optionB: "Estadio Atanasio Girardot",
    optionC: "Estadio Deportivo Cali",
    optionD: "Estadio Palogrande",
    correctAnswer: "C",
    category: "estadios",
    teamSlug: "deportivo-cali",
    difficulty: "hard"
  },

  // === FUNDACIÓN (VERIFICADOS) ===
  {
    question: "¿En qué año fue fundado el Deportivo Cali?",
    optionA: "1912",
    optionB: "1927",
    optionC: "1947",
    optionD: "1913",
    correctAnswer: "A",
    category: "fundacion",
    teamSlug: "deportivo-cali",
    difficulty: "hard"
  },
  {
    question: "¿Cuál es el equipo más antiguo de la Liga BetPlay actualmente?",
    optionA: "Atlético Nacional (1947)",
    optionB: "Independiente Medellín (1913)",
    optionC: "Deportivo Cali (1912)",
    optionD: "Junior FC (1924)",
    correctAnswer: "C",
    category: "fundacion",
    difficulty: "hard"
  },
  {
    question: "¿En qué año fue fundado el América de Cali?",
    optionA: "1927",
    optionB: "1947",
    optionC: "1913",
    optionD: "1924",
    correctAnswer: "A",
    category: "fundacion",
    teamSlug: "america-de-cali",
    difficulty: "medium"
  },
  {
    question: "¿En qué año fue fundado Atlético Nacional?",
    optionA: "1947",
    optionB: "1946",
    optionC: "1913",
    optionD: "1949",
    correctAnswer: "A",
    category: "fundacion",
    teamSlug: "atletico-nacional",
    difficulty: "medium"
  },
  // CORREGIDO: Once Caldas se fundó oficialmente en 1961 (fusión), no 1949
  {
    question: "¿En qué año fue fundado Once Caldas tras la fusión de Deportes Caldas y Once Deportivo?",
    optionA: "1949",
    optionB: "1959",
    optionC: "1961",
    optionD: "1954",
    correctAnswer: "C",
    category: "fundacion",
    teamSlug: "once-caldas",
    difficulty: "hard"
  },
  {
    question: "¿En qué año fue fundado Junior FC?",
    optionA: "1924",
    optionB: "1927",
    optionC: "1946",
    optionD: "1913",
    correctAnswer: "A",
    category: "fundacion",
    teamSlug: "junior-fc",
    difficulty: "medium"
  },
  // CORREGIDO: La Equidad se fundó en 1982, no 1947
  {
    question: "¿En qué año fue fundado el club La Equidad?",
    optionA: "1947",
    optionB: "1982",
    optionC: "2000",
    optionD: "1975",
    correctAnswer: "B",
    category: "fundacion",
    teamSlug: "la-equidad",
    difficulty: "hard"
  },
  // CORREGIDO: Fortaleza CEIF se fundó en 2010, no 2000
  {
    question: "¿En qué año fue fundado Fortaleza CEIF?",
    optionA: "2000",
    optionB: "2010",
    optionC: "2015",
    optionD: "2005",
    correctAnswer: "B",
    category: "fundacion",
    teamSlug: "fortaleza-ceif",
    difficulty: "hard"
  },
  // CORREGIDO: Jaguares de Córdoba se fundó en 2012, no 2014
  {
    question: "¿En qué año fue fundado Jaguares de Córdoba?",
    optionA: "2014",
    optionB: "2010",
    optionC: "2012",
    optionD: "2016",
    correctAnswer: "C",
    category: "fundacion",
    teamSlug: "jaguares-de-cordoba",
    difficulty: "hard"
  },
  // CORREGIDO: Patriotas FC se fundó en 2003, no 2013
  {
    question: "¿En qué año fue fundado Patriotas FC?",
    optionA: "2013",
    optionB: "2003",
    optionC: "2008",
    optionD: "1998",
    correctAnswer: "B",
    category: "fundacion",
    teamSlug: "patriotas",
    difficulty: "hard"
  },
  {
    question: "¿Cuál es el equipo más reciente en la Liga BetPlay 2026?",
    optionA: "Alianza FC (2024)",
    optionB: "Internacional de Bogotá (2025)",
    optionC: "Internacional de Palmira (2024)",
    optionD: "Cúcuta Deportivo (ascendió 2026)",
    correctAnswer: "B",
    category: "fundacion",
    teamSlug: "internacional-de-bogota",
    difficulty: "medium"
  },

  // === APODOS (VERIFICADOS) ===
  {
    question: "¿Cuál es el apodo del Atlético Nacional?",
    optionA: "Los Embajadores",
    optionB: "El Rey de Copas",
    optionC: "Los Diablos Rojos",
    optionD: "El Poderoso",
    correctAnswer: "B",
    category: "apodos",
    teamSlug: "atletico-nacional",
    difficulty: "easy"
  },
  {
    question: "¿Cuál es el apodo del América de Cali?",
    optionA: "Los Cardenales",
    optionB: "Los Tiburones",
    optionC: "Los Diablos Rojos",
    optionD: "Los Azucareros",
    correctAnswer: "C",
    category: "apodos",
    teamSlug: "america-de-cali",
    difficulty: "easy"
  },
  {
    question: "¿Cómo se le conoce popularmente a Millonarios FC?",
    optionA: "Los Embajadores",
    optionB: "El Rey de Copas",
    optionC: "Los Leopardos",
    optionD: "Los Matecaña",
    correctAnswer: "A",
    category: "apodos",
    teamSlug: "millonarios",
    difficulty: "easy"
  },
  {
    question: "¿Cuál es el apodo del Independiente Medellín?",
    optionA: "Los Diablos Rojos",
    optionB: "El Rey de Copas",
    optionC: "El Poderoso",
    optionD: "Los Cardenales",
    correctAnswer: "C",
    category: "apodos",
    teamSlug: "independiente-medellin",
    difficulty: "easy"
  },
  {
    question: "¿Cuál es el apodo de Independiente Santa Fe?",
    optionA: "Los Embajadores",
    optionB: "Los Tiburones",
    optionC: "Los Diablos Rojos",
    optionD: "Los Cardenales",
    correctAnswer: "D",
    category: "apodos",
    teamSlug: "independiente-santa-fe",
    difficulty: "easy"
  },
  {
    question: "¿Cómo se le conoce al Junior FC?",
    optionA: "Los Cardenales",
    optionB: "Los Tiburones",
    optionC: "Los Leopardos",
    optionD: "Los Volcánicos",
    correctAnswer: "B",
    category: "apodos",
    teamSlug: "junior-fc",
    difficulty: "easy"
  },
  {
    question: "¿Cuál es el apodo del Deportivo Cali?",
    optionA: "Los Azucareros",
    optionB: "Los Matecaña",
    optionC: "Los Volcánicos",
    optionD: "Los Ajedrezados",
    correctAnswer: "A",
    category: "apodos",
    teamSlug: "deportivo-cali",
    difficulty: "easy"
  },
  {
    question: "¿Cuál es el apodo del Atlético Bucaramanga?",
    optionA: "Los Jaguares",
    optionB: "Los Leopardos",
    optionC: "Los Ajedrezados",
    optionD: "Los Volcánicos",
    correctAnswer: "B",
    category: "apodos",
    teamSlug: "atletico-bucaramanga",
    difficulty: "medium"
  },
  {
    question: "¿Cuál es el apodo de Boyacá Chicó?",
    optionA: "Los Leopardos",
    optionB: "Los Ajedrezados",
    optionC: "Los Volcánicos",
    optionD: "Los Matecaña",
    correctAnswer: "B",
    category: "apodos",
    teamSlug: "boyaca-chico",
    difficulty: "medium"
  },
  // CORREGIDO: Deportivo Pasto es "Los Volcánicos", no "Los Volcanes"
  {
    question: "¿Cuál es el apodo del Deportivo Pasto?",
    optionA: "Los Volcanes",
    optionB: "Los Volcánicos",
    optionC: "Los Jaguares",
    optionD: "Los Aseguradores",
    correctAnswer: "B",
    category: "apodos",
    teamSlug: "deportivo-pasto",
    difficulty: "medium"
  },
  {
    question: "¿Cuál es el apodo de Deportivo Pereira?",
    optionA: "Los Volcánicos",
    optionB: "Los Matecaña",
    optionC: "Los Leopardos",
    optionD: "Los Ajedrezados",
    correctAnswer: "B",
    category: "apodos",
    teamSlug: "deportivo-pereira",
    difficulty: "medium"
  },
  {
    question: "¿Cuál es el apodo de Deportes Tolima?",
    optionA: "Los Volcánicos",
    optionB: "El Vinotinto y Oro",
    optionC: "Los Aseguradores",
    optionD: "Los Jaguares",
    correctAnswer: "B",
    category: "apodos",
    teamSlug: "deportes-tolima",
    difficulty: "medium"
  },
  {
    question: "¿Cuál es el equipo conocido como 'Los Aseguradores'?",
    optionA: "Fortaleza CEIF",
    optionB: "La Equidad",
    optionC: "Alianza FC",
    optionD: "Patriotas",
    correctAnswer: "B",
    category: "apodos",
    teamSlug: "la-equidad",
    difficulty: "hard"
  },
  {
    question: "¿Cómo se le conoce a Millonarios por su estilo de juego en los años 50?",
    optionA: "Los Embajadores",
    optionB: "El Rey de Copas",
    optionC: "El Ballet Azul",
    optionD: "Los Diablos Rojos",
    correctAnswer: "C",
    category: "apodos",
    teamSlug: "millonarios",
    difficulty: "medium"
  },

  // === COLORES ===
  {
    question: "¿Cuáles son los colores principales del Atlético Nacional?",
    optionA: "Rojo y blanco",
    optionB: "Verde y blanco",
    optionC: "Azul y blanco",
    optionD: "Amarillo y rojo",
    correctAnswer: "B",
    category: "colores",
    teamSlug: "atletico-nacional",
    difficulty: "easy"
  },
  {
    question: "¿Cuáles son los colores de Millonarios FC?",
    optionA: "Rojo y blanco",
    optionB: "Verde y blanco",
    optionC: "Azul y blanco",
    optionD: "Amarillo y negro",
    correctAnswer: "C",
    category: "colores",
    teamSlug: "millonarios",
    difficulty: "easy"
  },
  {
    question: "¿Cuáles son los colores del América de Cali?",
    optionA: "Rojo y blanco",
    optionB: "Verde y blanco",
    optionC: "Azul y blanco",
    optionD: "Amarillo y negro",
    correctAnswer: "A",
    category: "colores",
    teamSlug: "america-de-cali",
    difficulty: "easy"
  },
  {
    question: "¿Cuáles son los colores de Internacional de Bogotá?",
    optionA: "Rojo y azul",
    optionB: "Blanco, negro y dorado",
    optionC: "Verde y blanco",
    optionD: "Naranja y negro",
    correctAnswer: "B",
    category: "colores",
    teamSlug: "internacional-de-bogota",
    difficulty: "medium"
  },

  // === CIUDADES ===
  {
    question: "¿De qué ciudad es el Atlético Nacional?",
    optionA: "Bogotá",
    optionB: "Cali",
    optionC: "Medellín",
    optionD: "Barranquilla",
    correctAnswer: "C",
    category: "ciudades",
    teamSlug: "atletico-nacional",
    difficulty: "easy"
  },
  {
    question: "¿De qué ciudad es el Junior FC?",
    optionA: "Cartagena",
    optionB: "Santa Marta",
    optionC: "Barranquilla",
    optionD: "Montería",
    correctAnswer: "C",
    category: "ciudades",
    teamSlug: "junior-fc",
    difficulty: "easy"
  },
  {
    question: "¿De qué ciudad es Millonarios FC?",
    optionA: "Medellín",
    optionB: "Bogotá",
    optionC: "Cali",
    optionD: "Tunja",
    correctAnswer: "B",
    category: "ciudades",
    teamSlug: "millonarios",
    difficulty: "easy"
  },
  {
    question: "¿De qué ciudad es el Deportivo Pereira?",
    optionA: "Manizales",
    optionB: "Ibagué",
    optionC: "Pereira",
    optionD: "Armenia",
    correctAnswer: "C",
    category: "ciudades",
    teamSlug: "deportivo-pereira",
    difficulty: "easy"
  },
  {
    question: "¿De qué ciudad son los Jaguares de Córdoba?",
    optionA: "Sincelejo",
    optionB: "Montería",
    optionC: "Valledupar",
    optionD: "Barranquilla",
    correctAnswer: "B",
    category: "ciudades",
    teamSlug: "jaguares-de-cordoba",
    difficulty: "medium"
  },
  {
    question: "¿De qué ciudad es el Once Caldas?",
    optionA: "Pereira",
    optionB: "Ibagué",
    optionC: "Manizales",
    optionD: "Bucaramanga",
    correctAnswer: "C",
    category: "ciudades",
    teamSlug: "once-caldas",
    difficulty: "medium"
  },

  // === HISTORIA Y LOGROS (VERIFICADOS) ===
  {
    question: "¿Qué equipo colombiano ganó la Copa Libertadores en 2004?",
    optionA: "Atlético Nacional",
    optionB: "Millonarios",
    optionC: "Once Caldas",
    optionD: "América de Cali",
    correctAnswer: "C",
    category: "historia",
    teamSlug: "once-caldas",
    difficulty: "medium"
  },
  {
    question: "¿Cuál es el equipo con más títulos de la Liga BetPlay?",
    optionA: "América de Cali",
    optionB: "Millonarios",
    optionC: "Atlético Nacional",
    optionD: "Junior FC",
    correctAnswer: "C",
    category: "historia",
    difficulty: "medium"
  },
  {
    question: "¿Qué equipo fue el primer campeón del fútbol profesional colombiano en 1948?",
    optionA: "Millonarios",
    optionB: "Atlético Nacional",
    optionC: "Independiente Santa Fe",
    optionD: "América de Cali",
    correctAnswer: "C",
    category: "historia",
    teamSlug: "independiente-santa-fe",
    difficulty: "hard"
  },
  {
    question: "¿Qué equipo colombiano llegó a la final de la Copa Libertadores en 3 ocasiones consecutivas (1985, 1986, 1987)?",
    optionA: "Atlético Nacional",
    optionB: "Millonarios",
    optionC: "América de Cali",
    optionD: "Independiente Medellín",
    correctAnswer: "C",
    category: "historia",
    teamSlug: "america-de-cali",
    difficulty: "hard"
  },
  {
    question: "¿Cuántas Copas Libertadores ha ganado Atlético Nacional?",
    optionA: "1",
    optionB: "2",
    optionC: "3",
    optionD: "0",
    correctAnswer: "B",
    category: "historia",
    teamSlug: "atletico-nacional",
    difficulty: "medium"
  },
  // CORREGIDO: La Equidad fue reemplazado/rebrandeado como Internacional de Bogotá
  {
    question: "¿Qué club fue rebrandeado como Internacional de Bogotá para la temporada 2026?",
    optionA: "Alianza FC",
    optionB: "Internacional de Palmira",
    optionC: "La Equidad",
    optionD: "Patriotas FC",
    correctAnswer: "C",
    category: "historia",
    teamSlug: "internacional-de-bogota",
    difficulty: "medium"
  },
  // CORREGIDO: Eliminada referencia a "NewGen" (término no verificable)
  {
    question: "¿Qué animal aparece en el escudo de Internacional de Bogotá?",
    optionA: "Águila",
    optionB: "Cóndor andino",
    optionC: "Tigre",
    optionD: "Jaguar",
    correctAnswer: "B",
    category: "historia",
    teamSlug: "internacional-de-bogota",
    difficulty: "medium"
  },
  // CORREGIDO: Liga BetPlay tiene 20 equipos en 2026
  {
    question: "¿Cuántos equipos participan en la Liga BetPlay 2026?",
    optionA: "18",
    optionB: "20",
    optionC: "22",
    optionD: "16",
    correctAnswer: "B",
    category: "historia",
    difficulty: "easy"
  },
  {
    question: "¿Qué equipo fue anteriormente conocido como Cortuluá?",
    optionA: "Alianza FC",
    optionB: "Internacional de Palmira",
    optionC: "Jaguares de Córdoba",
    optionD: "Patriotas FC",
    correctAnswer: "B",
    category: "historia",
    teamSlug: "internacional-palmira",
    difficulty: "hard"
  },
  {
    question: "¿Qué equipo fue anteriormente conocido como Alianza Petrolera?",
    optionA: "Alianza FC",
    optionB: "Internacional de Palmira",
    optionC: "Fortaleza CEIF",
    optionD: "Jaguares de Córdoba",
    correctAnswer: "A",
    category: "historia",
    teamSlug: "alianza-fc",
    difficulty: "hard"
  },

  // === CLÁSICOS (VERIFICADOS) ===
  {
    question: "¿Cómo se llama el clásico entre Atlético Nacional e Independiente Medellín?",
    optionA: "Clásico Paisa",
    optionB: "Clásico Vallecaucano",
    optionC: "Clásico Bogotano",
    optionD: "Clásico Costeño",
    correctAnswer: "A",
    category: "clasicos",
    difficulty: "easy"
  },
  {
    question: "¿Cómo se llama el clásico entre Millonarios y Santa Fe?",
    optionA: "Clásico Paisa",
    optionB: "Clásico Vallecaucano",
    optionC: "Clásico Bogotano",
    optionD: "Clásico Costeño",
    correctAnswer: "C",
    category: "clasicos",
    difficulty: "easy"
  },
  {
    question: "¿Cómo se llama el clásico entre América de Cali y Deportivo Cali?",
    optionA: "Clásico Paisa",
    optionB: "Clásico Vallecaucano",
    optionC: "Clásico Bogotano",
    optionD: "Clásico Costeño",
    correctAnswer: "B",
    category: "clasicos",
    difficulty: "easy"
  },
  {
    question: "¿Qué dos equipos comparten el Estadio Atanasio Girardot?",
    optionA: "Millonarios y Santa Fe",
    optionB: "América y Deportivo Cali",
    optionC: "Atlético Nacional e Independiente Medellín",
    optionD: "Junior y Barranquilla FC",
    correctAnswer: "C",
    category: "clasicos",
    difficulty: "easy"
  },
  {
    question: "¿Qué dos equipos comparten el Estadio El Campín?",
    optionA: "Millonarios y Santa Fe",
    optionB: "América y Deportivo Cali",
    optionC: "Nacional y Medellín",
    optionD: "Fortaleza e Internacional de Bogotá",
    correctAnswer: "A",
    category: "clasicos",
    difficulty: "easy"
  },

  // === DEPARTAMENTOS ===
  {
    question: "¿En qué departamento queda el Deportivo Pasto?",
    optionA: "Cauca",
    optionB: "Nariño",
    optionC: "Putumayo",
    optionD: "Huila",
    correctAnswer: "B",
    category: "departamentos",
    teamSlug: "deportivo-pasto",
    difficulty: "easy"
  },
  {
    question: "¿En qué departamento queda Boyacá Chicó?",
    optionA: "Cundinamarca",
    optionB: "Santander",
    optionC: "Boyacá",
    optionD: "Antioquia",
    correctAnswer: "C",
    category: "departamentos",
    teamSlug: "boyaca-chico",
    difficulty: "easy"
  },
  {
    question: "¿En qué departamento queda el Atlético Bucaramanga?",
    optionA: "Norte de Santander",
    optionB: "Santander",
    optionC: "Boyacá",
    optionD: "Cesar",
    correctAnswer: "B",
    category: "departamentos",
    teamSlug: "atletico-bucaramanga",
    difficulty: "medium"
  },
  {
    question: "¿En qué departamento queda Deportes Tolima?",
    optionA: "Huila",
    optionB: "Tolima",
    optionC: "Cundinamarca",
    optionD: "Quindío",
    correctAnswer: "B",
    category: "departamentos",
    teamSlug: "deportes-tolima",
    difficulty: "easy"
  },
  {
    question: "¿En qué departamento queda Alianza FC?",
    optionA: "Magdalena",
    optionB: "Cesar",
    optionC: "La Guajira",
    optionD: "Atlántico",
    correctAnswer: "B",
    category: "departamentos",
    teamSlug: "alianza-fc",
    difficulty: "hard"
  },
  {
    question: "¿En qué departamento queda Águilas Doradas?",
    optionA: "Caldas",
    optionB: "Antioquia",
    optionC: "Risaralda",
    optionD: "Quindío",
    correctAnswer: "B",
    category: "departamentos",
    teamSlug: "aguilas-doradas",
    difficulty: "medium"
  },

  // === PREGUNTAS GENERALES (VERIFICADAS) ===
  {
    question: "¿Cuál es la máxima categoría del fútbol profesional colombiano?",
    optionA: "Categoría Primera B",
    optionB: "Categoría Primera A",
    optionC: "Copa Colombia",
    optionD: "Superliga",
    correctAnswer: "B",
    category: "general",
    difficulty: "easy"
  },
  {
    question: "¿Qué patrocinador da nombre a la liga colombiana actualmente?",
    optionA: "BetPlay",
    optionB: "Aguila",
    optionC: "Postobón",
    optionD: "Bavaria",
    correctAnswer: "A",
    category: "general",
    difficulty: "easy"
  },
  {
    question: "¿Cuántos torneos se disputan en una temporada de la Liga BetPlay?",
    optionA: "1",
    optionB: "2 (Apertura y Finalización)",
    optionC: "3",
    optionD: "4",
    correctAnswer: "B",
    category: "general",
    difficulty: "easy"
  },
  // CORREGIDO: 4 equipos de Bogotá en Liga BetPlay 2026 (La Equidad ya no existe como tal)
  {
    question: "¿Cuántos equipos de Bogotá participan en la Liga BetPlay 2026?",
    optionA: "2",
    optionB: "3",
    optionC: "4",
    optionD: "5",
    correctAnswer: "C",
    category: "general",
    difficulty: "hard"
  },

  // === NUEVAS PREGUNTAS VERIFICADAS ===
  {
    question: "¿Cuántos títulos de liga ha ganado Atlético Nacional?",
    optionA: "14",
    optionB: "16",
    optionC: "18",
    optionD: "20",
    correctAnswer: "C",
    category: "historia",
    teamSlug: "atletico-nacional",
    difficulty: "hard"
  },
  {
    question: "¿En qué año ganó Once Caldas la Copa Libertadores?",
    optionA: "2002",
    optionB: "2004",
    optionC: "2006",
    optionD: "2010",
    correctAnswer: "B",
    category: "historia",
    teamSlug: "once-caldas",
    difficulty: "medium"
  },
  {
    question: "¿Cuál es el estadio del Deportivo Pasto?",
    optionA: "Estadio Libertad",
    optionB: "Estadio Palogrande",
    optionC: "Estadio Manuel Murillo Toro",
    optionD: "Estadio La Independencia",
    correctAnswer: "A",
    category: "estadios",
    teamSlug: "deportivo-pasto",
    difficulty: "medium"
  },
  {
    question: "¿En qué departamento queda el Deportivo Pereira?",
    optionA: "Caldas",
    optionB: "Quindío",
    optionC: "Risaralda",
    optionD: "Tolima",
    correctAnswer: "C",
    category: "departamentos",
    teamSlug: "deportivo-pereira",
    difficulty: "medium"
  },
  {
    question: "¿Cuál es el estadio del Deportivo Pereira?",
    optionA: "Estadio Palogrande",
    optionB: "Estadio Hernán Ramírez Villegas",
    optionC: "Estadio Manuel Murillo Toro",
    optionD: "Estadio Libertad",
    correctAnswer: "B",
    category: "estadios",
    teamSlug: "deportivo-pereira",
    difficulty: "medium"
  },
  {
    question: "¿Qué equipo es conocido también como 'Los Escarlatas'?",
    optionA: "Independiente Santa Fe",
    optionB: "América de Cali",
    optionC: "Deportivo Pasto",
    optionD: "Atlético Bucaramanga",
    correctAnswer: "B",
    category: "apodos",
    teamSlug: "america-de-cali",
    difficulty: "hard"
  },
  {
    question: "¿Qué equipo es conocido también como 'Los Verdolagas'?",
    optionA: "Deportivo Cali",
    optionB: "Fortaleza CEIF",
    optionC: "Atlético Nacional",
    optionD: "La Equidad",
    correctAnswer: "C",
    category: "apodos",
    teamSlug: "atletico-nacional",
    difficulty: "medium"
  },
  {
    question: "¿Cuál es el estadio del Atlético Bucaramanga?",
    optionA: "Estadio Alfonso López",
    optionB: "Estadio Jaraguay",
    optionC: "Estadio La Independencia",
    optionD: "Estadio Alberto Grisales",
    correctAnswer: "A",
    category: "estadios",
    teamSlug: "atletico-bucaramanga",
    difficulty: "medium"
  },
  {
    question: "¿Cuál es el estadio de Boyacá Chicó?",
    optionA: "Estadio La Independencia",
    optionB: "Estadio Palogrande",
    optionC: "Estadio Alfonso López",
    optionD: "Estadio Jaraguay",
    correctAnswer: "A",
    category: "estadios",
    teamSlug: "boyaca-chico",
    difficulty: "medium"
  },
  {
    question: "¿Cuál es el estadio de Jaguares de Córdoba?",
    optionA: "Estadio Jaraguay",
    optionB: "Estadio Armando Maestre Pavajeau",
    optionC: "Estadio Alberto Grisales",
    optionD: "Estadio La Independencia",
    correctAnswer: "A",
    category: "estadios",
    teamSlug: "jaguares-de-cordoba",
    difficulty: "medium"
  },
  {
    question: "¿Cuál es el estadio de Águilas Doradas en Rionegro?",
    optionA: "Estadio Alberto Grisales",
    optionB: "Estadio Atanasio Girardot",
    optionC: "Estadio Polideportivo Sur",
    optionD: "Estadio Palogrande",
    correctAnswer: "A",
    category: "estadios",
    teamSlug: "aguilas-doradas",
    difficulty: "hard"
  },
  {
    question: "¿Qué equipos de la Liga BetPlay comparten el Estadio Metropolitano de Techo?",
    optionA: "Millonarios y Santa Fe",
    optionB: "América y Deportivo Cali",
    optionC: "Fortaleza CEIF e Internacional de Bogotá",
    optionD: "Nacional y Medellín",
    correctAnswer: "C",
    category: "estadios",
    difficulty: "hard"
  },
  {
    question: "¿Cuál es el estadio de Alianza FC en Valledupar?",
    optionA: "Estadio Armando Maestre Pavajeau",
    optionB: "Estadio Jaraguay",
    optionC: "Estadio Metropolitano Roberto Meléndez",
    optionD: "Estadio Alfonso López",
    correctAnswer: "A",
    category: "estadios",
    teamSlug: "alianza-fc",
    difficulty: "hard"
  },
  {
    question: "¿En qué año ganó Atlético Nacional su primera Copa Libertadores?",
    optionA: "1989",
    optionB: "1994",
    optionC: "1999",
    optionD: "1979",
    correctAnswer: "A",
    category: "historia",
    teamSlug: "atletico-nacional",
    difficulty: "hard"
  },
  {
    question: "¿Qué equipo ascendió a la Liga BetPlay para la temporada 2026 desde la Primera B?",
    optionA: "Cúcuta Deportivo",
    optionB: "Patriotas FC",
    optionC: "Envigado FC",
    optionD: "Unión Magdalena",
    correctAnswer: "A",
    category: "historia",
    difficulty: "medium"
  },
]
