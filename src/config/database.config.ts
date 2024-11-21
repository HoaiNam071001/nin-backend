import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: +process.env.DB_PORT || 6000,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '0710',
  database: process.env.DB_DATABASE || 'nin-database',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true, // Chỉ dùng trong phát triển
};
