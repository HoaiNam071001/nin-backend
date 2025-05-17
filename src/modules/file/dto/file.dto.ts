import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { SystemFileType } from '../../data/models';

export class FileDto {
  @ApiProperty({ example: 1, description: 'ID của file' })
  id: number;

  @ApiProperty({
    example: 'https://example.com/uploads/file.png',
    description: 'URL của file',
  })
  url: string;

  name: string;

  @ApiProperty({ example: 'image/png', description: 'Loại file' })
  type: string;

  @ApiProperty({ example: 102400, description: 'Kích thước file (byte)' })
  size: number;

  @ApiProperty({
    example: '2024-11-28T12:34:56Z',
    description: 'Thời gian tạo file',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-11-29T15:21:30Z',
    description: 'Thời gian cập nhật file',
  })
  updatedAt: Date;

  // Exclude fields that shouldn't appear in the API response or Swagger
  @Exclude()
  systemType: string;

  @Exclude()
  userId: number;

  @Exclude()
  courseId: number;

  deleted: boolean;
}

export class FilePayloadDto {
  url?: string;
  userId?: number;
  courseId?: number;
  sectionId?: number;
  systemType?: SystemFileType;
}

export class FileSearchPayload {
  userIds?: number[];
  courseIds?: number[];
}
