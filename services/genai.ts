
import { GoogleGenAI, Type } from "@google/genai";

export const VisionService = {
  analyzeCreative: async (base64Image: string, mimeType: string) => {
    // On crée une instance fraîche à chaque appel pour garantir l'usage de la clé la plus récente
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            {
              text: `Tu es Alexia, l'intelligence artificielle du module Audit Créatif d'AdPilot Pro. 
              Analyse cette image publicitaire avec une rigueur chirurgicale.
              
              CRITÈRES D'ANALYSE :
              1. Hook Score (0-10) : Capacité à arrêter le scroll (contraste, impact visuel).
              2. Offer Score (0-10) : Clarté de la proposition de valeur en moins de 1 seconde.
              3. Desirability Score (0-10) : Attrait esthétique et qualité perçue.
              
              CHECKLIST TECHNIQUE (Vrai/Faux) :
              - contrast: Contraste élevé entre le fond et le texte.
              - human: Présence d'un visage ou d'une interaction humaine.
              - text: Moins de 20% de texte sur l'image.
              - benefit: Le bénéfice client est écrit en gros.
              - social: Présence de logos média, avis ou "vu à la TV".
              - scarcity: Mention d'urgence ou de stock limité.
              - direct: CTA clair ou bouton visuel.
              - cohesion: Style graphique cohérent.
              - mobile: Format adapté au mobile (9:16 ou 4:5).
              - subs: Lisible sans le son.

              Rédige un VERDICT court et percutant (style Architecte Digital).
              Renvoie UNIQUEMENT le JSON pur sans aucun texte autour.`,
            },
            {
              inlineData: {
                data: base64Image,
                mimeType: mimeType,
              },
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

      const text = response.text || "{}";
      // Sécurité : Nettoyage des balises markdown si l'IA en ajoute par erreur
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (error: any) {
      console.error("Vision AI Error:", error);
      // Gestion de la clé API manquante ou invalide (Race Condition)
      if (error.message?.includes("Requested entity was not found")) {
        throw new Error("API_KEY_ERROR");
      }
      throw error;
    }
  }
};
