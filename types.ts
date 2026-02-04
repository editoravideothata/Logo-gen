
export enum LogoStyle {
  MINIMALIST = 'Minimalist and clean',
  TECH = 'Modern tech and geometric',
  RETRO = 'Vintage and retro aesthetic',
  LUXURY = 'Elegant and high-end luxury',
  PLAYFUL = 'Friendly and approachable',
  ABSTRACT = 'Creative and abstract'
}

export interface LogoGenerationResult {
  id: string;
  url: string;
  prompt: string;
  style: LogoStyle;
  timestamp: number;
}

export interface GenerationState {
  isGenerating: boolean;
  error: string | null;
  currentLogo: LogoGenerationResult | null;
  history: LogoGenerationResult[];
}
