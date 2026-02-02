
import { GoogleGenAI } from "@google/genai";

// Enhanced AI logic for robust product data extraction
export async function processProductAI(input: string | { data: string, mimeType: string }, singleItem = false) {
  // Use named parameter for apiKey and assume process.env.API_KEY is available as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Select gemini-3-pro-preview for complex reasoning and data extraction
  const modelName = 'gemini-3-pro-preview';

  let prompt = `
    You are an expert LG Malaysia product data scraper and engine. 
    Analyze the provided content (text or direct URL) and extract all technical and commercial product details into a perfectly structured JSON.
    
    CRITICAL SCRAPING INSTRUCTIONS:
    1. Multilingual Support: All names, subtitles, features, and pain points MUST be extracted/translated into English (en), Simplified Chinese (cn), and Malay (ms).
    2. Variations: Detect all color variants. Each variant should have its own "name", "colorCode", and unique "modelId" (SKU).
    3. Performance Tiers (HP): For Air Conditioners or similar, extract every HP option (e.g., 1.0HP, 1.5HP). Each HP MUST have its own "modelId" and "rentalOffset"/"cashOffset" based on the price difference.
    4. Subscription Plans: Identify 7Y, 5Y, and Outright plans. Match maintenance types correctly.
    5. Service Intervals: Options include 4m, 6m, 12m, 24m or "None".
    6. Images: Extract the main product image URL and individual variant image URLs if available.
    
    JSON OUTPUT FORMAT:
    {
      "id": "master-sku-id",
      "category": "e.g., Air Conditioner",
      "name": "Marketing Name",
      "subName": { "en": "...", "cn": "...", "ms": "..." },
      "image": "main-image-url",
      "promoPrice": number_base_monthly,
      "normalPrice": number_retail_monthly,
      "warranty": "rental-warranty-text",
      "outrightWarranty": "cash-warranty-text",
      "features": [ { "en": "...", "cn": "...", "ms": "..." } ],
      "painPoints": [ { "en": "...", "cn": "...", "ms": "..." } ],
      "plans": [ { "termYears": 7, "maintenanceType": "Regular Visit", "serviceInterval": "4m", "price": number } ],
      "hpOptions": [ { "value": "1.0", "modelId": "SKU-1.0", "rentalOffset": 0, "cashOffset": 0 } ],
      "variants": [ { "name": "Titan", "colorCode": "#hex", "modelId": "SKU-COLOR", "image": "variant-url" } ]
    }
  `;

  // Construct contents with both prompt and optional image data
  const textPart = { text: typeof input === 'string' ? `${prompt}\n\nTARGET CONTENT/URL:\n${input}` : prompt };
  const parts: any[] = [textPart];
  
  if (typeof input !== 'string') {
    parts.push({ inlineData: input });
  }

  // Use ai.models.generateContent with model name and contents object as per guidelines
  const response = await ai.models.generateContent({
    model: modelName,
    contents: { parts },
    config: {
      systemInstruction: "You are a professional web data extraction tool for LG Malaysia's subscription catalog. Be precise with pricing and model IDs.",
      responseMimeType: "application/json",
      // googleSearch tool used to ground responses in current web data
      tools: [{ googleSearch: {} }] 
    },
  });

  // Correctly access text as a property of the response object
  return response.text || "";
}
