import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

const getClient = () => {
  return new GoogleGenAI({ apiKey: API_KEY });
};

/**
 * Sends the main query to Gemini.
 * It asks for the answer AND a list of technical terms extracted from that answer.
 */
export const searchTopic = async (query: string): Promise<{ text: string; suggestedTerms: string[] }> => {
  const ai = getClient();

  // We use a schema to strictly separate the answer from the technical terms.
  // This allows the UI to "know" what words might be difficult.
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: query,
    config: {
      systemInstruction: `You are a helpful, knowledgeable AI tutor. 
      Answer the user's question clearly and accurately using markdown.
      After answering, identify 3-5 specific technical terms, proper nouns, or complex concepts used in your answer that a beginner might want to learn more about.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          answer: {
            type: Type.STRING,
            description: "The main markdown response to the user's query."
          },
          technical_terms: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 3-5 complex terms or concepts found in the answer."
          }
        },
        required: ["answer", "technical_terms"]
      }
    }
  });

  try {
    const json = JSON.parse(response.text || "{}");
    return {
      text: json.answer || "I couldn't generate an answer.",
      suggestedTerms: json.technical_terms || []
    };
  } catch (e) {
    console.error("Error parsing JSON response", e);
    return {
      text: response.text || "Error processing response.",
      suggestedTerms: []
    };
  }
};

/**
 * Defines a specific term given the context of the previous conversation/text.
 */
export const defineTerm = async (term: string, contextText: string): Promise<{ definition: string; related: string[] }> => {
  const ai = getClient();

  const prompt = `
    The user is reading the following text:
    "${contextText.substring(0, 500)}..."
    
    They have selected the term: "${term}".
    
    Please provide:
    1. A concise, easy-to-understand definition of "${term}" relevant to the context above. Keep it under 3 sentences.
    2. Two related sub-topics or questions they might ask next.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          definition: { type: Type.STRING },
          related_topics: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          }
        }
      }
    }
  });

  try {
    const json = JSON.parse(response.text || "{}");
    return {
      definition: json.definition || "Could not define term.",
      related: json.related_topics || []
    };
  } catch (e) {
    return {
      definition: response.text || "Error retrieving definition.",
      related: []
    };
  }
};