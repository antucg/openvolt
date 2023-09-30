import { ValidationError } from 'io-ts'
import { failure } from 'io-ts/lib/PathReporter'

export class DecodeError extends Error {
  constructor(error: Array<ValidationError>) {
    super(failure(error).join('\n'))
  }
}

export const handleDecodeError = (error: Array<ValidationError>) => new DecodeError(error)
