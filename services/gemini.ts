
import { GoogleGenAI, Type } from "@google/genai";

// Standardizing Gemini API usage
export async function generateSalesScript(productName: string, targetAudience: string) {
  // Always use a named parameter and direct process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Generate a high-converting sales script for an LG Subscribe agent. 
  Product: ${productName}
  Target Audience: ${targetAudience}
  
  The script should include:
  1. An attention-grabbing hook.
  2. The key benefit of subscribing vs. buying upfront.
  3. A strong Call to Action (CTA).
  Keep it professional yet friendly. Use "Life's Good" philosophy.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    // response.text is a property, not a method
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm sorry, I couldn't generate a script right now. Please try again later.";
  }
}

export async function getProductAdvice(query: string) {
    // Creating fresh instance to ensure up-to-date config
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `As an LG expert, answer this customer query about our subscription service: "${query}". Keep it helpful and concise.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        return "Our agents are currently busy, but the LG Subscribe service offers flexible plans for all our premium appliances!";
    }
}
