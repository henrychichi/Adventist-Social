import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const generateDevotional = async (): Promise<{ title: string; verse: string; content: string } | null> => {
  if (!apiKey) {
    console.warn("API Key missing for Gemini");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a very short, inspiring daily devotional specifically for a Seventh-day Adventist audience. 
      It should include:
      1. A Title
      2. A Bible Verse (KJV or NKJV)
      3. A very short 1-paragraph reflection (maximum 50 words) focusing on grace, sabbath, or the second coming.
      
      Return the response as a clean JSON object with keys: "title", "verse", "content". 
      Do not wrap in markdown code blocks.`,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
    return null;
  } catch (error) {
    console.error("Error generating devotional:", error);
    return null;
  }
};

export const checkContentSafety = async (content: string): Promise<boolean> => {
  if (!apiKey) return true; // Default to true if no key (dev mode)

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following text for a church social media platform. 
      Text: "${content}"
      Is this content safe, respectful, and appropriate for a religious community? 
      If it contains profanity, hate speech, or overly explicit content, answer NO. 
      Otherwise answer YES. Only return the word YES or NO.`,
    });
    
    const result = response.text?.trim().toUpperCase();
    return result === 'YES';
  } catch (error) {
    console.error("Error checking safety:", error);
    return true; // Fail open for demo
  }
};

export const generatePrayerEncouragement = async (prayerCategory: string): Promise<string> => {
  if (!apiKey) return "May God bless you and keep you.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a very short (1 sentence) encouraging bible-based response to a prayer request about "${prayerCategory}".`,
    });
    return response.text || "God is listening.";
  } catch (e) {
    return "God is listening.";
  }
};