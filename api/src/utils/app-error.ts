export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'AppError';
  }
}
