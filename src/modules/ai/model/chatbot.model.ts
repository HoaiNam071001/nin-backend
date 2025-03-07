export enum ChatbotRole {
  USER = 'User',
  BOT = 'NIN Assistant',
}

export interface ChatMessage {
  sender: ChatbotRole;
  content: string;
}
