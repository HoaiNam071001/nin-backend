import { IsOptional, IsInt, IsString, IsPositive } from 'class-validator';
import { FindManyOptions, ILike } from 'typeorm';

export const DEFAULT_PAGE_SIZE = 10;
export const FIRST_PAGE = 0;

export class PagingRequestDto<T> {
  @IsOptional()
  @IsInt()
  @IsPositive()
  private _page?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  private _size?: number;

  @IsOptional()
  @IsString({ each: true })
  private _sort?: string[];

  @IsOptional()
  @IsString()
  private _keyword?: string;

  private searchableFields: (keyof T)[];

  constructor(
    pagingRequest: PagingRequestDto<T>,
    searchableFields: (keyof T)[] = [],
  ) {
    this._page = pagingRequest?.page || FIRST_PAGE;
    this._size = +pagingRequest?.size || DEFAULT_PAGE_SIZE;
    this._sort = pagingRequest?.sort;
    this._keyword = pagingRequest?.keyword;
    this.searchableFields = searchableFields; // Lưu danh sách các trường tìm kiếm
  }

  get page(): number {
    return this._page || FIRST_PAGE;
  }

  get size(): number {
    return this._size || DEFAULT_PAGE_SIZE;
  }

  get sort(): string[] | undefined {
    return this._sort;
  }

  get keyword(): string | undefined {
    return this._keyword;
  }

  // Hàm ánh xạ truy vấn
  mapOrmQuery(params?: FindManyOptions<T>): FindManyOptions<T> {
    const skip = (this.page - 1) * this.size; // Tính toán số bản ghi bỏ qua
    const query: FindManyOptions<T> = {
      ...params,
      skip: skip > 0 ? skip : 0,
      take: this.size,
    };

    // Nếu có từ khóa tìm kiếm
    if (this.keyword) {
      this.searchableFields.forEach((field) => {
        query.where = {
          ...query.where,
          [field]: ILike(`%${this.keyword?.toLowerCase()}%`),
        };
      });
    }

    // Thêm tùy chọn sắp xếp vào query
    if (this.sort) {
      if (typeof this.sort === 'string') {
        const [field, direction] = (this.sort as string)?.split(':');
        query.order = {
          ...query.order,
          [field]: direction.toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
        };
      } else {
        this.sort?.forEach((item) => {
          const [field, direction] = item.split(':');
          query.order = {
            ...query.order,
            [field]: direction.toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
          };
        });
      }
    }

    return query;
  }
}
