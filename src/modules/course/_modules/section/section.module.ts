import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Section } from './entity/section.entity';
import { SectionService } from './service/section.service';
import { SectionController } from './controller/section.controller';
import { UserModule } from '../../../user/user.module';
import { CourseModule } from '../../course.module';
import { FileModule } from '../../../file/file.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Section]),
    UserModule,
    FileModule,
    forwardRef(() => CourseModule),
  ],
  providers: [SectionService],
  controllers: [SectionController],
  exports: [SectionService], // Export the service so it can be used in other modules
})
export class SectionModule {
  static TypeOrmModule: Section;
}
