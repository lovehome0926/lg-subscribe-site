
import { GoogleGenAI } from "@google/genai";

/**
 * 翻译文本到三语 (en, cn, ms)
 */
export async function translateTextAI(text: string) {
  // Fixed: Directly initialize GoogleGenAI with process.env.API_KEY as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  
  const prompt = `Translate this to English, Simplified Chinese, and Malay. 
  Respond ONLY with JSON: {"en": "...", "cn": "...", "ms": "..."}
  Text: "${text}"`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    // Fixed: Use the .text property directly (not a method call) to extract text output.
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("AI Error:", e);
    return null;
  }
}

export async function processProductAI(url: string) {
  // Fixed: Directly initialize GoogleGenAI with process.env.API_KEY as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Using gemini-3-pro-preview for complex reasoning tasks like product analysis.
  const modelName = 'gemini-3-pro-preview';
  const prompt = `Analyze: ${url}. Extract Name, Model ID, 4 Features. Translate to en, cn, ms. Return ONLY JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" },
    });
    // Fixed: Use the .text property directly (not a method call) to extract text output.
    return response.text;
  } catch (error) {
    throw error;
  }
}
