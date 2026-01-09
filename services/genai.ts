import { GoogleGenAI } from "@google/genai";

export const VisionService = {
  analyzeCreative: async (base64Image: string, mimeType: string) => {
    // On utilise import.meta.env car c'est un projet Vite (Netlify compatible)
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("Clé API manquante dans Netlify.");
    }

    const ai = new GoogleGenAI(apiKey);
    
    try {
      const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

      const result = await model.generateContent({
        contents: [{
          role: "user",
          parts: [
            { inlineData: { data: base64Image, mimeType: mimeType } },
            { text: "Tu es l'IA Vision de Andromeda. Analyse cette pub et renvoie un JSON." }
          ],
        }],
        generationConfig: { responseMimeType: "application/json" }
      });

      return JSON.parse(result.response.text());
    } catch (error) {
      console.error("Erreur Vision AI:", error);
      throw error;
    }
  }
};