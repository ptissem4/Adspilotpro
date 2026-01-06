
import { GoogleGenAI, Type } from "@google/genai";

// 👇 VOTRE CLÉ API EST BIEN CONFIGURÉE ICI
const MANUAL_API_KEY = "AIzaSyAuLchGrP71K7ranzDyFk2ehoxlXSdwxcI"; 

export const VisionService = {
  analyzeCreative: async (base64Image: string, mimeType: string) => {
    // 1. Récupération de la clé API (Priorité : Variable d'env > Clé manuelle)
    let apiKey = "";

    // Tentative lecture process.env
    try {
      // @ts-ignore
      if (typeof process !== "undefined" && process.env && process.env.API_KEY) {
        apiKey = process.env.API_KEY;
      }
    } catch (e) {
      // Ignorer si process non défini
    }

    // Fallback sur la clé manuelle si process.env est vide
    if (!apiKey && MANUAL_API_KEY) {
      apiKey = MANUAL_API_KEY;
    }
    
    // Si aucune clé n'est trouvée, on bloque
    if (!apiKey) {
      throw new Error("Clé API manquante. Remplissez 'MANUAL_API_KEY' dans services/genai.ts ou configurez votre .env");
    }

    // 2. Initialisation du client en mode RÉEL
    const ai = new GoogleGenAI({ apiKey });
    
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
              text: `Tu es l'IA "Vision" de ROAS-Garantie. Analyse cette publicité (Meta/TikTok).
              
              TACHE : Renvoie un objet JSON valide.
              RÈGLES : Pas de markdown. Sois critique et dur sur la notation.
              
              Structure JSON attendue :
              {
                "hookScore": number (0-10),
                "offerScore": number (0-10),
                "desirabilityScore": number (0-10),
                "checklist": { "contrast": boolean, "human": boolean, "text": boolean, "benefit": boolean, "social": boolean, "scarcity": boolean, "direct": boolean, "cohesion": boolean, "mobile": boolean, "subs": boolean },
                "verdict": string (max 15 mots, ton expert direct)
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

      let textOutput = response.text || "{}";
      
      // Extraction robuste du JSON (au cas où le modèle ajoute du texte avant/après)
      const firstBrace = textOutput.indexOf('{');
      const lastBrace = textOutput.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1) {
          textOutput = textOutput.substring(firstBrace, lastBrace + 1);
      }

      return JSON.parse(textOutput);

    } catch (error) {
      console.error("Vision AI Technical Error:", error);
      throw error;
    }
  }
};
