
import { GoogleGenAI } from "@google/genai";
import { Language } from "../types";

export const callGeminiCoach = async (prompt: string, language: Language) => {
  // 检查 API Key
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.error("API Key is missing from process.env");
    return "Error: API Key is not configured. Please check your environment variables.";
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });
  
  const languageName = language === 'zh' ? 'Chinese' : language === 'en' ? 'English' : 'Malay';
  
  const systemInstruction = `
    You are a professional LG Subscribe Sales Mentor for the Malaysia market.
    Your tone is encouraging, professional, and knowledgeable.
    
    Context: LG Subscribe Malaysia offers home appliances via monthly subscription.
    
    Key selling points:
    1. Low initial cost.
    2. Maintenance included (LG CareShip).
    3. New appliance with full warranty.
    
    Instruction: 
    - Answer in ${languageName}.
    - Focus on handling objections.
    - Provide specific "Winning Scripts".
    - Keep responses concise for mobile viewing.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "AI response was empty. Please try again.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return `AI Service Error: ${error.message || "Unknown error"}`;
  }
};
