// BE Server - chat.controller.ts
import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  Req,
  Get,
  Param,
  Query,
  Delete,
  Put,
} from '@nestjs/common';
import { Response } from 'express';
import { ChatbotService } from '../services/chatbot.service';
import { ChatPayloadDto, ConversationDto } from '../dto/chatbot.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AuthRequest } from '../../../common/interfaces';
import { PagingRequestBase } from '../../../common/dto/pagination-request.dto';

@UseGuards(JwtAuthGuard)
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post()
  async chat(
    @Req() { user }: AuthRequest,
    @Body() payload: ChatPayloadDto,
    @Res() res: Response,
  ) {
    return await this.chatbotService.onChat(payload, user, res);
  }

  @Post('conversation')
  async addConversation(@Req() { user }: AuthRequest) {
    return await this.chatbotService.addConversation(user);
  }

  @Get(':id/messages')
  async getMessages(
    @Param('id') id: number,
    @Query() paging: PagingRequestBase,
  ) {
    return await this.chatbotService.getMessages(id, paging);
  }

  @Get('conversation')
  async getConversations(@Req() { user }: AuthRequest) {
    return await this.chatbotService.getConversations(user);
  }

  @Delete('conversation/:id')
  async removeConversation(@Param('id') id: number) {
    return await this.chatbotService.deleteConversations(id);
  }

  @Put('conversation/:id')
  async editConversations(
    @Param('id') id: number,
    @Body() payload: ConversationDto,
  ) {
    return await this.chatbotService.editConversations(id, payload);
  }
}
