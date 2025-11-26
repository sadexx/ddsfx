import { EOtpFlowType } from 'src/modules/otp/common/enum';

export interface IVerificationOtpData {
  otpFlowType: EOtpFlowType;
  verificationValue: string;
  code: string;
}
