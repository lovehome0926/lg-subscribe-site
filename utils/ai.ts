
import { GoogleGenAI, Type } from "@google/genai";
import { Product, Multilingual } from "../types.js";

export async function processProductAI(input: string | { data: string, mimeType: string }, singleItem = false) {
  /* 必须在函数内部初始化，以防 API_KEY 未定义时导致整个应用在加载阶段崩溃 */
  const apiKey = process.env.API_KEY || "";
  if (!apiKey) {
    throw new Error("Missing Gemini API Key. Please configure it in the environment.");
  }
  
  const ai = new GoogleGenAI({ apiKey });
  const modelName = 'gemini-3-pro-preview';

  const contents = typeof input === 'string' 
    ? { parts: [{ text: `Extract product data for LG subscription models from this source: ${input}. Return strictly valid JSON matching the Product interface.` }] }
    : { parts: [{ inlineData: input }] };

  const response = await ai.models.generateContent({
    model: modelName,
    contents: contents,
    config: {
      systemInstruction: singleItem 
        ? "Extract 1 product. Output JSON."
        : "Extract all products. Output JSON array.",
      responseMimeType: "application/json",
    },
  });

  return response.text;
}
