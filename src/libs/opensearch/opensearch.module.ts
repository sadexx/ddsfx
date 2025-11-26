import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Client } from '@opensearch-project/opensearch';
import { EnvConfig } from 'src/config/common/types';
import { opensearchConfig } from 'src/libs/opensearch/common/config';
import { OPENSEARCH_CLIENT_TOKEN } from 'src/libs/opensearch/common/constants';
import { OpenSearchService } from 'src/libs/opensearch/services';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: OPENSEARCH_CLIENT_TOKEN,
      useFactory: (configService: ConfigService): Client => {
        const { OPENSEARCH_HOST, OPENSEARCH_USERNAME, OPENSEARCH_PASSWORD } =
          configService.getOrThrow<EnvConfig>('ENV');

        return new Client({
          ...opensearchConfig(),
          node: OPENSEARCH_HOST,
          auth: {
            username: OPENSEARCH_USERNAME,
            password: OPENSEARCH_PASSWORD,
          },
        });
      },
      inject: [ConfigService],
    },
    OpenSearchService,
  ],
  exports: [OpenSearchService],
})
export class OpenSearchModule {}
