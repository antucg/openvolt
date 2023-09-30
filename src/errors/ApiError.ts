export class ApiError extends Error {
  constructor(public readonly message: string) {
    super(message)
  }
}
