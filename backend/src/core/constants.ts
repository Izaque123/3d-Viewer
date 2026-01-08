export const ARCADA_TIPOS = {
  SUPERIOR: 'superior',
  INFERIOR: 'inferior',
} as const;

export type TipoArcada = typeof ARCADA_TIPOS[keyof typeof ARCADA_TIPOS];

export const FILE_EXTENSIONS = {
  STL: ['.stl'],
  PLY: ['.ply'],
} as const;

export const ALLOWED_EXTENSIONS = [...FILE_EXTENSIONS.STL, ...FILE_EXTENSIONS.PLY];

