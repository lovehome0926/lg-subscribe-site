
import { GoogleGenAI, Type } from "@google/genai";
import { Product, Multilingual } from "../types";

const MULTILINGUAL_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    en: { type: Type.STRING },
    cn: { type: Type.STRING },
    ms: { type: Type.STRING }
  },
  required: ["en", "cn", "ms"]
};

const PRODUCT_DETAIL_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    category: { type: Type.STRING },
    name: { type: Type.STRING },
    subName: MULTILINGUAL_SCHEMA,
    description: { type: Type.STRING },
    features: { type: Type.ARRAY, items: MULTILINGUAL_SCHEMA },
    painPoints: { type: Type.ARRAY, items: MULTILINGUAL_SCHEMA },
    hpOptions: { 
      type: Type.ARRAY, 
      items: { 
        type: Type.OBJECT,
        properties: {
          value: { type: Type.STRING },
          modelId: { type: Type.STRING },
          rentalOffset: { type: Type.NUMBER },
          cashOffset: { type: Type.NUMBER }
        }
      } 
    },
    variants: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          colorCode: { type: Type.STRING },
          image: { type: Type.STRING },
          modelId: { type: Type.STRING }
        },
        required: ["name", "colorCode"]
      }
    },
    plans: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          termYears: { type: Type.STRING },
          maintenanceType: { type: Type.STRING },
          price: { type: Type.NUMBER },
          serviceInterval: { type: Type.STRING }
        },
        required: ["termYears", "maintenanceType", "price"]
      }
    }
  },
  required: ["category", "name", "subName", "features", "painPoints"]
};

export async function processProductAI(input: string | { data: string, mimeType: string }, singleItem = false) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const isImage = typeof input !== 'string';
  const isUrl = typeof input === 'string' && input.startsWith('http');

  const prompt = `
    TASK: Deep-extract LG product data for MALAYSIA.
    - CORE: Trilingual 'subName', 'features' (4 items), and 'painPoints' (3 items) are mandatory.
    - PAIN POINTS: Identify 3 specific user frustrations (e.g. expensive filters, high energy, slow cooling) this model solves.
    - SPECS: Extract HP options (1.0/1.5/2.0) or tank sizes with their specific model codes.
    - COLORS: Identify all official colors and their HEX codes.
    - PRICING: Extract the standard 7-year and 5-year monthly rental prices and the one-time Outright cash price.
    - OUTPUT: STRICT JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: isImage 
        ? { parts: [{ inlineData: input }, { text: prompt }] }
        : { parts: [{ text: isUrl ? `URL: ${input}\n${prompt}` : `Text Input: ${input}\n${prompt}` }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: singleItem ? PRODUCT_DETAIL_SCHEMA : { 
          type: Type.OBJECT, 
          properties: { products: { type: Type.ARRAY, items: PRODUCT_DETAIL_SCHEMA } }, 
          required: ["products"] 
        },
        tools: isUrl ? [{ googleSearch: {} }] : undefined
      }
    });

    if (!response.text) throw new Error("AI engine failed to produce content.");
    const parsed = JSON.parse(response.text);
    const rawProducts = singleItem ? [parsed] : (parsed.products || []);
    
    return rawProducts.map((p: any) => {
      const normalizedPlans = (p.plans || []).map((plan: any) => ({
        ...plan,
        termYears: plan.termYears === 'Outright' ? 'Outright' : parseInt(plan.termYears) || 7,
        maintenanceType: plan.maintenanceType || 'Regular Visit'
      }));

      const rentalPlans = normalizedPlans.filter((pl: any) => pl.termYears !== 'Outright');
      const minPrice = rentalPlans.length > 0 ? Math.min(...rentalPlans.map((pl: any) => pl.price)) : (normalizedPlans[0]?.price || 0);

      return {
        ...p,
        id: p.id || `LG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        plans: normalizedPlans,
        promoPrice: minPrice,
        normalPrice: minPrice * 1.5,
        features: (p.features || []).slice(0, 4),
        painPoints: (p.painPoints || []).slice(0, 3),
        image: p.image || '',
        variants: p.variants || [],
        hpOptions: p.hpOptions || (p.category === 'Air Conditioner' ? [{value: '1.0'}, {value: '1.5'}] : []),
        officialUrl: isUrl ? input : ''
      };
    });
  } catch (error: any) {
    console.error("AI Extraction Error:", error);
    throw new Error("Failed to extract product data. Please check the URL or content.");
  }
}

export async function fetchMarketingAI(url: string) {
    return processProductAI(url, true);
}
