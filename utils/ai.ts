
import { GoogleGenAI, Type } from "@google/genai";
import { Product, Multilingual } from "../types";

/* Strictly use process.env.API_KEY as the exclusive source for the Gemini API key */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function processProductAI(input: string | { data: string, mimeType: string }, singleItem = false) {
  /* Complex data extraction/parsing task requires gemini-3-pro-preview */
  const modelName = 'gemini-3-pro-preview';

  /* Prepare contents for generateContent, supporting both text and inlineData */
  const contents = typeof input === 'string' 
    ? { parts: [{ text: `Extract product data from the following text and return in JSON format according to the Product interface: ${input}` }] }
    : { parts: [{ inlineData: input }] };

  /* Execute generateContent with specific configuration for JSON output */
  const response = await ai.models.generateContent({
    model: modelName,
    contents: contents,
    config: {
      systemInstruction: singleItem 
        ? "Extract product information for a single item into JSON format."
        : "Extract product information for multiple items into a JSON array.",
      responseMimeType: "application/json",
    },
  });

  /* Extract and return the generated text content directly from the response object */
  return response.text;
}
