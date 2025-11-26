import { Inject, Injectable } from '@nestjs/common';
import { OPENSEARCH_CLIENT_TOKEN } from 'src/libs/opensearch/common/constants';
import { Client } from '@opensearch-project/opensearch';
import { LokiLogger } from 'src/libs/logger';
import { ResponseBody } from '@opensearch-project/opensearch/api/_types/_core.search.js';
import {
  Bulk_Request,
  Count_Request,
  Count_ResponseBody,
  Indices_Create_Request,
  Search_Request,
  Update_Request,
} from '@opensearch-project/opensearch/api/index.js';
import { UpdateWriteResponseBase } from '@opensearch-project/opensearch/api/_types/_core.update.js';

@Injectable()
export class OpenSearchService {
  private readonly lokiLogger = new LokiLogger(OpenSearchService.name);

  constructor(@Inject(OPENSEARCH_CLIENT_TOKEN) private readonly openSearchClient: Client) {}

  public async createIndex(params: Indices_Create_Request): Promise<void> {
    const exists = await this.openSearchClient.indices.exists({ index: params.index });

    if (!exists.body) {
      await this.openSearchClient.indices.create(params);
      this.lokiLogger.log(`Index ${params.index} created successfully`);
    }
  }

  public async addDocumentToIndex(index: string, id: string, document: Record<string, unknown>): Promise<void> {
    await this.openSearchClient.index({
      id: id,
      index: index,
      body: document,
      refresh: true,
    });
  }

  public async bulk(params: Bulk_Request): Promise<void> {
    await this.openSearchClient.bulk(params);
  }

  public async search(params: Search_Request): Promise<ResponseBody> {
    const result = await this.openSearchClient.search(params);

    return result.body;
  }

  public async count(params: Count_Request): Promise<Count_ResponseBody> {
    const result = await this.openSearchClient.count(params);

    return result.body;
  }

  public async update(params: Update_Request): Promise<UpdateWriteResponseBase> {
    const result = await this.openSearchClient.update(params);

    return result.body;
  }

  public async deleteDocument(index: string, id: string): Promise<void> {
    await this.openSearchClient.delete({
      index: index,
      id: id,
    });
  }

  public async deleteIndex(index: string): Promise<void> {
    await this.openSearchClient.indices.delete({ index: index });
  }
}
