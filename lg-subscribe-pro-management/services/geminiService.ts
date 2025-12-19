import { GoogleGenAI } from "@google/genai";
import { LanguageCode } from "../types";

export const getAICoachResponse = async (prompt: string, language: LanguageCode): Promise<string> => {
  // Defensive check for API key
  const apiKey = (window as any).process?.env?.API_KEY || "";
  
  if (!apiKey) {
    console.warn("Gemini API Error: API_KEY is missing from environment.");
    return "AI 导师暂时不可用：请确保已正确配置 API Key。";
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const langMap: Record<LanguageCode, string> = {
    zh: 'Chinese',
    en: 'English',
    ms: 'Malay'
  };

  const systemPrompt = `You are a world-class professional LG Subscribe Sales Mentor in Malaysia. 
  Your expertise covers:
  1. LG PuriCare Water Purifiers (Tankless, Self-service, Built-in).
  2. LG WashTower (Space-saving stacked washer-dryer).
  3. LG InstaView Refrigerators.
  4. Handling customer objections (pricing, maintenance, space, comparisons).
  5. The LG Subscribe (Rental/Lease) model logic.

  Task: Provide actionable sales scripts and expert advice based on the user's scenario.
  Language: Respond only in ${langMap[language]}.
  Tone: Professional, persuasive, empathetic, and encouraging.
  Format: Use bullet points for scripts. Keep it practical.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    return response.text || "AI 暂时无法生成回复，请重试。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "连接 AI 导师时出错，请检查网络或配置。";
  }
};