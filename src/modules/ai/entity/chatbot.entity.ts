import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { ChatbotRole } from '../model/chatbot.model';

@Entity('ai_conversations')
export class AIConversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string;

  @Column({ name: 'user_id', type: 'int' })
  userId?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => AIMessage, (message) => message.conversation, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  messages: AIMessage[];

  //
  @ManyToOne(() => User, (user) => user, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}

@Entity('ai_messages')
export class AIMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'varchar', enum: ChatbotRole })
  sender: ChatbotRole;

  @Column({ name: 'conversation_id', type: 'int' })
  conversationId?: number;

  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => AIConversation, (conversation) => conversation, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: AIConversation;
}
