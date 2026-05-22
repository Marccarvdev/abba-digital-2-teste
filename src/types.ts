export interface LetterCubeData {
  id: string;
  primaryLetter: string;
  primaryOrdinal: string;
  isSplit?: boolean;
  secondaryLetter?: string;
  secondaryOrdinal?: string;
}

export interface SpelledLetter {
  id: string; // Unique transient ID for instances on the board
  letter: string; // The specific letter (e.g. 'C' or 'Ç' or 'V' or 'W')
  originCubeId: string;
  originalOrdinal?: string; // Optional permanent original ordinal from source cube
  color?: string; // Stored color of wire and letter (specific instance)
}

export interface SavedWord {
  word: string;
  letters: SpelledLetter[];
  themeColor?: string;
}

export interface PresetWord {
  word: string; // In uppercase, e.g., "DADO"
  hint: string; // Small explanation/hint
  category: string; // e.g., "Animais", "Objetos", "Natureza"
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  iconType: 'dice' | 'car' | 'star' | 'sun' | 'cat' | 'book' | 'fruit' | 'crown';
}
