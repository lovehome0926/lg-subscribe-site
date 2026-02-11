
import { GoogleGenAI } from "@google/genai";

export async function processProductAI(url: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = 'gemini-3-pro-preview';

  const prompt = `
    Analyze this LG Malaysia product page: ${url}
    
    TASKS:
    1. EXTRACT PRODUCT NAME & CATEGORY.
    2. ANALYZE MARKETING MESSAGES: Extract 3-5 technical FEATURES (Highlights) and 3-5 USER PAIN POINTS (Marketing reasons why customers NEED this product).
    3. EXTRACT VARIANTS: Colors/Models. Get NAME, high-res IMAGE URL, HEX color code, and MODEL ID.
    4. PRICING: Find subscription plans (7y, 5y, etc.) and Monthly Rental.
    5. TRANSLATE: Provide results in Simplified Chinese (cn), English (en), and Malay (ms).
    
    IMPORTANT: Ensure the output contains specific pain points and features in the Multilingual structure.
    
    RETURN FORMAT (JSON):
    {
      "id": "SKU_GEN_ID",
      "category": "...",
      "name": "Full Name",
      "subName": { "en": "...", "cn": "...", "ms": "..." },
      "description": "Short marketing summary",
      "image": "Main_Image_URL",
      "normalPrice": base_rental_price,
      "officialUrl": "${url}",
      "features": [ { "en": "Feature 1", "cn": "特点 1", "ms": "Ciri 1" } ],
      "painPoints": [ { "en": "Pain Point 1", "cn": "痛点 1", "ms": "Masalah 1" } ],
      "plans": [
        { "termYears": 7, "maintenanceType": "Regular Visit", "serviceInterval": "4m", "price": 60 }
      ],
      "variants": [
        { "name": "Color Name", "colorCode": "#HEX", "image": "Variant_Image_URL", "modelId": "MODEL-XXX" }
      ],
      "hpOptions": [
        { "label": {"en":"1.0HP", "cn":"1.0匹", "ms":"1.0HP"}, "value": "1.0HP", "modelId": "MODEL-AC-10", "rentalOffset": 0 }
      ]
    }
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }] 
    },
  });

  return response.text || "{}";
}
