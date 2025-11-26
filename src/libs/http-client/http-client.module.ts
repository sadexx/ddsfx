import { Global, Module } from '@nestjs/common';
import { HttpRequestService } from 'src/libs/http-client/services';

@Global()
@Module({
  imports: [],
  providers: [HttpRequestService],
  exports: [HttpRequestService],
})
export class HttpClientModule {}
