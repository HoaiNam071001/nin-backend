import { IsOptional, IsInt, IsString, IsPositive } from 'class-validator';
import { FindManyOptions, Like } from 'typeorm';

export class PagingRequestDto<T> {
  @IsOptional()
  @IsInt()
  @IsPositive()
  private _page?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  private _limit?: number;

  @IsOptional()
  @IsString({ each: true })
  private _order?: string[];

  @IsOptional()
  @IsString()
  private _keyword?: string;

  private searchableFields: (keyof T)[];

  constructor(
    pagingRequest: PagingRequestDto<T>,
    searchableFields: (keyof T)[] = [],
  ) {
    this._page = pagingRequest?.page || 1;
    this._limit = +pagingRequest?.limit || 10; // Mặc định là giới hạn 10 bản ghi
    this._order = pagingRequest?.order;
    this._keyword = pagingRequest?.keyword;
    this.searchableFields = searchableFields; // Lưu danh sách các trường tìm kiếm
  }

  get page(): number {
    return this._page || 1;
  }

  get limit(): number {
    return this._limit || 10;
  }

  get order(): string[] | undefined {
    return this._order;
  }

  get keyword(): string | undefined {
    return this._keyword;
  }

  // Hàm ánh xạ truy vấn
  mapOrmQuery(params?: FindManyOptions<T>): any {
    const query: FindManyOptions<T> = {
      ...params,
      skip: (this.page - 1) * this.limit, // Tính toán số bản ghi bỏ qua
      take: this.limit,
    };

    // Nếu có từ khóa tìm kiếm
    if (this.keyword) {
      this.searchableFields.forEach((field) => {
        query.where = {
          ...query.where,
          [field]: Like(`%${this.keyword}%`),
        };
      });
    }

    // Thêm tùy chọn sắp xếp vào query
    if (this.order) {
      this.order.forEach((item) => {
        const [field, direction] = item.split(':');
        query.order = {
          ...query.order,
          [field]: direction.toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
        };
      });
    }

    return query;
  }
}
