import { EOtpChannel, EOtpContext, EOtpFlowType } from 'src/modules/otp/common/enum';
import { IOtpFlowMetadata } from 'src/modules/otp/common/interfaces';

export const OTP_FLOW_CONFIG = {
  [EOtpFlowType.ADD_EMAIL]: {
    context: EOtpContext.REGISTRATION,
    channel: EOtpChannel.EMAIL,
  },
  [EOtpFlowType.ADD_PHONE_NUMBER]: {
    context: EOtpContext.REGISTRATION,
    channel: EOtpChannel.PHONE_NUMBER,
  },
  [EOtpFlowType.LOGIN]: {
    context: EOtpContext.VERIFICATION,
    channel: EOtpChannel.PHONE_NUMBER,
  },
  [EOtpFlowType.CHANGE_EMAIL]: {
    context: EOtpContext.VERIFICATION,
    channel: EOtpChannel.EMAIL,
  },
  [EOtpFlowType.CHANGE_PHONE_NUMBER]: {
    context: EOtpContext.VERIFICATION,
    channel: EOtpChannel.PHONE_NUMBER,
  },
  [EOtpFlowType.RESET_PASSWORD]: {
    context: EOtpContext.VERIFICATION,
    channel: EOtpChannel.EMAIL,
  },
  [EOtpFlowType.CHANGE_PASSWORD]: {
    context: EOtpContext.VERIFICATION,
    channel: EOtpChannel.EMAIL,
  },
} as const satisfies Record<EOtpFlowType, IOtpFlowMetadata>;
