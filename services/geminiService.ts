
import { GoogleGenAI } from "@google/genai";
import { LogoParams } from "../types";

export const generateLogo = async (params: LogoParams): Promise<string> => {
  // Se instancia justo antes de la llamada para asegurar que usa la API Key actualizada del diálogo
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const ratio = params.width / params.height;
  let aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "1:1";

  if (ratio > 1.5) aspectRatio = "16:9";
  else if (ratio > 1.1) aspectRatio = "4:3";
  else if (ratio < 0.6) aspectRatio = "9:16";
  else if (ratio < 0.9) aspectRatio = "3:4";

  const prompt = `Create a high-end professional corporate logo design.
  
BRAND NAME: "${params.name}"
SLOGAN: "${params.slogan}"
LOGO TYPE: ${params.logoType}
VISUAL STYLE: ${params.fontStyle}
ICON CONCEPT: ${params.iconDescription}
ELEMENT DISTRIBUTION: ${params.elementDistribution}
COLORS: Text in ${params.nameColor}, Slogan in ${params.sloganColor}, Accents in ${params.colors.join(', ')}.
BACKGROUND: Solid white, clean.

CRITICAL INSTRUCTIONS:
- The design MUST follow the "${params.logoType}" structure.
- The ONLY text allowed is exactly "${params.name}" and "${params.slogan}".
- If "Solo Icono" is selected, NO text should appear.
- NO technical labels, hex codes, or UI elements in the image.
- High resolution, professional vector-like finish.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: "1K"
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          return part.inlineData.data;
        }
      }
    }
    
    throw new Error("No image data found in model response.");
  } catch (error) {
    console.error("Logo generation failed:", error);
    throw error;
  }
};

export const editLogo = async (imageBase64: string, editPrompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: 'image/png'
            }
          },
          {
            text: `Precisely modify this logo: "${editPrompt}". Keep it professional and clean. Output only the modified image.`
          }
        ]
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          return part.inlineData.data;
        }
      }
    }

    throw new Error("No edited image data found.");
  } catch (error) {
    console.error("Logo editing failed:", error);
    throw error;
  }
};
