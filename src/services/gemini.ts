import { GoogleGenAI, Type, ThinkingLevel, Modality } from "@google/genai";

export const GEMINI_MODELS = {
  FLASH: "gemini-3-flash-preview",
  PRO: "gemini-3.1-pro-preview",
  IMAGE: "gemini-3-pro-image-preview",
};

export async function getAI() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

export async function generateTeacherStory(prompt: string) {
  const ai = await getAI();
  const response = await ai.models.generateContent({
    model: GEMINI_MODELS.FLASH,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          bio: { type: Type.STRING },
          impact: { type: Type.STRING },
          school: { type: Type.STRING },
          location: { type: Type.STRING },
        },
        required: ["name", "bio", "impact", "school", "location"],
      },
    },
  });
  return JSON.parse(response.text || "{}");
}

export async function generateTeacherPortrait(prompt: string, size: "1K" | "2K" | "4K" = "1K") {
  const ai = await getAI();
  const response = await ai.models.generateContent({
    model: GEMINI_MODELS.IMAGE,
    contents: {
      parts: [{ text: `A professional, warm, and friendly portrait of a Michigan teacher in a classroom setting. ${prompt}. High quality, realistic, cinematic lighting.` }],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: size,
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}

export async function analyzeImpactComplex(data: string) {
  const ai = await getAI();
  const response = await ai.models.generateContent({
    model: GEMINI_MODELS.PRO,
    contents: `Analyze the following donation data and provide a summary of the impact on Michigan education: ${data}`,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
    },
  });
  return response.text;
}
