import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseModule } from './modules/course/course.module';
import { AuthModule } from './modules/auth/auth.module';
import { Module } from '@nestjs/common';
import { AdminModule } from './modules/admin/admin.module';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from './config/database.config';
import { DataModule } from './modules/data/data.module';

@Module({
  imports: [
    ConfigModule.forRoot(), // Thêm dòng này để sử dụng biến môi trường
    TypeOrmModule.forRoot(databaseConfig), // Sử dụng cấu hình từ databaseConfig
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
