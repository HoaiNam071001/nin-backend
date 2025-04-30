import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileModule } from '../../../file/file.module';
import { User } from '../../../user/entity/user.entity';
import { UserModule } from '../../../user/user.module';
import { CourseModule } from '../../course.module';
import { SectionInprogressController } from './controller/section-progress.controller';
import { SectionController } from './controller/section.controller';
import { Section, SectionProgress } from './entity/section.entity';
import { SectionInprogressService } from './service/section-inprogress.service';
import { SectionService } from './service/section.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Section, User, SectionProgress]),
    UserModule,
    FileModule,
    forwardRef(() => CourseModule),
  ],
  providers: [SectionService, SectionInprogressService],
  controllers: [SectionController, SectionInprogressController],
  exports: [SectionService, SectionInprogressService],
})
export class SectionModule {
  static TypeOrmModule: Section;
}
