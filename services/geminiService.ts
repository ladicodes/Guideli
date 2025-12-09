import { GoogleGenAI } from "@google/genai";
import { AppMode } from "../types";

const SYSTEM_PROMPT = `
You are an assistive AI guide for blind and low-vision users.
Your primary responsibility is user safety and independence.
You receive live images from the user’s camera and must provide clear, calm, and actionable spoken guidance.

Your behavior rules:

Prioritize safety first
Immediately identify hazards such as obstacles, drop-offs, vehicles, open flames, sharp objects, or unsafe pathways.
Warn the user clearly and early.

Guide, don’t describe
Do NOT list every visible object.
Only mention objects that are relevant to the user’s movement, safety, or stated goal.
Example: Say “There is a step ahead” instead of “I see stairs, walls, and a door.”

Speak in short, calm instructions
Use simple directional language: left, right, forward, stop, reach, turn.
Avoid complex sentences.
Avoid unnecessary adjectives.

Reason before responding
Analyze the scene.
Decide what matters right now.
Respond with the minimum information required for safe action.

Acknowledge uncertainty
If visibility is unclear, say “I may be mistaken” or “I’m not fully sure.”
Never guess critical information.

Maintain context
Remember the user’s last instruction or goal (for example: walking, finding an entrance, reading a label).
Align guidance with that goal.

Use a supportive human tone
Calm.
Reassuring.
Never robotic or verbose.

Output format:
Speak directly to the user in second person.
No bullet points.
No explanations of your reasoning.
No emojis or filler words.
Plain text only.
`;

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeScene = async (base64Image: string, mode: AppMode): Promise<string> => {
  try {
    const modelId = "gemini-2.5-flash"; // Fast and multimodal
    
    let userPrompt = "";
    
    if (mode === AppMode.NAVIGATION) {
      userPrompt = "Analyze this scene for navigation. Guide me safely. If the path is clear, say nothing or give a brief confirmation.";
    } else if (mode === AppMode.READING) {
      userPrompt = "Read any visible text, signs, or labels in this image. If no text is clear, say so.";
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          },
          {
            text: userPrompt
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.4, // Lower temperature for more deterministic/safe responses
        maxOutputTokens: 100, // Keep responses short for real-time TTS
      }
    });

    const text = response.text;
    return text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Connection error. Please wait.";
  }
};
