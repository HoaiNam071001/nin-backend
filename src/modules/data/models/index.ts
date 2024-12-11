import { extname } from 'path';
import { v1 } from 'uuid';

export const FILE_ROUTE = '/data/file';

export const getFileName = (file: Express.Multer.File) => {
  const fileExtension = extname(file.originalname); // Lấy phần mở rộng của tệp
  return `${v1().slice(0, 10)}-${Date.now()}${fileExtension}`;
};

export enum SystemFileType {
  COURSE_INFO = 'course_info',
  COURSE_CONTENT = 'course_content',
  VIDEO_CONTENT = 'video_content',
  PROFILE = 'profile',
  OTHER = 'other',
}

export const LocalPaths = {
  [SystemFileType.COURSE_CONTENT]: `/upload/${SystemFileType.COURSE_CONTENT}`,
  [SystemFileType.VIDEO_CONTENT]: `/upload/${SystemFileType.COURSE_CONTENT}`, // save /COURSE_CONTENT
  [SystemFileType.COURSE_INFO]: `/upload/${SystemFileType.COURSE_INFO}`,
  [SystemFileType.PROFILE]: `/upload/${SystemFileType.PROFILE}`,
  [SystemFileType.OTHER]: `/upload/${SystemFileType.OTHER}`,
};

export const mapSystemTypeToLocalPath = (type: SystemFileType) => {
  return LocalPaths[type];
};
