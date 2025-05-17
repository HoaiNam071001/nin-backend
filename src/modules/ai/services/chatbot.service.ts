import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Response } from 'express';
import { Repository } from 'typeorm';
import {
  PagingRequestBase,
  PagingRequestDto,
  SortOrder,
} from '../../../common/dto/pagination-request.dto';
import { PaginationResponseDto } from '../../../common/dto/pagination-response.dto';
import { User } from '../../user/entity/user.entity';
import { ChatPayloadDto, ConversationDto } from '../dto/chatbot.dto';
import { AIConversation, AIMessage } from '../entity/chatbot.entity';
import { ChatbotRole } from '../model/chatbot.model';

@Injectable()
export class ChatbotService {
  constructor(
    @InjectRepository(AIConversation)
    private readonly conversationRepository: Repository<AIConversation>,
    @InjectRepository(AIMessage)
    private readonly messageRepository: Repository<AIMessage>,
  ) {}

  async getConversations(user: User): Promise<ConversationDto[]> {
    const items = await this.conversationRepository.find({
      where: { userId: user.id },
      order: { updatedAt: SortOrder.DESC },
    });
    return items;
  }

  async editConversations(
    id: number,
    payload: ConversationDto,
  ): Promise<ConversationDto> {
    const item = await this.conversationRepository.findOne({
      where: { id },
    });
    if (!item) {
      throw new Error('Conversation not found');
    }
    item.name = payload.name;
    return this.conversationRepository.save(item);
  }

  async deleteConversations(id: number) {
    await this.conversationRepository.delete(id);
    return;
  }

  async addConversation(user: User): Promise<ConversationDto> {
    const newMessage = this.conversationRepository.create({
      userId: user.id,
      name: 'New Conversation',
    });
    return this.conversationRepository.save(newMessage);
  }

  async getMessages(conversationId: number, pagAble: PagingRequestBase) {
    const _pagAble = { ...pagAble };
    if (!_pagAble?.sort) {
      _pagAble.sort = `createdAt:${SortOrder.DESC}`;
    }
    const query = new PagingRequestDto<AIMessage>(_pagAble, [
      'content',
    ]).mapOrmQuery({
      where: { conversationId },
    });
    const [data, total] = await this.messageRepository.findAndCount(query);

    return new PaginationResponseDto<AIMessage>(
      data.reverse(),
      total,
      pagAble.page,
      pagAble.size,
    );
  }

  async onChat(payload: ChatPayloadDto, user: User, res: Response) {
    try {
      if (!payload?.conversationId || !payload?.content) {
        return res.status(400).send('Missing conversationId or content');
      }
      const { conversationId, content } = payload;

      // Lấy 5 tin nhắn gần đây để tạo ngữ cảnh
      const messages = await this.getMessages(conversationId, {
        size: 2,
        sort: `createdAt:${SortOrder.DESC}`,
      });

      // Định dạng tin nhắn thành đoạn hội thoại
      const history = messages.content.reduce(
        (res, cur) => ({ ...res, [cur.sender]: cur.content }),
        {},
      );

      // Lưu tin nhắn của User vào DB
      const newUserMessage = this.messageRepository.create({
        content,
        sender: ChatbotRole.USER,
        userId: user.id,
        conversationId,
      });
      this.messageRepository.save(newUserMessage);

      // Gửi toàn bộ ngữ cảnh đến AI server
      const aiResponse = await axios.post(
        'http://localhost:8000/api/chat',
        {
          history,
          request: content,
        },
        { responseType: 'stream' },
      );

      res.setHeader('Content-Type', 'application/json');

      let fullResponseText = '';

      aiResponse.data.on('data', (chunk: Buffer) => {
        const responseText = chunk.toString();
        res.write(responseText);
        fullResponseText += responseText;
      });

      aiResponse.data.on('end', async () => {
        res.end();
        if (fullResponseText.trim()) {
          // Lưu phản hồi của chatbot vào DB
          const newBotMessage = this.messageRepository.create({
            content: fullResponseText,
            sender: ChatbotRole.BOT,
            userId: null,
            conversationId: conversationId,
          });
          await this.messageRepository.save(newBotMessage);
        }
      });

      aiResponse.data.on('error', (err: Error) => {
        res.status(500).send('Error during streaming');
      });
    } catch (error) {
      res.status(500).send('Error calling AI server');
    }
  }
}
