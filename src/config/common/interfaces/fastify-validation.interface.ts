export interface IFastifySchemaValidationError {
  instancePath: string;
  schemaPath: string;
  keyword: string;
  params: Record<string, unknown>;
  message?: string;
  schema?: unknown;
  parentSchema?: Record<string | symbol, unknown>;
  data?: unknown;
}

export interface IFastifySchemaError {
  validation: IFastifySchemaValidationError[];
  validationContext: string;
}

export interface IValidationErrorDetail {
  field: string;
  value: unknown;
  message: string;
  constraint: string;
  originalMessage: string | undefined;
}
