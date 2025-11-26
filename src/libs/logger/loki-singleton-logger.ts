import { LokiLogger } from 'src/libs/logger/loki-logger.service';
export const SingleLokiLogger = new LokiLogger('NestApplication', { timestamp: false });
