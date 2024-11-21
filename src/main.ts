import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
//import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// Sử dụng biến môi trường
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  dotenv.config(); // Nạp biến môi trường từ file .env

  // Sử dụng ValidationPipe để kiểm tra dữ liệu đầu vào
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     transform: true, // Chuyển đổi tự động DTO
  //     whitelist: true, // Loại bỏ các thuộc tính không được định nghĩa trong DTO
  //     forbidNonWhitelisted: true, // Cấm các thuộc tính không được định nghĩa
  //   }),
  // );
  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableCors({
    origin: 'http://localhost:3000', // Chỉ cho phép domain này truy cập
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Các phương thức HTTP được phép
    allowedHeaders: 'Content-Type, Accept', // Các header được phép
    credentials: true, // Cho phép gửi cookie và thông tin xác thực khác
  });

  const config = new DocumentBuilder()
    .setTitle('NIN Education')
    .setDescription('The NIN API description')
    .setVersion('1.0')
    .addTag('education')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT);
}
bootstrap();
