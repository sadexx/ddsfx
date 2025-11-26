import { ClientOptions } from '@opensearch-project/opensearch';

export const opensearchConfig = (): ClientOptions => {
  return {
    maxRetries: 3,
    requestTimeout: 3000,
    pingTimeout: 3000,
    sniffInterval: false,
    sniffOnStart: false,
    sniffEndpoint: '_nodes/_all/http',
    sniffOnConnectionFault: false,
    resurrectStrategy: 'ping',
    suggestCompression: false,
    compression: 'gzip',
    ssl: undefined,
    agent: {
      keepAlive: true,
      keepAliveMsecs: 1000,
      maxSockets: 12,
      maxFreeSockets: 256,
    },
    opaqueIdPrefix: undefined,
    name: 'opensearch-js',
    context: undefined,
    proxy: undefined,
    enableMetaHeader: true,
    cloud: undefined,
    disablePrototypePoisoningProtection: true,
    memoryCircuitBreaker: {
      enabled: false,
      maxPercentage: 0.8,
    },
    enableLongNumeralSupport: false,
  };
};
