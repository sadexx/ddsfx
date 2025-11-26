export interface IGoogleProviderOutput {
  hostedDomain?: string;
  email: string;
  isVerifiedEmail: boolean;
  name?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
  locale?: string;
}
