
import { GoogleGenAI } from "@google/genai";

// Enhanced AI logic for robust product data extraction
export async function processProductAI(input: string | { data: string, mimeType: string }, singleItem = false) {
  // 防御：检查 API Key 是否有效
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined" || apiKey.length < 5) {
    console.error("Gemini API Key is missing or invalid. Check GitHub Secrets or .env.");
    throw new Error("API Key Configuration Error");
  }

  const ai = new GoogleGenAI({ apiKey });
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

  const contents = typeof input === 'string' 
    ? { parts: [{ text: `${prompt}\n\nTARGET CONTENT/URL:\n${input}` }] }
    : { parts: [{ inlineData: input }] };

  const response = await ai.models.generateContent({
    model: modelName,
    contents: contents,
    config: {
      systemInstruction: "You are a professional web data extraction tool for LG Malaysia's subscription catalog. Be precise with pricing and model IDs.",
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }] 
    },
  });

  return response.text || "";
}
