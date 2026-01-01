
import { GoogleGenAI, Type } from "@google/genai";

export const VisionService = {
  analyzeCreative: async (base64Image: string, mimeType: string) => {
    // 1. Récupération sécurisée de la clé (compatible navigateur)
    let apiKey = "";
    try {
      if (typeof process !== "undefined" && process.env && process.env.API_KEY) {
        apiKey = process.env.API_KEY;
      }
    } catch (e) {
      // Ignorer l'erreur si process n'est pas défini
    }

    // 2. MODE SIMULATION / DÉMO (Si pas de clé détectée)
    // Cela permet à l'app de fonctionner immédiatement pour vous sans erreur
    if (!apiKey) {
      console.log("ℹ️ Mode Simulation activé (Clé API non détectée)");
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulation du temps de calcul
      
      // Génération de résultats réalistes pour la démo
      const randomScore = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
      
      return {
        hookScore: randomScore(7, 9),
        offerScore: randomScore(6, 9),
        desirabilityScore: randomScore(7, 10),
        checklist: {
          contrast: true,
          human: true,
          text: Math.random() > 0.3,
          benefit: true,
          social: Math.random() > 0.5,
          scarcity: false,
          direct: true,
          cohesion: true,
          mobile: true,
          subs: true
        },
        verdict: "Mode Simulation : Visuel impactant. Le contraste est bon, pensez à ajouter une preuve sociale pour augmenter la confiance."
      };
    }

    // 3. Mode Réel (Si clé présente)
    const ai = new GoogleGenAI({ apiKey });
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-latest",
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
              RÈGLES : Pas de markdown. Sois critique.
              
              Structure JSON :
              {
                "hookScore": number (0-10),
                "offerScore": number (0-10),
                "desirabilityScore": number (0-10),
                "checklist": { "contrast": boolean, "human": boolean, "text": boolean, "benefit": boolean, "social": boolean, "scarcity": boolean, "direct": boolean, "cohesion": boolean, "mobile": boolean, "subs": boolean },
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
      textOutput = textOutput.trim();
      if (textOutput.startsWith("```")) {
        textOutput = textOutput.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/```$/, "");
      }

      return JSON.parse(textOutput);

    } catch (error) {
      console.error("Vision AI Technical Error:", error);
      // En cas d'erreur technique réelle (réseau, quota), on fallback aussi sur une réponse par défaut
      return {
        hookScore: 0, offerScore: 0, desirabilityScore: 0,
        checklist: {},
        verdict: "Erreur de connexion IA. Vérifiez votre réseau."
      };
    }
  }
};
