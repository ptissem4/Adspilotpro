
import { GoogleGenAI, Type } from "@google/genai";

export const VisionService = {
  analyzeCreative: async (base64Image: string, mimeType: string) => {
    // 1. Sécurisation de la clé API
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("Clé API manquante. Ajoutez 'API_KEY' dans vos variables d'environnement (.env).");
    }

    // 2. Initialisation du client
    const ai = new GoogleGenAI({ apiKey });
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-latest", // Modèle Vision le plus stable actuellement
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Image,
                mimeType: mimeType,
              },
            },
            {
              text: `Tu es l'IA "Vision" de ROAS-Garantie. Analyse cette publicité (Meta/TikTok) selon le Protocole Architecte.
              
              TACHE : Renvoie un objet JSON valide.
              
              RÈGLES :
              1. Pas de markdown (pas de \`\`\`json).
              2. Sois critique.
              3. Analyse l'image et le texte incrusté.

              Structure JSON attendue :
              {
                "hookScore": number (0-10),
                "offerScore": number (0-10),
                "desirabilityScore": number (0-10),
                "checklist": {
                  "contrast": boolean,
                  "human": boolean,
                  "text": boolean,
                  "benefit": boolean,
                  "social": boolean,
                  "scarcity": boolean,
                  "direct": boolean,
                  "cohesion": boolean,
                  "mobile": boolean,
                  "subs": boolean
                },
                "verdict": string (max 15 mots)
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
      
      // Nettoyage de sécurité si le modèle ajoute quand même du markdown
      textOutput = textOutput.trim();
      if (textOutput.startsWith("```")) {
        textOutput = textOutput.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/```$/, "");
      }

      return JSON.parse(textOutput);

    } catch (error) {
      console.error("Vision AI Technical Error:", error);
      throw error;
    }
  }
};
