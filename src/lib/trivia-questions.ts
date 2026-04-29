// Banco de preguntas de trivia sobre la Liga BetPlay de Colombia
// Cada pregunta tiene 4 opciones y una respuesta correcta

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
    question: "¿Qué equipo juega en el Estadio Palogrande?",
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
  {
    question: "¿Qué equipo de la Liga BetPlay juega en el Estadio Metropolitano de Techo?",
    optionA: "Millonarios",
    optionB: "Independiente Santa Fe",
    optionC: "Fortaleza CEIF",
    optionD: "Internacional de Bogotá",
    correctAnswer: "D",
    category: "estadios",
    teamSlug: "internacional-de-bogota",
    difficulty: "medium"
  },

  // === FUNDACIÓN ===
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
  {
    question: "¿Cuál es el equipo más reciente en la Liga BetPlay?",
    optionA: "Alianza FC (2024)",
    optionB: "Internacional de Bogotá (2025)",
    optionC: "Internacional de Palmira (2024)",
    optionD: "Patriotas FC (2013)",
    correctAnswer: "B",
    category: "fundacion",
    teamSlug: "internacional-de-bogota",
    difficulty: "medium"
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

  // === APODOS ===
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
    optionD: "Los Volcanes",
    correctAnswer: "B",
    category: "apodos",
    teamSlug: "junior-fc",
    difficulty: "easy"
  },
  {
    question: "¿Cuál es el apodo del Deportivo Cali?",
    optionA: "Los Azucareros",
    optionB: "Los Matecaña",
    optionC: "Los Volcanes",
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
    optionD: "Los Volcanes",
    correctAnswer: "B",
    category: "apodos",
    teamSlug: "atletico-bucaramanga",
    difficulty: "medium"
  },
  {
    question: "¿Cuál es el apodo de Boyacá Chicó?",
    optionA: "Los Leopardos",
    optionB: "Los Ajedrezados",
    optionC: "Los Volcanes",
    optionD: "Los Matecaña",
    correctAnswer: "B",
    category: "apodos",
    teamSlug: "boyaca-chico",
    difficulty: "medium"
  },
  {
    question: "¿Cuál es el apodo del Deportivo Pasto?",
    optionA: "Los Volcanes",
    optionB: "Los Matecaña",
    optionC: "Los Jaguares",
    optionD: "Los Aseguradores",
    correctAnswer: "A",
    category: "apodos",
    teamSlug: "deportivo-pasto",
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
  {
    question: "¿De qué ciudad es Envigado FC?",
    optionA: "Medellín",
    optionB: "Envigado",
    optionC: "Bello",
    optionD: "Itagüí",
    correctAnswer: "B",
    category: "ciudades",
    teamSlug: "envigado",
    difficulty: "medium"
  },

  // === HISTORIA Y LOGROS ===
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
    question: "¿Qué equipo fue el primer campeón del fútbol profesional colombiano?",
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
    question: "¿Qué equipo es conocido como 'El Ballet Azul'?",
    optionA: "Deportivo Cali",
    optionB: "Atlético Nacional",
    optionC: "Independiente Medellín",
    optionD: "Millonarios",
    correctAnswer: "D",
    category: "historia",
    teamSlug: "millonarios",
    difficulty: "medium"
  },
  {
    question: "¿Qué equipo reemplazó a La Equidad en la Liga BetPlay 2026?",
    optionA: "Alianza FC",
    optionB: "Internacional de Palmira",
    optionC: "Internacional de Bogotá",
    optionD: "Patriotas FC",
    correctAnswer: "C",
    category: "historia",
    teamSlug: "internacional-de-bogota",
    difficulty: "medium"
  },
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
  {
    question: "¿Cuántos equipos participan actualmente en la Liga BetPlay?",
    optionA: "18",
    optionB: "20",
    optionC: "22",
    optionD: "16",
    correctAnswer: "C",
    category: "historia",
    difficulty: "easy"
  },

  // === CLÁSICOS ===
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
    optionD: "Junior y Junior FC",
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

  // === PREGUNTAS GENERALES ===
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
  {
    question: "¿Cuál es el apodo de Deportivo Pereira?",
    optionA: "Los Volcanes",
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
    optionA: "Los Volcanes",
    optionB: "El Vinotinto y Oro",
    optionC: "Los Aseguradores",
    optionD: "Los Jaguares",
    correctAnswer: "B",
    category: "apodos",
    teamSlug: "deportes-tolima",
    difficulty: "medium"
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
    question: "¿Qué equipo es conocido como el primer club 'NewGen' de Colombia?",
    optionA: "Alianza FC",
    optionB: "Internacional de Palmira",
    optionC: "Internacional de Bogotá",
    optionD: "Fortaleza CEIF",
    correctAnswer: "C",
    category: "historia",
    teamSlug: "internacional-de-bogota",
    difficulty: "medium"
  },
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
]
