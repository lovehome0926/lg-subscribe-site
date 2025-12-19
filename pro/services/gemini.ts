
import { GoogleGenAI } from "@google/genai";
import { Language } from "../types";

export const callGeminiCoach = async (prompt: string, language: Language) => {
  // 直接使用 process.env.API_KEY，由构建工具确保其可用
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  const languageName = language === 'zh' ? 'Chinese' : language === 'en' ? 'English' : 'Malay';
  
  const systemInstruction = `
    You are a professional LG Subscribe Sales Mentor for the Malaysia market.
    
    Task:
    1. Answer in ${languageName}.
    2. If the user asks about a specific LG product model (especially new ones like Microwaves, Styler, etc.), use the Google Search tool to find the LATEST official specifications and subscription-related info.
    3. Provide "Winning Scripts" for sales agents.
    4. Focus on LG Subscribe Malaysia context (maintenance included, low entry cost).
    
    When using search results, ensure the tone remains professional and LG-branded.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        tools: [{ googleSearch: {} }] // 启用 Google 搜索实现“自动学习”
      },
    });

    // 提取回答文本
    const text = response.text || "AI response was empty.";
    
    // 提取搜索来源链接
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri);

    return {
      text,
      sources: sources || []
    };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return {
      text: `AI Service Error: ${error.message || "Unknown error"}. Make sure your API Key is correctly set during build.`,
      sources: []
    };
  }
};
