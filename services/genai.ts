
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Initializing with process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const VisionService = {
  analyzeCreative: async (base64Image: string, mimeType: string) => {
    // Fix: Using generateContent with correct parameters structure as per guidelines
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
2. Évaluation des 10 Points : Valide chaque critère de la Checklist de l'Architecte (Contraste Fort, Visage Humain, Texte < 20%, Bénéfice clair, Preuve sociale, Urgence/Rareté, Lien Direct, Cohérence Visuelle, Format Mobile, Son/Sous-titres).
3. Attribution des Scores (0-10) :
   - Hook : Capacité de l'image à arrêter le scroll immédiatement.
   - Clarté : Compréhension de l'offre en moins d'une seconde.
   - Désirabilité : Qualité esthétique et attrait du produit.

Ton Ton (Style Alexia) : Sois directe, professionnelle et sans complaisance. Si la créative est mauvaise, dis-le sans détour. Si elle a du potentiel, encourage le scaling mais reste exigeante sur les détails.

Format de sortie : Renvoie uniquement un objet JSON contenant les scores, les cases cochées de la checklist (obj: checklist) et le verdict textuel court.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hookScore: { type: Type.NUMBER, description: "Force d'arrêt visuelle (0-10)" },
            offerScore: { type: Type.NUMBER, description: "Clarté de la proposition de valeur (0-10)" },
            desirabilityScore: { type: Type.NUMBER, description: "Attrait esthétique (0-10)" },
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
              }
            },
            verdict: { type: Type.STRING, description: "Verdict tranchant et conseils experts." }
          },
          required: ["hookScore", "offerScore", "desirabilityScore", "checklist", "verdict"]
        }
      }
    });

    // Fix: Use the .text property directly as per Google GenAI guidelines
    return JSON.parse(response.text || '{}');
  }
};
