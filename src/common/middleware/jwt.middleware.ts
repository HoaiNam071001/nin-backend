// import {
//   Injectable,
//   NestMiddleware,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { Request, Response, NextFunction } from 'express';
// import * as jwt from 'jsonwebtoken';

// @Injectable()
// export class JwtMiddleware implements NestMiddleware {
//   use(req: Request, res: Response, next: NextFunction) {
//     const bypassRoutes = ['/signin', '/signup']; // Danh sách các route cần bỏ qua
//     const requestPath = req.path;

//     // Bỏ qua middleware cho các route signin và signup
//     if (bypassRoutes.includes(requestPath)) {
//       return next();
//     }

//     const authHeader = req.headers['authorization'];

//     if (!authHeader) {
//       throw new UnauthorizedException('Authorization header is missing');
//     }
//     const token = authHeader.split(' ')[1];

//     if (!token) {
//       throw new UnauthorizedException('Token is missing');
//     }

//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET); // Kiểm tra token có hợp lệ không
//       req.user = decoded; // Lưu thông tin người dùng vào request để sử dụng trong controller
//       next();
//       // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     } catch (error) {
//       throw new UnauthorizedException('Invalid or expired token');
//     }
//   }
// }
