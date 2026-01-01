
import { GoogleGenAI, Type } from "@google/genai";

export const VisionService = {
  analyzeCreative: async (base64Image: string, mimeType: string) => {
    // Initialisation avec la clé API injectée par l'environnement
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-latest", // Modèle multimodal rapide
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Image,
                mimeType: mimeType,
              },
            },
            {
              text: `Tu es l'intelligence artificielle "Vision" de ROAS-Garantie.
Analyse cette publicité selon le Protocole Architecte.

Tu dois renvoyer un JSON strict avec cette structure :
{
  "hookScore": number (0-10, impact visuel immédiat),
  "offerScore": number (0-10, clarté de la proposition),
  "desirabilityScore": number (0-10, esthétique et envie),
  "checklist": {
    "contrast": boolean,
    "human": boolean,
    "text": boolean (peu de texte ?),
    "benefit": boolean (bénéfice clair ?),
    "social": boolean (preuve sociale ?),
    "scarcity": boolean (urgence ?),
    "direct": boolean (CTA clair ?),
    "cohesion": boolean,
    "mobile": boolean (format vertical ?),
    "subs": boolean (si applicable, sinon true)
  },
  "verdict": string (Une phrase courte et percutante style expert marketing, max 15 mots)
}`
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hookScore: { type: Type.NUMBER },
              offerScore: { type: Type.NUMBER },
              desirabilityScore: { type: Type.NUMBER },
              checklist: {
                type: Type.OBJECT,
                properties: {
                  contrast: { type: Type.BOOLEAN },
                  human: { type: Type.BOOLEAN },
                  text: { type: Type.BOOLEAN },
                  benefit: { type: Type.BOOLEAN },
                  social: { type: Type.BOOLEAN },
                  scarcity: { type: Type.BOOLEAN },
                  direct: { type: Type.BOOLEAN },
                  cohesion: { type: Type.BOOLEAN },
                  mobile: { type: Type.BOOLEAN },
                  subs: { type: Type.BOOLEAN }
                },
                required: ["contrast", "human", "text", "benefit", "social", "scarcity", "direct", "cohesion", "mobile", "subs"]
              },
              verdict: { type: Type.STRING }
            },
            required: ["hookScore", "offerScore", "desirabilityScore", "checklist", "verdict"]
          }
        }
      });

      const textOutput = response.text;
      if (!textOutput) throw new Error("Réponse vide de l'IA.");
      
      return JSON.parse(textOutput.trim());
    } catch (error) {
      console.error("Vision AI Technical Error:", error);
      throw error;
    }
  }
};
