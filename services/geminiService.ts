
import { GoogleGenAI } from "@google/genai";
import { LogoStyle } from "../types";

export const generateLogoImage = async (
  brandName: string,
  style: LogoStyle,
  description: string
): Promise<string> => {
  // Inicialização obrigatória conforme os guidelines: usa a chave diretamente do process.env
  // O processo deve ser instanciado dentro da função para garantir que a chave mais recente seja usada
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const fullPrompt = `
    Create a professional, high-quality logo for a brand named "${brandName}".
    Style: ${style}.
    Description: ${description}.
    The logo should be centered, on a solid white or transparent-looking background, with clean lines, high contrast, and no text other than the brand name if necessary. 
    Make it vector-style, iconic, and suitable for branding.
  `.trim();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: fullPrompt },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    let imageUrl = '';
    
    // Iterar pelas partes para encontrar a imagem base64
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) {
      throw new Error('O modelo não retornou uma imagem válida. Verifique se o prompt não viola políticas de segurança.');
    }

    return imageUrl;
  } catch (error: any) {
    console.error('Logo generation error:', error);
    // Se o erro for de falta de chave, o SDK jogará um erro específico que tratamos aqui
    if (error.message?.includes('API_KEY')) {
      throw new Error('API Key não configurada. Por favor, adicione a variável de ambiente API_KEY.');
    }
    throw new Error(error.message || 'Falha ao gerar o logo. Tente novamente em instantes.');
  }
};
