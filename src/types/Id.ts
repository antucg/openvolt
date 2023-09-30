import * as E from 'fp-ts/Either'
import * as Eq_ from 'fp-ts/Eq'
import { pipe } from 'fp-ts/function'
import { Eq } from 'fp-ts/string'
import * as t from 'io-ts'

export const Id = new t.Type<string, string>(
  'Id',
  (input): input is string => typeof input === 'string' && input.trim().length > 0,
  (input, ctx) =>
    pipe(
      t.string.validate(input, ctx),
      E.chain(str => {
        const trimmedStr = str.trim()
        if (trimmedStr.length > 0) {
          return t.success(trimmedStr)
        }
        return t.failure(str, ctx)
      }),
    ),
  t.identity,
)
export type Id = t.TypeOf<typeof Id>
export { Eq }

export const makeEqById = <T extends { id: Id }>() =>
  pipe(
    Eq,
    Eq_.contramap(({ id }: T) => id),
  )
