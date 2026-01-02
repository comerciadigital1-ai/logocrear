
export interface LogoParams {
  name: string;
  slogan: string;
  colors: string[];
  fontStyle: string;
  iconDescription: string;
  elementDistribution: string;
  logoType: string; // Nueva propiedad para la estructura del logo
  width: number;
  height: number;
  nameColor: string;
  sloganColor: string;
}

export type FontOption = {
  id: string;
  name: string;
  description: string;
};

export interface GeneratedImage {
  base64: string;
  url: string;
  promptUsed: string;
}
