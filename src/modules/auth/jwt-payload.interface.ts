export interface JwtPayload {
  email: string; // Hoặc bất kỳ trường nào bạn muốn lưu trong token
  sub: number; // ID của người dùng (có thể là string nếu ID là một chuỗi)
}
