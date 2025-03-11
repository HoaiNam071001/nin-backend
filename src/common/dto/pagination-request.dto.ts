import { IsOptional, IsInt, IsString, IsPositive } from 'class-validator';
import { FindManyOptions, FindOptionsWhere, ILike } from 'typeorm';

export const DEFAULT_PAGE_SIZE = 10;
export const FIRST_PAGE = 0;

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export interface PagingRequestBase {
  page?: number;
  size?: number;
  sort?: string[] | string;
  keyword?: string;
}

export class PagingRequestDto<T> implements PagingRequestBase {
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
  private _sort?: string[] | string;

  @IsOptional()
  @IsString()
  private _keyword?: string;

  private searchableFields: string[];

  constructor(
    pagingRequest: PagingRequestBase,
    searchableFields: string[] = [],
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

  get sort(): string[] | string {
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
      const where = query.where;
      const keywordCondition = this.searchableFields.map((field) => ({
        ...where,
        ...convertStringToNestedObject(
          field as string,
          ILike(`%${this.keyword?.toLowerCase()}%`),
        ),
      }));

      query.where = keywordCondition as FindOptionsWhere<T>[];
    }

    // Thêm tùy chọn sắp xếp vào query
    if (this.sort) {
      if (typeof this.sort === 'string') {
        const [fieldPath, direction] = (this.sort as string)?.split(':');
        const directionUpperCase =
          direction.toUpperCase() === SortOrder.DESC
            ? SortOrder.DESC
            : SortOrder.ASC;

        // Xử lý trường hợp không có quan hệ (ví dụ: 'createdAt')
        query.order = {
          ...query.order,
          [fieldPath]: directionUpperCase,
        };
      } else {
        this.sort?.forEach((item) => {
          const [fieldPath, direction] = item.split(':');
          const directionUpperCase =
            direction.toUpperCase() === SortOrder.DESC
              ? SortOrder.DESC
              : SortOrder.ASC;

          // Xử lý trường hợp không có quan hệ (ví dụ: 'createdAt')
          query.order = {
            ...query.order,
            [fieldPath]: directionUpperCase,
          };
        });
      }
    }
    return query;
  }
}

function convertStringToNestedObject(
  input: string,
  value: any,
): Record<string, SortOrder> {
  const parts = input.split('.');
  const result: Record<string, any> = {};
  let current = result;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    current[part] = {};
    current = current[part];
  }

  current[parts[parts.length - 1]] = value;
  return result;
}
