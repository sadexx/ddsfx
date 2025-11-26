export interface ITransformableStatic {
  transform?(data: unknown): unknown;
  validate?(data: unknown): void;
}
