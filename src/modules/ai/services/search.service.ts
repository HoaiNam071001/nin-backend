import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV_ATTR } from '../../../config/app.config';
import axios from 'axios';
import { PagingRequestBase } from '../../../common/dto/pagination-request.dto';

@Injectable()
export class SearchService {
  constructor(private configService: ConfigService) {}

  async search(paging: PagingRequestBase): Promise<number[]> {
    try {
      const appUrl = this.configService.get<string>(ENV_ATTR.AI_URL);

      const response = await axios({
        url: `${appUrl}/api/search`,
        method: 'GET',
        params: paging,
      });
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new HttpException(`Fail`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
