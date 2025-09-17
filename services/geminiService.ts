import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Attachment } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might want to show an error to the user or disable AI features.
  console.error("Gemini API key not found. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateSummary = async (data: { content?: string; attachment?: Attachment }): Promise<string> => {
  if (!API_KEY) {
    return "AI features are disabled. API key is missing.";
  }
  
  const { content, attachment } = data;

  if (!content?.trim() && !attachment) {
    return "";
  }

  try {
    let response: GenerateContentResponse;

    if (content) {
        const prompt = `Summarize the following document content into a concise, one-sentence summary. The summary should capture the main essence of the text.

        Document Content:
        ---
        ${content}
        ---
        
        One-sentence Summary:`;
    
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            temperature: 0.5,
          }
        });
    } else if (attachment && attachment.mimeType.startsWith('image/')) {
        response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
              parts: [
                { text: "Describe this image in one concise sentence, as if it were a document summary." },
                { 
                  inlineData: { 
                    mimeType: attachment.mimeType, 
                    data: attachment.data 
                  } 
                }
              ]
            },
            config: {
                temperature: 0.5,
            }
        });
    } else {
        throw new Error("No valid content or attachment provided for summary generation.");
    }

    const summary = response.text.trim();
    if (summary) {
        return summary;
    } else {
        throw new Error("Received an empty summary from the API.");
    }
  } catch (error) {
    console.error("Error generating summary:", error);
    throw new Error("Failed to generate summary. Please try again.");
  }
};