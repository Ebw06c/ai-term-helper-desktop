export enum Sender {
  USER = 'USER',
  AI = 'AI'
}

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: number;
  // Suggested difficult terms automatically extracted by AI
  suggestedTerms?: string[]; 
}

export interface DefinitionData {
  term: string;
  definition: string;
  context: string; // The sentence or context it was found in
  relatedTopics?: string[];
}

export interface SelectionCoords {
  x: number;
  y: number;
  text: string;
}