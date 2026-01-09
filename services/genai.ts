import { GoogleGenAI, Type } from "@google/genai";

export const VisionService = {
  analyzeCreative: async (base64Image: string, mimeType: string) => {
    // Initialization using strictly process.env.API_KEY as per security rules
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
              text: `Tu es l'IA "Vision" de ROAS-Garantie. Analyse cette publicité (Meta/TikTok).
              
              TACHE : Renvoie un objet JSON valide décrivant les forces et faiblesses visuelles.
              RÈGLES : Pas de markdown. Sois critique et dur sur la notation.
              
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
              hookScore: { type: Type.NUMBER, description: "Score for the first 3 seconds hook" },
              offerScore: { type: Type.NUMBER, description: "Clarity of the offer" },
              desirabilityScore: { type: Type.NUMBER, description: "Product desirability" },
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
              verdict: { type: Type.STRING, description: "Brief expert opinion" }
            },
            required: ["hookScore", "offerScore", "desirabilityScore", "checklist", "verdict"]
          }
        }
      });

      const textOutput = response.text;
      if (!textOutput) throw new Error("Réponse vide de l'IA.");

      return JSON.parse(textOutput);

    } catch (error) {
      console.error("Vision AI Technical Error:", error);
      throw error;
    }
  }
};