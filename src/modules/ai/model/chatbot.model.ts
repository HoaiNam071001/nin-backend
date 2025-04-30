export enum ChatbotRole {
  USER = 'user',
  BOT = 'assistant',
}

export interface ChatMessage {
  sender: ChatbotRole;
  content: string;
}
