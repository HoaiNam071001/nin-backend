import { DEFAULT_PAGE_SIZE, FIRST_PAGE } from './pagination-request.dto';

export class PaginationResponseDto<T> {
  content: T[];
  totalElements: number;
  page: number;
  size: number;
  totalPages: number;

  last: boolean;
  first: boolean;

  constructor(data: T[], total: number, page: number, size: number) {
    this.content = data;
    this.totalElements = total;
    this.page = +page || FIRST_PAGE;
    this.size = +size || DEFAULT_PAGE_SIZE;
    this.totalPages = Math.ceil(this.totalElements / this.size) || 0;
    this.last = this.page === this.totalPages;
    this.first = this.page === FIRST_PAGE;
  }
}
