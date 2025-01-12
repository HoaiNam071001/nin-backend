import { Injectable } from '@nestjs/common';
import { ElasticsearchService as ESService } from '@nestjs/elasticsearch';

@Injectable()
export class SearchService {
  constructor(private readonly esService: ESService) {}

  // Tạo chỉ mục nếu chưa tồn tại
  async createIndex(index: string) {
    const exists = await this.esService.indices.exists({ index });
    if (!exists) {
      await this.esService.indices.create({ index });
    }
  }

  // Lưu tài liệu
  async indexDocument(index: string, id: string, document: any) {
    return this.esService.index({
      index,
      id,
      body: document,
    });
  }

  // Tìm kiếm tài liệu
  async search(index: string, query: any) {
    return this.esService.search({
      index,
      body: {
        query: {
          match: query,
        },
      },
    });
  }

  // Tìm kiếm với nhiều điều kiện
  async multiMatchSearch(index: string, query: string, fields: string[]) {
    return this.esService.search({
      index,
      body: {
        query: {
          multi_match: {
            query,
            fields,
          },
        },
      },
    });
  }

  // Xóa tài liệu
  async deleteDocument(index: string, id: string) {
    return this.esService.delete({
      index,
      id,
    });
  }

  // Lấy tất cả tài liệu trong chỉ mục
  async getAllDocuments(index: string) {
    return this.esService.search({
      index,
      body: {
        query: {
          match_all: {},
        },
      },
    });
  }

  async searchWithPagination(
    index: string,
    query: any,
    from: number,
    size: number,
  ) {
    return this.esService.search({
      index,
      body: {
        from,
        size,
        query: {
          match: query,
        },
      },
    });
  }
}
