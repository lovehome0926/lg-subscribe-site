
import { GoogleGenAI } from "@google/genai";
import { LanguageCode } from "../types";

export const getAICoachResponse = async (prompt: string, language: LanguageCode): Promise<string> => {
  // 根据指南，直接使用 process.env.API_KEY 初始化。
  // 环境会自动注入该变量，无需手动从 window.process 获取。
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const langMap: Record<LanguageCode, string> = {
    zh: 'Chinese',
    en: 'English',
    ms: 'Malay'
  };

  const systemPrompt = `You are a world-class professional LG Subscribe Sales Mentor in Malaysia. 
  Your expertise covers:
  1. LG PuriCare Water Purifiers.
  2. LG WashTower.
  3. LG InstaView Refrigerators.
  4. Handling customer objections.
  5. The LG Subscribe logic.

  Task: Provide actionable sales scripts and expert advice.
  Language: Respond only in ${langMap[language]}.
  Tone: Professional and persuasive.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
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
