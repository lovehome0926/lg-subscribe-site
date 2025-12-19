
import { GoogleGenAI } from "@google/genai";
import { Language } from "../types";

export const callGeminiCoach = async (prompt: string, language: Language) => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const languageName = language === 'zh' ? 'Chinese' : language === 'en' ? 'English' : 'Malay';
  
  const systemInstruction = `
    You are a professional LG Subscribe Sales Mentor for the Malaysia market.
    Your tone is encouraging, professional, and knowledgeable.
    
    Context: LG Subscribe Malaysia offers home appliances like Water Purifiers, Air Purifiers, WashTower, and InstaView Refrigerators via a monthly subscription model.
    
    Key selling points of LG Subscribe:
    1. Low initial cost (zero/low downpayment).
    2. Maintenance included (LG CareShip).
    3. New appliance with full warranty during subscription.
    
    Instruction: 
    - Answer in ${languageName}.
    - Focus on handling customer objections (e.g., price is too high, house is too small, etc.).
    - Provide specific "Winning Scripts" that an agent can copy.
    - Keep responses concise and practical for a mobile app.
    - If the user asks about specific technical specs, refer to LG standard data.
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

    return response.text || "I'm sorry, I couldn't generate a response right now.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
