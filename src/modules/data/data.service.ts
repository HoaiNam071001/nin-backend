import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { createClient } from 'webhdfs';
import axios from 'axios';
import { Response } from 'express';
import { hadoopConfig } from '../../config/database.config';
import { ConfigService } from '@nestjs/config';
import * as streamifier from 'streamifier';
import { ENV_ATTR } from '../../config/app.config';
import {
  FILE_ROUTE,
  getFileName,
  mapSystemTypeToLocalPath,
  SystemFileType,
} from './models';

@Injectable()
export class DataService {
  public hdfsClient;

  // hadoop fs -ls /
  config = hadoopConfig(this.configService);

  constructor(private configService: ConfigService) {
    this.hdfsClient = createClient(this.config);
  }

  async uploadFile(
    file: Express.Multer.File,
    type: SystemFileType = SystemFileType.OTHER,
  ): Promise<{ url: string }> {
    type = type || SystemFileType.OTHER;
    const fileName = getFileName(file);
    const localPath = mapSystemTypeToLocalPath(type);
    const hdfsPath = `${localPath}/${fileName}`;

    try {
      await this.uploadFileToHdfs(file.buffer, hdfsPath);
      const appUrl = this.configService.get<string>(ENV_ATTR.APP_URL);
      const port = this.configService.get<string>(ENV_ATTR.PORT);

      return { url: `${appUrl}:${port}${FILE_ROUTE}${hdfsPath}` };
    } catch (error) {
      throw new HttpException(
        `Failed to upload file: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  getHdfsPath(hdfsPath: string) {
    const { host, port, path } = this.config;
    return `http://${host}:${port}${path}/${hdfsPath}?op=OPEN`;
  }

  async uploadFileToHdfs(
    fileBuffer: Buffer,
    hdfsPath: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      // Chuyển Buffer thành Stream
      const fileStream = streamifier.createReadStream(fileBuffer);

      // Tạo stream ghi vào HDFS
      const hdfsWriteStream = this.hdfsClient.createWriteStream(hdfsPath);

      // Pipe dữ liệu từ fileStream vào HDFS write stream
      fileStream.pipe(hdfsWriteStream);

      // Lắng nghe sự kiện khi upload hoàn tất
      hdfsWriteStream.on('finish', () => {
        resolve(hdfsPath);
      });

      // Lắng nghe sự kiện lỗi
      hdfsWriteStream.on('error', (err) => {
        reject(`Failed to upload file to HDFS: ${err.message}`);
      });
    });
  }

  async readFile(hdfsFilePath: string, res: Response) {
    const hdfsUrl = this.getHdfsPath(hdfsFilePath);
    try {
      // Gửi request tới WebHDFS
      const response = await axios({
        url: hdfsUrl,
        method: 'GET',
        responseType: 'stream', // Đảm bảo trả về dạng luồng
      });

      // Lấy Content-Type từ WebHDFS
      const contentType =
        response.headers['content-type'] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);

      // Gửi luồng dữ liệu tới client
      response.data.pipe(res);
    } catch (error) {
      throw new HttpException(
        `Không thể đọc file từ HDFS: ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
