import { Module } from '@nestjs/common';
import { ChatbotService } from './services/chatbot.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIConversation, AIMessage } from './entity/chatbot.entity';
import { ChatbotController } from './controller/chatbot.control';
import { SearchService } from './services/search.service';

const SERVICES = [ChatbotService, SearchService];
@Module({
  imports: [
    // ElasticsearchModule.registerAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (configService: ConfigService) => ({
    //     node: configService.get(ENV_ATTR.ELASTICSEARCH_NODE),
    //   }),
    //   inject: [ConfigService],
    // }),
    TypeOrmModule.forFeature([AIConversation, AIMessage]),
  ],
  providers: [...SERVICES],
  controllers: [ChatbotController],
  exports: [...SERVICES],
})
export class SearchModule {}
