import { Injectable } from '@nestjs/common';
import { hadoopConfig } from '../../../config/database.config';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'webhdfs';

@Injectable()
export class BaseService {
  public hdfsClient;

  // hadoop fs -ls /
  config = hadoopConfig(this.configService);

  constructor(private configService: ConfigService) {
    this.hdfsClient = createClient(this.config);
  }
}
