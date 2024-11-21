declare module 'multer' {
  import { Request } from 'express';

  interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
    // Bạn có thể thêm các thuộc tính khác nếu cần
  }

  interface Multer {
    single(field: string): (req: Request, res: any, next: any) => void;
    // Thêm các phương thức khác nếu cần
  }

  export function diskStorage(): Multer;
  export function memoryStorage(): Multer;
  export const multer: Multer;
}
