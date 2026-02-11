
import { GoogleGenAI, Type } from "@google/genai";
import { Personnel, DutyAssignment, DutyType, Shift, LeaveRecord } from './types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface RosterGenerationRequest {
  personnel: Personnel[];
  leaves: LeaveRecord[];
  pastDuties: DutyAssignment[];
  weekStartDate: string;
}

export const generateSmartRoster = async (req: RosterGenerationRequest): Promise<DutyAssignment[]> => {
  const prompt = `
    You are an expert military operations scheduler.
    Task: Generate a weekly duty roster (7 days) starting from ${req.weekStartDate}.
    
    Data Provided:
    - Personnel List: ${JSON.stringify(req.personnel)}
    - Active Leaves (Exclude these people during their leave dates): ${JSON.stringify(req.leaves)}
    - Past Duties (Ensure fair rotation - don't pick the same person twice in a row if possible): ${JSON.stringify(req.pastDuties)}
    
    Duty Requirements per shift (Day and Night):
    - Main Gate Guard: 2 personnel
    - Perimeter Patrol: 2 personnel
    - Radio Room: 1 personnel
    - Duty Desk: 1 personnel
    - Quick Reaction Force: 3 personnel
    
    Total slots per day (across 2 shifts): (2+2+1+1+3) * 2 = 18 slots per day.
    Week total: 126 assignments.
    
    Constraint Rules:
    1. No one works two shifts in the same 24-hour period.
    2. Rank eligibility: Cadets cannot work Radio Room or Duty Desk alone.
    3. Fair distribution: Balance the workload across all active personnel.
    4. Format the response as a JSON array of DutyAssignment objects without the 'id' and 'assignedAt' fields (I will add them).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              personnelId: { type: Type.STRING },
              dutyType: { type: Type.STRING },
              date: { type: Type.STRING },
              shift: { type: Type.STRING },
            },
            required: ["personnelId", "dutyType", "date", "shift"]
          }
        }
      }
    });

    const rosterJson = JSON.parse(response.text);
    return rosterJson.map((item: any, idx: number) => ({
      ...item,
      id: `gen-${Date.now()}-${idx}`,
      assignedAt: new Date().toISOString()
    }));
  } catch (error) {
    console.error("Error generating roster:", error);
    throw error;
  }
};
