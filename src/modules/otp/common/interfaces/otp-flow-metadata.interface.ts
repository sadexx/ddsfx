import { EOtpChannel, EOtpContext } from 'src/modules/otp/common/enum';

export interface IOtpFlowMetadata {
  context: EOtpContext;
  channel: EOtpChannel;
}
