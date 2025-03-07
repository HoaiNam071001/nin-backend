import { IsNotEmpty, IsDefined, IsInt } from 'class-validator';

export class ChatPayloadDto {
  @IsDefined()
  @IsNotEmpty()
  content: string;

  @IsDefined()
  @IsNotEmpty()
  @IsInt()
  conversationId: number;
}

export class ConversationDto {
  id: number;

  name?: string;

  userId?: number;

  createdAt?: Date;

  updatedAt?: Date;
}
