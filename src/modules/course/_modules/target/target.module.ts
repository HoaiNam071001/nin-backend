import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Target } from './entity/target.entity';
import { TargetService } from './service/target.service';
import { TargetController } from './controller/target.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Target])],
  providers: [TargetService],
  controllers: [TargetController],
  exports: [TargetService], // Export the service so it can be used in other modules
})
export class TargetModule {
  static TypeOrmModule: Target;
}
