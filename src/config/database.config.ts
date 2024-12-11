import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ENV_ATTR } from './app.config';

export const databaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>(ENV_ATTR.DB_HOST, 'localhost'),
  port: configService.get<number>(ENV_ATTR.DB_PORT, 6000),
  username: configService.get<string>(ENV_ATTR.DB_USERNAME, 'postgres'),
  password: configService.get<string>(ENV_ATTR.DB_PASSWORD, '0710'),
  database: configService.get<string>(ENV_ATTR.DB_DATABASE, 'nin-database'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
});

export const hadoopConfig = (configService: ConfigService) => ({
  user: configService.get<string>(ENV_ATTR.HADOOP_HOST_USER, 'dr.who'),
  host: configService.get<string>(ENV_ATTR.HADOOP_HOST, 'localhost'),
  port: configService.get<number>(ENV_ATTR.HADOOP_PORT, 50070),
  path: configService.get<string>(ENV_ATTR.HADOOP_PATH, '/webhdfs/v1'),
});
