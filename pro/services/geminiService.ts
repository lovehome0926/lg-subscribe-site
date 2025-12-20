
import { GoogleGenAI, Type } from "@google/genai";
import { Agent, DayInfo } from "../types";
// Fix: Import AGENT_COLORS directly to avoid "require" errors and improve typing
import { AGENT_COLORS } from "../constants";

export const optimizeScheduleWithAI = async (
  agents: Agent[],
  monthDays: any[]
): Promise<DayInfo[]> => {
  try {
    // Fix: Initialize GoogleGenAI according to guidelines using process.env.API_KEY directly
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Construct prompt for Gemini
    const prompt = `
      You are a workforce management expert for LG.
      Optimize a schedule for ${monthDays.length} days.
      Agents: ${JSON.stringify(agents.map(a => ({ name: a.name, code: a.code, type: a.type, unavailable: a.unavailable })))}
      
      CRITICAL Constraints:
      1. Each day has 2 slots: AM (slot 1) and PM (slot 2).
      2. STAFFING LIMITS: Minimum 1 agent AND Maximum 2 agents per slot. 
         - If availability allows, you MUST assign at least 1 person to every slot.
         - NEVER assign more than 2 people to a single slot.
      3. An agent cannot work if they marked that day/slot as unavailable.
      4. Workload must be balanced fairly across FT agents.
      5. One agent cannot work more than 1 slot per day.
      6. PART-TIME (PT) LIMIT: Part-time agents are strictly limited to a MAXIMUM of 2 slots in any rolling 7-day period. 
         Check the previous 6 days before assigning a PT agent to ensure they do not exceed 2 total slots for that week.
      
      Return a JSON array of objects, one for each day 1-${monthDays.length}, with:
      - day: number
      - slot1: array of agent names (strings)
      - slot2: array of agent names (strings)
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.INTEGER },
              slot1: { type: Type.ARRAY, items: { type: Type.STRING } },
              slot2: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["day", "slot1", "slot2"]
          }
        }
      }
    });

    // Fix: Access .text property directly (not as a method)
    const aiResult = JSON.parse(response.text || '[]');

    return monthDays.map(d => {
      const dayData = aiResult.find((r: any) => r.day === d.day);
      const mapToShift = (names: string[]) => names.map(name => {
        const agent = agents.find(a => a.name === name);
        return {
          name,
          color: agent ? AGENT_COLORS[agent.colorIdx] : AGENT_COLORS[0]
        };
      });

      return {
        ...d,
        slot1: mapToShift(dayData?.slot1 || []),
        slot2: mapToShift(dayData?.slot2 || [])
      };
    });
  } catch (error) {
    console.error("AI Generation failed, falling back to basic logic", error);
    return monthDays.map(d => ({
      ...d,
      day: d.day,
      dow: d.dow,
      isWeekend: d.isWeekend,
      slot1: [],
      slot2: []
    }));
  }
};
