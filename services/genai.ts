import { GoogleGenAI, Type } from "@google/genai";

export const VisionService = {
  analyzeCreative: async (base64Image: string, mimeType: string) => {
    // CORRECTION : Utilisation de import.meta.env pour Vite + fallback de sécurité
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("Clé API manquante. Vérifiez la configuration Netlify.");
    }

    const ai = new GoogleGenAI(apiKey); // Utilisation simplifiée
    
    try {
      const model = ai.getGenerativeModel({ 
        model: "gemini-2.0-flash", // Utilisation de la version stable 2.0
      });

      const result = await model.generateContent({
        contents: [{
          role: "user",
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
                "hookScore": number,
                "offerScore": number,
                "desirabilityScore": number,
                "checklist": { "contrast": boolean, "human": boolean, "text": boolean, "benefit": boolean, "social": boolean, "scarcity": boolean, "direct": boolean, "cohesion": boolean, "mobile": boolean, "subs": boolean },
                "verdict": string
              }`
            },
          ],
        }],
        generationConfig: {
          responseMimeType: "application/json",
        }
      });

      const textOutput = result.response.text();
      return JSON.parse(textOutput);

    } catch (error) {
      console.error("Vision AI Technical Error:", error);
      throw error;
    }
  }
};