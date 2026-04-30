// Banco de preguntas relámpago sobre la Liga BetPlay de Colombia
// Preguntas más cortas y directas para velocidad
// ÚLTIMA VERIFICACIÓN: 30 de abril de 2026
// Todas las respuestas han sido verificadas con fuentes oficiales

export interface LightningQuestionData {
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: 'A' | 'B' | 'C' | 'D'
  category: string
  teamSlug?: string
}

export const lightningQuestions: LightningQuestionData[] = [
  // === CIUDADES ===
  { question: "Ciudad de Atlético Nacional", optionA: "Cali", optionB: "Medellín", optionC: "Bogotá", optionD: "Barranquilla", correctAnswer: "B", category: "ciudades", teamSlug: "atletico-nacional" },
  { question: "Ciudad de Millonarios", optionA: "Medellín", optionB: "Cali", optionC: "Bogotá", optionD: "Tunja", correctAnswer: "C", category: "ciudades", teamSlug: "millonarios" },
  { question: "Ciudad de Junior FC", optionA: "Cartagena", optionB: "Santa Marta", optionC: "Montería", optionD: "Barranquilla", correctAnswer: "D", category: "ciudades", teamSlug: "junior-fc" },
  { question: "Ciudad de América de Cali", optionA: "Medellín", optionB: "Bogotá", optionC: "Cali", optionD: "Pereira", correctAnswer: "C", category: "ciudades", teamSlug: "america-de-cali" },
  { question: "Ciudad de Deportivo Cali", optionA: "Palmira", optionB: "Cali", optionC: "Bogotá", optionD: "Medellín", correctAnswer: "B", category: "ciudades", teamSlug: "deportivo-cali" },
  { question: "Ciudad de Once Caldas", optionA: "Pereira", optionB: "Ibagué", optionC: "Manizales", optionD: "Bucaramanga", correctAnswer: "C", category: "ciudades", teamSlug: "once-caldas" },
  { question: "Ciudad de Santa Fe", optionA: "Bogotá", optionB: "Medellín", optionC: "Cali", optionD: "Tunja", correctAnswer: "A", category: "ciudades", teamSlug: "independiente-santa-fe" },
  { question: "Ciudad de Deportes Tolima", optionA: "Manizales", optionB: "Ibagué", optionC: "Pereira", optionD: "Neiva", correctAnswer: "B", category: "ciudades", teamSlug: "deportes-tolima" },
  { question: "Ciudad de Deportivo Pasto", optionA: "Popayán", optionB: "Tumaco", optionC: "Pasto", optionD: "Ipiales", correctAnswer: "C", category: "ciudades", teamSlug: "deportivo-pasto" },
  { question: "Ciudad de Deportivo Pereira", optionA: "Manizales", optionB: "Armenia", optionC: "Ibagué", optionD: "Pereira", correctAnswer: "D", category: "ciudades", teamSlug: "deportivo-pereira" },
  { question: "Ciudad de Bucaramanga", optionA: "Cúcuta", optionB: "Floridablanca", optionC: "Bucaramanga", optionD: "Piedecuesta", correctAnswer: "C", category: "ciudades", teamSlug: "atletico-bucaramanga" },
  { question: "Ciudad de Jaguares de Córdoba", optionA: "Sincelejo", optionB: "Montería", optionC: "Lorica", optionD: "Cereté", correctAnswer: "B", category: "ciudades", teamSlug: "jaguares-de-cordoba" },
  { question: "Ciudad de Boyacá Chicó", optionA: "Duitama", optionB: "Sogamoso", optionC: "Tunja", optionD: "Chiquinquirá", correctAnswer: "C", category: "ciudades", teamSlug: "boyaca-chico" },
  { question: "Ciudad de Águilas Doradas", optionA: "Medellín", optionB: "Rionegro", optionC: "Envigado", optionD: "Bello", correctAnswer: "B", category: "ciudades", teamSlug: "aguilas-doradas" },
  { question: "Ciudad de Alianza FC", optionA: "Valledupar", optionB: "Santa Marta", optionC: "Riohacha", optionD: "Barranquilla", correctAnswer: "A", category: "ciudades", teamSlug: "alianza-fc" },
  { question: "Ciudad de Cúcuta Deportivo", optionA: "Ocaña", optionB: "Bucaramanga", optionC: "Cúcuta", optionD: "Pamplona", correctAnswer: "C", category: "ciudades", teamSlug: "cucuta-deportivo" },

  // === ESTADIOS ===
  { question: "Estadio de Millonarios", optionA: "El Campín", optionB: "Atanasio Girardot", optionC: "Pascual Guerrero", optionD: "Palogrande", correctAnswer: "A", category: "estadios", teamSlug: "millonarios" },
  { question: "Estadio de Atlético Nacional", optionA: "Palogrande", optionB: "Atanasio Girardot", optionC: "El Campín", optionD: "Polideportivo Sur", correctAnswer: "B", category: "estadios", teamSlug: "atletico-nacional" },
  { question: "Estadio de Junior FC", optionA: "El Campín", optionB: "Pascual Guerrero", optionC: "Metropolitano", optionD: "Alfonso López", correctAnswer: "C", category: "estadios", teamSlug: "junior-fc" },
  { question: "Estadio de América de Cali", optionA: "Deportivo Cali", optionB: "Pascual Guerrero", optionC: "Hernán Ramírez", optionD: "Libertad", correctAnswer: "B", category: "estadios", teamSlug: "america-de-cali" },
  { question: "Estadio de Once Caldas", optionA: "Hernán Ramírez", optionB: "Palogrande", optionC: "Manuel Murillo Toro", optionD: "La Independencia", correctAnswer: "B", category: "estadios", teamSlug: "once-caldas" },
  { question: "Estadio de Deportivo Cali", optionA: "Pascual Guerrero", optionB: "Deportivo Cali", optionC: "Hernán Ramírez", optionD: "Palogrande", correctAnswer: "B", category: "estadios", teamSlug: "deportivo-cali" },
  { question: "Estadio de Deportes Tolima", optionA: "Manuel Murillo Toro", optionB: "La Independencia", optionC: "Jaraguay", optionD: "Alberto Grisales", correctAnswer: "A", category: "estadios", teamSlug: "deportes-tolima" },
  { question: "Estadio de Deportivo Pasto", optionA: "La Independencia", optionB: "Libertad", optionC: "Palogrande", optionD: "Alberto Grisales", correctAnswer: "B", category: "estadios", teamSlug: "deportivo-pasto" },
  { question: "Estadio de Deportivo Pereira", optionA: "Palogrande", optionB: "Hernán Ramírez Villegas", optionC: "Manuel Murillo Toro", optionD: "Libertad", correctAnswer: "B", category: "estadios", teamSlug: "deportivo-pereira" },
  { question: "Estadio de Bucaramanga", optionA: "Jaraguay", optionB: "La Independencia", optionC: "Alfonso López", optionD: "Alberto Grisales", correctAnswer: "C", category: "estadios", teamSlug: "atletico-bucaramanga" },
  { question: "Estadio de Boyacá Chicó", optionA: "La Independencia", optionB: "Palogrande", optionC: "Alfonso López", optionD: "Jaraguay", correctAnswer: "A", category: "estadios", teamSlug: "boyaca-chico" },
  { question: "Estadio de Jaguares", optionA: "Jaraguay", optionB: "Armando Maestre", optionC: "Alberto Grisales", optionD: "La Independencia", correctAnswer: "A", category: "estadios", teamSlug: "jaguares-de-cordoba" },
  { question: "Único estadio propiedad de un club", optionA: "El Campín", optionB: "Atanasio Girardot", optionC: "Deportivo Cali", optionD: "Palogrande", correctAnswer: "C", category: "estadios", teamSlug: "deportivo-cali" },
  { question: "Estadio de Fortaleza CEIF", optionA: "El Campín", optionB: "Metropolitano de Techo", optionC: "Alfonso López", optionD: "Palogrande", correctAnswer: "B", category: "estadios", teamSlug: "fortaleza-ceif" },
  { question: "Estadio de Águilas Doradas", optionA: "Alberto Grisales", optionB: "Atanasio Girardot", optionC: "Polideportivo Sur", optionD: "Palogrande", correctAnswer: "A", category: "estadios", teamSlug: "aguilas-doradas" },

  // === APODOS ===
  { question: "Apodo de Atlético Nacional", optionA: "Los Embajadores", optionB: "El Rey de Copas", optionC: "Los Diablos Rojos", optionD: "El Poderoso", correctAnswer: "B", category: "apodos", teamSlug: "atletico-nacional" },
  { question: "Apodo de América de Cali", optionA: "Los Cardenales", optionB: "Los Tiburones", optionC: "Los Diablos Rojos", optionD: "Los Azucareros", correctAnswer: "C", category: "apodos", teamSlug: "america-de-cali" },
  { question: "Apodo de Millonarios", optionA: "Los Embajadores", optionB: "El Rey de Copas", optionC: "Los Leopardos", optionD: "Los Matecaña", correctAnswer: "A", category: "apodos", teamSlug: "millonarios" },
  { question: "Apodo de Independiente Medellín", optionA: "Los Diablos Rojos", optionB: "El Rey de Copas", optionC: "El Poderoso", optionD: "Los Cardenales", correctAnswer: "C", category: "apodos", teamSlug: "independiente-medellin" },
  { question: "Apodo de Santa Fe", optionA: "Los Embajadores", optionB: "Los Tiburones", optionC: "Los Diablos Rojos", optionD: "Los Cardenales", correctAnswer: "D", category: "apodos", teamSlug: "independiente-santa-fe" },
  { question: "Apodo de Junior FC", optionA: "Los Cardenales", optionB: "Los Tiburones", optionC: "Los Leopardos", optionD: "Los Volcánicos", correctAnswer: "B", category: "apodos", teamSlug: "junior-fc" },
  { question: "Apodo de Deportivo Cali", optionA: "Los Azucareros", optionB: "Los Matecaña", optionC: "Los Volcánicos", optionD: "Los Ajedrezados", correctAnswer: "A", category: "apodos", teamSlug: "deportivo-cali" },
  { question: "Apodo de Bucaramanga", optionA: "Los Jaguares", optionB: "Los Leopardos", optionC: "Los Ajedrezados", optionD: "Los Volcánicos", correctAnswer: "B", category: "apodos", teamSlug: "atletico-bucaramanga" },
  { question: "Apodo de Boyacá Chicó", optionA: "Los Leopardos", optionB: "Los Ajedrezados", optionC: "Los Volcánicos", optionD: "Los Matecaña", correctAnswer: "B", category: "apodos", teamSlug: "boyaca-chico" },
  { question: "Apodo de Deportivo Pasto", optionA: "Los Volcanes", optionB: "Los Volcánicos", optionC: "Los Jaguares", optionD: "Los Aseguradores", correctAnswer: "B", category: "apodos", teamSlug: "deportivo-pasto" },
  { question: "Apodo de Deportivo Pereira", optionA: "Los Volcánicos", optionB: "Los Matecaña", optionC: "Los Leopardos", optionD: "Los Ajedrezados", correctAnswer: "B", category: "apodos", teamSlug: "deportivo-pereira" },
  { question: "Apodo de La Equidad / Intl. Bogotá", optionA: "Los Aseguradores", optionB: "Los Azucareros", optionC: "Los Cardenales", optionD: "Los Embajadores", correctAnswer: "A", category: "apodos", teamSlug: "internacional-de-bogota" },
  { question: "¿Quién es 'El Ballet Azul'?", optionA: "Santa Fe", optionB: "Nacional", optionC: "Millonarios", optionD: "Junior", correctAnswer: "C", category: "apodos", teamSlug: "millonarios" },
  { question: "¿Quiénes son 'Los Verdolagas'?", optionA: "Deportivo Cali", optionB: "Fortaleza CEIF", optionC: "Atlético Nacional", optionD: "La Equidad", correctAnswer: "C", category: "apodos", teamSlug: "atletico-nacional" },
  { question: "¿Quiénes son 'Los Escarlatas'?", optionA: "Santa Fe", optionB: "América de Cali", optionC: "Deportivo Pasto", optionD: "Bucaramanga", correctAnswer: "B", category: "apodos", teamSlug: "america-de-cali" },

  // === COLORES ===
  { question: "Colores de Atlético Nacional", optionA: "Rojo y blanco", optionB: "Verde y blanco", optionC: "Azul y blanco", optionD: "Amarillo y rojo", correctAnswer: "B", category: "colores", teamSlug: "atletico-nacional" },
  { question: "Colores de Millonarios", optionA: "Rojo y blanco", optionB: "Verde y blanco", optionC: "Azul y blanco", optionD: "Amarillo y negro", correctAnswer: "C", category: "colores", teamSlug: "millonarios" },
  { question: "Colores de América de Cali", optionA: "Rojo y blanco", optionB: "Verde y blanco", optionC: "Azul y blanco", optionD: "Amarillo y negro", correctAnswer: "A", category: "colores", teamSlug: "america-de-cali" },
  { question: "Colores de Junior FC", optionA: "Verde y blanco", optionB: "Azul y blanco", optionC: "Rojo y blanco", optionD: "Amarillo y rojo", correctAnswer: "C", category: "colores", teamSlug: "junior-fc" },
  { question: "Colores de Santa Fe", optionA: "Rojo y blanco", optionB: "Azul y blanco", optionC: "Verde y blanco", optionD: "Naranja y negro", correctAnswer: "A", category: "colores", teamSlug: "independiente-santa-fe" },
  { question: "Colores de Deportes Tolima", optionA: "Rojo y blanco", optionB: "Amarillo y rojo", optionC: "Vinotinto y oro", optionD: "Verde y blanco", correctAnswer: "C", category: "colores", teamSlug: "deportes-tolima" },
  { question: "Colores de Deportivo Cali", optionA: "Verde y blanco", optionB: "Rojo y blanco", optionC: "Azul y blanco", optionD: "Amarillo y negro", correctAnswer: "A", category: "colores", teamSlug: "deportivo-cali" },

  // === FUNDACIÓN ===
  { question: "Año de fundación de Deportivo Cali", optionA: "1912", optionB: "1927", optionC: "1947", optionD: "1913", correctAnswer: "A", category: "fundacion", teamSlug: "deportivo-cali" },
  { question: "Año de fundación de América de Cali", optionA: "1927", optionB: "1947", optionC: "1913", optionD: "1924", correctAnswer: "A", category: "fundacion", teamSlug: "america-de-cali" },
  { question: "Año de fundación de Atlético Nacional", optionA: "1947", optionB: "1946", optionC: "1913", optionD: "1949", correctAnswer: "A", category: "fundacion", teamSlug: "atletico-nacional" },
  { question: "Año de fundación de Junior FC", optionA: "1924", optionB: "1927", optionC: "1946", optionD: "1913", correctAnswer: "A", category: "fundacion", teamSlug: "junior-fc" },
  { question: "Equipo más antiguo de la Liga", optionA: "Nacional (1947)", optionB: "Medellín (1913)", optionC: "Deportivo Cali (1912)", optionD: "Junior (1924)", correctAnswer: "C", category: "fundacion" },
  { question: "Año de fundación de Once Caldas", optionA: "1949", optionB: "1959", optionC: "1961", optionD: "1954", correctAnswer: "C", category: "fundacion", teamSlug: "once-caldas" },
  { question: "Año de fundación de La Equidad", optionA: "1947", optionB: "1982", optionC: "2000", optionD: "1975", correctAnswer: "B", category: "fundacion", teamSlug: "internacional-de-bogota" },
  { question: "Año de fundación de Fortaleza CEIF", optionA: "2000", optionB: "2010", optionC: "2015", optionD: "2005", correctAnswer: "B", category: "fundacion", teamSlug: "fortaleza-ceif" },
  { question: "Año de fundación de Jaguares de Córdoba", optionA: "2014", optionB: "2010", optionC: "2012", optionD: "2016", correctAnswer: "C", category: "fundacion", teamSlug: "jaguares-de-cordoba" },
  { question: "Año de fundación de Patriotas FC", optionA: "2013", optionB: "2003", optionC: "2008", optionD: "1998", correctAnswer: "B", category: "fundacion", teamSlug: "patriotas" },

  // === CLÁSICOS ===
  { question: "Clásico Nacional vs Medellín", optionA: "Paisa", optionB: "Vallecaucano", optionC: "Bogotano", optionD: "Costeño", correctAnswer: "A", category: "clasicos" },
  { question: "Clásico Millonarios vs Santa Fe", optionA: "Paisa", optionB: "Vallecaucano", optionC: "Bogotano", optionD: "Costeño", correctAnswer: "C", category: "clasicos" },
  { question: "Clásico América vs Deportivo Cali", optionA: "Paisa", optionB: "Vallecaucano", optionC: "Bogotano", optionD: "Costeño", correctAnswer: "B", category: "clasicos" },
  { question: "Comparten Atanasio Girardot", optionA: "Millonarios y Santa Fe", optionB: "América y Cali", optionC: "Nacional y Medellín", optionD: "Junior y Barranquilla", correctAnswer: "C", category: "clasicos" },
  { question: "Comparten El Campín", optionA: "Millonarios y Santa Fe", optionB: "América y Cali", optionC: "Nacional y Medellín", optionD: "Fortaleza e Intl. Bogotá", correctAnswer: "A", category: "clasicos" },

  // === HISTORIA ===
  { question: "Ganador Copa Libertadores 2004", optionA: "Nacional", optionB: "Millonarios", optionC: "Once Caldas", optionD: "América", correctAnswer: "C", category: "historia", teamSlug: "once-caldas" },
  { question: "Equipo con más títulos de liga", optionA: "América", optionB: "Millonarios", optionC: "Nacional", optionD: "Junior", correctAnswer: "C", category: "historia", teamSlug: "atletico-nacional" },
  { question: "Primer campeón del fútbol colombiano (1948)", optionA: "Millonarios", optionB: "Nacional", optionC: "Santa Fe", optionD: "América", correctAnswer: "C", category: "historia", teamSlug: "independiente-santa-fe" },
  { question: "Copas Libertadores de Nacional", optionA: "1", optionB: "2", optionC: "3", optionD: "0", correctAnswer: "B", category: "historia", teamSlug: "atletico-nacional" },
  { question: "Finalista Libertadores 3 veces seguidas (85-87)", optionA: "Nacional", optionB: "Millonarios", optionC: "América", optionD: "Medellín", correctAnswer: "C", category: "historia", teamSlug: "america-de-cali" },
  { question: "Primera Libertadores de Nacional", optionA: "1989", optionB: "1994", optionC: "1999", optionD: "1979", correctAnswer: "A", category: "historia", teamSlug: "atletico-nacional" },
  { question: "Títulos de liga de Nacional", optionA: "14", optionB: "16", optionC: "18", optionD: "20", correctAnswer: "C", category: "historia", teamSlug: "atletico-nacional" },
  { question: "Equipo antes llamado Cortuluá", optionA: "Alianza FC", optionB: "Intl. de Palmira", optionC: "Jaguares", optionD: "Patriotas", correctAnswer: "B", category: "historia", teamSlug: "internacional-palmira" },
  { question: "Equipo antes llamado Alianza Petrolera", optionA: "Alianza FC", optionB: "Intl. de Palmira", optionC: "Fortaleza CEIF", optionD: "Jaguares", correctAnswer: "A", category: "historia", teamSlug: "alianza-fc" },
  { question: "Ascendió a Liga 2026", optionA: "Cúcuta Deportivo", optionB: "Patriotas", optionC: "Envigado", optionD: "Unión Magdalena", correctAnswer: "A", category: "historia" },
  { question: "Equipos en Liga BetPlay 2026", optionA: "18", optionB: "20", optionC: "22", optionD: "16", correctAnswer: "B", category: "historia" },
  { question: "Equipos de Bogotá en Liga 2026", optionA: "2", optionB: "3", optionC: "4", optionD: "5", correctAnswer: "C", category: "historia" },

  // === DEPARTAMENTOS ===
  { question: "Departamento de Deportivo Pasto", optionA: "Cauca", optionB: "Nariño", optionC: "Putumayo", optionD: "Huila", correctAnswer: "B", category: "departamentos", teamSlug: "deportivo-pasto" },
  { question: "Departamento de Boyacá Chicó", optionA: "Cundinamarca", optionB: "Santander", optionC: "Boyacá", optionD: "Antioquia", correctAnswer: "C", category: "departamentos", teamSlug: "boyaca-chico" },
  { question: "Departamento de Bucaramanga", optionA: "Norte de Santander", optionB: "Santander", optionC: "Boyacá", optionD: "Cesar", correctAnswer: "B", category: "departamentos", teamSlug: "atletico-bucaramanga" },
  { question: "Departamento de Deportes Tolima", optionA: "Huila", optionB: "Tolima", optionC: "Cundinamarca", optionD: "Quindío", correctAnswer: "B", category: "departamentos", teamSlug: "deportes-tolima" },
  { question: "Departamento de Deportivo Pereira", optionA: "Caldas", optionB: "Quindío", optionC: "Risaralda", optionD: "Tolima", correctAnswer: "C", category: "departamentos", teamSlug: "deportivo-pereira" },
  { question: "Departamento de Alianza FC", optionA: "Magdalena", optionB: "Cesar", optionC: "La Guajira", optionD: "Atlántico", correctAnswer: "B", category: "departamentos", teamSlug: "alianza-fc" },
  { question: "Departamento de Águilas Doradas", optionA: "Caldas", optionB: "Antioquia", optionC: "Risaralda", optionD: "Quindío", correctAnswer: "B", category: "departamentos", teamSlug: "aguilas-doradas" },

  // === GENERAL ===
  { question: "Máxima categoría del fútbol colombiano", optionA: "Primera B", optionB: "Primera A", optionC: "Copa Colombia", optionD: "Superliga", correctAnswer: "B", category: "general" },
  { question: "Patrocinador del nombre de la liga", optionA: "BetPlay", optionB: "Águila", optionC: "Postobón", optionD: "Bavaria", correctAnswer: "A", category: "general" },
  { question: "Torneos por temporada en Liga", optionA: "1", optionB: "2 (Apertura y Finalización)", optionC: "3", optionD: "4", correctAnswer: "B", category: "general" },
  { question: "Comparten Metropolitano de Techo", optionA: "Millonarios y Santa Fe", optionB: "América y Cali", optionC: "Fortaleza e Intl. Bogotá", optionD: "Nacional y Medellín", correctAnswer: "C", category: "general" },
  { question: "Estadio Alfonso López es de", optionA: "Cúcuta", optionB: "Bucaramanga", optionC: "Valledupar", optionD: "Montería", correctAnswer: "B", category: "general", teamSlug: "atletico-bucaramanga" },
  { question: "Estadio Armando Maestre es de", optionA: "Cúcuta", optionB: "Bucaramanga", optionC: "Valledupar", optionD: "Montería", correctAnswer: "C", category: "general", teamSlug: "alianza-fc" },
  { question: "Internacional de Bogotá antes era", optionA: "Alianza FC", optionB: "Intl. de Palmira", optionC: "La Equidad", optionD: "Patriotas", correctAnswer: "C", category: "general", teamSlug: "internacional-de-bogota" },
  { question: "Colores de Intl. de Bogotá", optionA: "Rojo y azul", optionB: "Blanco, negro y dorado", optionC: "Verde y blanco", optionD: "Naranja y negro", correctAnswer: "B", category: "colores", teamSlug: "internacional-de-bogota" },
]
