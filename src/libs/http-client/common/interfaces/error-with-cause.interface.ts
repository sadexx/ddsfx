export interface IErrorWithCause extends Error {
  cause?: INetworkErrorDetails | Error;
}

interface INetworkErrorDetails {
  code: string;
  syscall: string;
  address: string;
  port: number;
  errno: number;
}
