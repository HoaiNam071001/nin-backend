import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseModule } from './modules/course/course.module';
import { AuthModule } from './modules/auth/auth.module';
import { Module } from '@nestjs/common';
import { AdminModule } from './modules/admin/admin.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { databaseConfig } from './config/database.config';
import { DataModule } from './modules/data/data.module';
import { FileModule } from './modules/file/file.module';
import { SectionModule } from './modules/course/_modules/section/section.module';
import { PostModule } from './modules/course/_modules/post/post.module';
import { VideoModule } from './modules/course/_modules/video/video.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Cho phép sử dụng ConfigService ở mọi nơi trong ứng dụng
      envFilePath: '.env', // Đường dẫn file .env (mặc định là .env ở gốc)
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        databaseConfig(configService),
    }),
    FileModule,
    UserModule,
    CourseModule,
    AuthModule,
    AdminModule,
    DataModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(JwtMiddleware)
  //     .exclude(
  //       { path: 'auth/signin', method: RequestMethod.POST },
  //       { path: 'auth/signup', method: RequestMethod.POST },
  //     )
  //     .forRoutes('*'); // Sử dụng cho tất cả các routes
  // }
  // configure(consumer: MiddlewareConsumer) {
  //   // Bảo vệ tất cả các route trong module này
  //   consumer.apply(JwtAuthGuard).forRoutes(UserController);
  // }
}
