import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Level } from './entity/level.entity';
import { UserModule } from '../../../user/user.module';
import { LevelService } from './service/level.service';
import { LevelController } from './controller/level.controller';
@Module({
  imports: [TypeOrmModule.forFeature([Level]), UserModule],
  providers: [LevelService],
  controllers: [LevelController],
  exports: [LevelService], // Export the service so it can be used in other modules
})
export class LevelModule {
  static TypeOrmModule: Level;
}
