
import { GoogleGenAI, Type } from "@google/genai";

export const VisionService = {
  analyzeCreative: async (base64Image: string, mimeType: string) => {
    // Initialisation conforme aux guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Image,
                mimeType: mimeType,
              },
            },
            {
              text: `Tu es l'intelligence artificielle du module Audit Créatif d'AdPilot Pro, conçue par Alexia Kebir, Architecte Expert en Marketing Digital. Ton rôle est d'analyser l'image publicitaire fournie avec une rigueur absolue.

Ta mission :
1. Analyse Visuelle : Scanne l'image pour détecter le contraste, la lisibilité, la présence humaine et la hiérarchie visuelle.
2. Évaluation des 10 Points : Valide chaque critère de la Checklist de l'Architecte (contrast, human, text, benefit, social, scarcity, direct, cohesion, mobile, subs).
3. Attribution des Scores (0-10) :
   - hookScore : Capacité de l'image à arrêter le scroll immédiatement.
   - offerScore : Compréhension de l'offre en moins d'une seconde.
   - desirabilityScore : Qualité esthétique et attrait du produit.

Ton Ton (Style Alexia) : Sois directe, professionnelle et sans complaisance. Si la créative est mauvaise, dis-le sans détour. Si elle a du potentiel, encourage le scaling mais reste exigeante sur les détails.

Format de sortie : Renvoie UNIQUEMENT l'objet JSON pur, sans markdown, suivant le schéma défini.`,
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

      const textOutput = response.text || '{}';
      // Nettoyage de sécurité si le modèle renvoie du markdown
      const cleanedJson = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanedJson);
    } catch (error) {
      console.error("Vision AI Error Details:", error);
      throw error;
    }
  }
};
