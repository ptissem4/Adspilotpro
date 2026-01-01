
import { GoogleGenAI, Type } from "@google/genai";

export const VisionService = {
  analyzeCreative: async (base64Image: string, mimeType: string) => {
    // Initialisation
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash", // Modèle le plus rapide et fiable pour Vision/JSON
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
              
              TACHE UNIQUE : Renvoie un objet JSON valide décrivant la qualité de la publicité.
              
              RÈGLES STRICTES :
              1. Ne mets PAS de balises markdown (pas de \`\`\`json).
              2. Sois critique et dur sur les scores.
              3. Analyse le texte dans l'image pour l'offre et le bénéfice.

              Structure attendue :
              {
                "hookScore": number (0-10, capacité à stopper le scroll),
                "offerScore": number (0-10, clarté de la promesse),
                "desirabilityScore": number (0-10, esthétique produit),
                "checklist": {
                  "contrast": boolean (image contrastée ?),
                  "human": boolean (visage visible ?),
                  "text": boolean (texte court/lisible ?),
                  "benefit": boolean (bénéfice clair ?),
                  "social": boolean (étoiles/avis visibles ?),
                  "scarcity": boolean (urgence/promo ?),
                  "direct": boolean (CTA ou produit clair ?),
                  "cohesion": boolean (design pro ?),
                  "mobile": boolean (format 9:16 ou 4:5 ?),
                  "subs": boolean (si vidéo : sous-titres ? sinon true)
                },
                "verdict": string (Conseil stratégique court, max 15 mots, ton expert direct)
              }`
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
          // Schema strict pour forcer la structure
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
      
      // NETTOYAGE CHIRURGICAL : On retire le markdown si l'IA en a mis malgré les consignes
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
