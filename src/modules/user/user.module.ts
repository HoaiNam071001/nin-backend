import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { UserRole } from './entity/user-role.entity';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRole]), SearchModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {
  static TypeOrmModule: User;
}
