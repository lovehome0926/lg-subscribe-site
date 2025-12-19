
import { GoogleGenAI } from "@google/genai";
import { LanguageCode, AICoachResponse, GroundingSource } from "../types";

export const getAICoachResponse = async (prompt: string, language: LanguageCode): Promise<AICoachResponse> => {
  // 确保 API_KEY 存在，否则提前返回友好提示
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    return {
      text: "AI 导师未配置：系统检测到 API Key 缺失，请联系管理员或在设置中检查。"
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const langMap: Record<LanguageCode, string> = {
    zh: 'Chinese',
    en: 'English',
    ms: 'Malay'
  };

  const systemPrompt = `You are a professional LG Subscribe Sales Mentor in Malaysia. 
  Expertise:
  1. LG PuriCare (Tankless), WashTower, InstaView Refrigerator.
  2. CORE TASK: Detailed comparison between Outright Purchase vs. LG Subscription.
     - Outright: High initial cost (RM3,000 - RM15,000+), limited 1-year warranty, customer pays RM400+ per service visit.
     - Subscription: Low monthly (RM60+), zero upfront, 5-7 years full warranty, FREE periodic service (CareShip) every 3-4 months.
  3. Market Insight: Use Google Search to find current promotions or competitor info (Coway, Cuckoo) to highlight LG's advantage.
  4. Response: Practical sales scripts, cost-benefit tables, and handling objections.

  Language: Answer ONLY in ${langMap[language]}.
  Tone: Professional, persuasive, and data-driven.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "AI 导师暂时无法生成回复。";
    
    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || "参考链接",
            uri: chunk.web.uri
          });
        }
      });
    }

    return { text, sources: sources.length > 0 ? sources : undefined };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      text: "AI 导师暂时不可用：请检查网络连接或 API Key 配额。"
    };
  }
};
