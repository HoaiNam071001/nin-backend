import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import * as streamifier from 'streamifier';
import { ENV_ATTR } from '../../../config/app.config';
import {
  FILE_ROUTE,
  getFileName,
  mapSystemTypeToLocalPath,
  SystemFileType,
} from '../models';
import { BaseService } from './base.service';
import ffmpeg from 'fluent-ffmpeg';
import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

@Injectable()
export class DataService {
  constructor(
    private baseService: BaseService,
    private configService: ConfigService,
  ) {}

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
    const { host, port, path } = this.baseService.config;
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
      const hdfsWriteStream =
        this.baseService.hdfsClient.createWriteStream(hdfsPath);

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
  async readVideoFile(hdfsFilePath: string, res: Response) {
    const hdfsUrl = this.getHdfsPath(hdfsFilePath);

    try {
      console.log('hdfsUrl', hdfsUrl);
      // Lấy thông tin file từ HDFS (metadata) để biết kích thước file
      const headResponse = await axios({
        url: hdfsUrl,
        method: 'HEAD', // Chỉ lấy header, không tải toàn bộ file
      });
      console.log('headResponse', headResponse);
      const fileSize = parseInt(headResponse.headers['content-length'], 10);
      const contentType = headResponse.headers['content-type'] || 'video/mp4'; // Giả sử là video/mp4

      // Thiết lập header cơ bản
      res.setHeader('Content-Type', contentType);
      res.setHeader('Accept-Ranges', 'bytes'); // Thông báo hỗ trợ range requests

      // Lấy header Range từ request của client
      const range = res.req.headers.range;
      console.log('range', range);

      if (!range) {
        // Nếu không có Range, trả toàn bộ file
        res.setHeader('Content-Length', fileSize);

        const response = await axios({
          url: hdfsUrl,
          method: 'GET',
          responseType: 'stream',
        });

        response.data.pipe(res);
        return;
      }

      // Xử lý Range request (ví dụ: Range: bytes=500-999)
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      // Kiểm tra range hợp lệ
      if (start >= fileSize || end >= fileSize || start > end) {
        res.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE);
        res.setHeader('Content-Range', `bytes */${fileSize}`);
        res.end();
        return;
      }

      // Thiết lập header cho phản hồi range
      res.status(HttpStatus.PARTIAL_CONTENT); // 206 Partial Content
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.setHeader('Content-Length', end - start + 1);

      // Gửi request tới WebHDFS với range cụ thể
      const response = await axios({
        url: hdfsUrl,
        method: 'GET',
        responseType: 'stream',
        headers: {
          Range: `bytes=${start}-${end}`, // Yêu cầu WebHDFS trả về một phần dữ liệu
        },
      });

      // Pipe luồng dữ liệu tới client
      response.data.pipe(res);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
