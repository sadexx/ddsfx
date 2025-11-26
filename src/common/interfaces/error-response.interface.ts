import { IValidationErrorDetail } from 'src/config/common/interfaces';

export interface IErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string | string[];
  details?: IValidationErrorDetail[];
}
