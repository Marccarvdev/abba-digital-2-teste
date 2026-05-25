import { LetterCubeData, PresetWord } from './types';

export const ALPHABET_CUBES: LetterCubeData[] = [
  { id: 'cube-a', primaryLetter: 'A', primaryOrdinal: '1°' },
  { id: 'cube-b', primaryLetter: 'B', primaryOrdinal: '2°' },
  {
    id: 'cube-c-composite',
    primaryLetter: 'C',
    primaryOrdinal: '3°',
    isSplit: true,
    secondaryLetter: 'Ç',
    secondaryOrdinal: undefined
  },
  { id: 'cube-d', primaryLetter: 'D', primaryOrdinal: '4°' },
  { id: 'cube-e', primaryLetter: 'E', primaryOrdinal: '5°' },
  
  { id: 'cube-f', primaryLetter: 'F', primaryOrdinal: '6°' },
  { id: 'cube-g', primaryLetter: 'G', primaryOrdinal: '7°' },
  { id: 'cube-h', primaryLetter: 'H', primaryOrdinal: '8°' },
  { id: 'cube-i', primaryLetter: 'I', primaryOrdinal: '9°' },
  { id: 'cube-j', primaryLetter: 'J', primaryOrdinal: '10°' },
  
  { id: 'cube-k', primaryLetter: 'K', primaryOrdinal: '11°' },
  { id: 'cube-l', primaryLetter: 'L', primaryOrdinal: '12°' },
  { id: 'cube-m', primaryLetter: 'M', primaryOrdinal: '13°' },
  { id: 'cube-n', primaryLetter: 'N', primaryOrdinal: '14°' },
  { id: 'cube-o', primaryLetter: 'O', primaryOrdinal: '15°' },
  
  { id: 'cube-p', primaryLetter: 'P', primaryOrdinal: '16°' },
  { id: 'cube-q', primaryLetter: 'Q', primaryOrdinal: '17°' },
  { id: 'cube-r', primaryLetter: 'R', primaryOrdinal: '18°' },
  { id: 'cube-s', primaryLetter: 'S', primaryOrdinal: '19°' },
  { id: 'cube-t', primaryLetter: 'T', primaryOrdinal: '20°' },
  
  { id: 'cube-u', primaryLetter: 'U', primaryOrdinal: '21°' },
  {
    id: 'cube-v-composite',
    primaryLetter: 'V',
    primaryOrdinal: '22°',
    isSplit: true,
    secondaryLetter: 'W',
    secondaryOrdinal: '23°'
  },
  { id: 'cube-x', primaryLetter: 'X', primaryOrdinal: '24°' },
  { id: 'cube-y', primaryLetter: 'Y', primaryOrdinal: '25°' },
  { id: 'cube-z', primaryLetter: 'Z', primaryOrdinal: '26°' }
];

export const PRESET_WORDS: PresetWord[] = [
  {
    word: "DADO",
    hint: "Objeto cúbico com seis lados e pontos marcado de 1 a 6.",
    category: "Brinquedos",
    difficulty: "Fácil",
    iconType: "dice"
  },
  {
    word: "CASA",
    hint: "Lugar onde moramos e nos protegemos.",
    category: "Lugares",
    difficulty: "Fácil",
    iconType: "car"
  },
  {
    word: "GATO",
    hint: "Animal de estimação que faz 'miau' e gosta de carinho.",
    category: "Animais",
    difficulty: "Fácil",
    iconType: "cat"
  },
  {
    word: "SOL",
    hint: "A estrela brilhante que ilumina o nosso dia.",
    category: "Natureza",
    difficulty: "Fácil",
    iconType: "sun"
  },
  {
    word: "LIVRO",
    hint: "Contém páginas com histórias para ler e estudar.",
    category: "Escola",
    difficulty: "Médio",
    iconType: "book"
  },
  {
    word: "MAÇÃ",
    hint: "Uma fruta deliciosa, que pode ser vermelha ou verde.",
    category: "Alimentos",
    difficulty: "Médio",
    iconType: "fruit"
  },
  {
    word: "COROA",
    hint: "Acessório brilhante usado na cabeça por reis e rainhas.",
    category: "Objetos",
    difficulty: "Médio",
    iconType: "crown"
  },
  {
    word: "ESTRELA",
    hint: "Pontos brilhantes visíveis no céu durante a noite.",
    category: "Natureza",
    difficulty: "Difícil",
    iconType: "star"
  }
];
