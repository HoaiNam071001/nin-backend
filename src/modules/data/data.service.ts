import { Injectable } from '@nestjs/common';
import { createClient } from 'webhdfs';
import { Express } from 'express';
import { Readable } from 'stream';

@Injectable()
export class DataService {
  private hdfsClient;

  // hadoop fs -ls /

  constructor() {
    this.hdfsClient = createClient({
      user: 'dr.who',
      host: 'localhost',
      port: 9870,
      path: '/webhdfs/v1',
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    hdfsFilePath: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      // Tạo stream ghi đến HDFS
      const writeStream = this.hdfsClient.createWriteStream(hdfsFilePath);
      // Kiểm tra nếu writeStream bị null
      if (!writeStream) {
        return reject(`Không thể tạo stream ghi tới HDFS`);
      }

      // Sử dụng buffer để upload tệp
      const bufferStream = new Readable();
      bufferStream.push(file.buffer); // Push buffer của file vào stream
      bufferStream.push(null); // Kết thúc stream

      bufferStream
        .pipe(writeStream)
        .on('finish', () => {
          resolve(`Tệp đã được upload lên HDFS tại ${hdfsFilePath}`);
        })
        .on('error', (err) => {
          console.error('Lỗi khi upload file:', err); // Log lỗi chi tiết
          reject(`Lỗi khi upload file: ${err.message}`);
        });
    });
  }

  // async getVideoFilePath(hdfsFilePath: string): Promise<string> {
  //   return new Promise((resolve, reject) => {
  //     // Tạo URL video
  //     const videoUrl = `http://${this.hdfsClient.host}:${this.hdfsClient.port}/webhdfs/v1${hdfsFilePath}?op=OPEN`;
  //     resolve(videoUrl);
  //   });
  // }

  async streamVideo(videoPath: string) {
    return this.hdfsClient.createReadStream(videoPath);
  }
}
