
/**
 * Converte o nome do animal para o formato de arquivo de imagem.
 * Exemplo: "La Secret Combinasion" -> "la_secret_combinasion.png"
 * Exemplo com acento: "Dragão" -> "dragao.png"
 */
export const getAnimalImagePath = (name: string): string => {
  if (!name) return "";

  const fileName = name
    .normalize("NFD") // Decompõe caracteres com acentos (ex: ã -> a + ~)
    .replace(/[\u0300-\u036f]/g, "") // Remove os acentos resultantes
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_') // substitui espaços por underscores
    .replace(/[^\w-]/g, ''); // remove caracteres especiais remanescentes
    
  // Usamos caminho relativo 'images/' em vez de '/images/' para evitar problemas de rota raiz
  return `images/${fileName}.png`;
};

export const DEFAULT_ANIMAL_ICON = "🐾";
