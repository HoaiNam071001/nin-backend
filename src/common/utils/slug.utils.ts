import slugify from 'slugify';

/**
 * Tạo slug từ chuỗi văn bản
 * @param input Chuỗi cần chuyển thành slug
 * @param suffix Tùy chọn thêm hậu tố nếu cần (để đảm bảo tính duy nhất)
 * @returns Slug đã được xử lý
 */
export function generateSlug(input: string, suffix?: string): string {
  const baseSlug = slugify(input, { lower: true, strict: true, locale: 'vi' });
  return suffix ? `${baseSlug}-${suffix}` : `${baseSlug}-${getRandomNumber()}`;
}

function getRandomNumber(): number {
  return Math.floor(Math.random() * 100) + 1;
}
