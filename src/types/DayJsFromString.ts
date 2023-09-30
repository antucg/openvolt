import dayjs from 'dayjs'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import * as t from 'io-ts'

export const DayJsFromString = new t.Type<dayjs.Dayjs, string>(
  'DayJsFromString',
  (input): input is dayjs.Dayjs => dayjs.isDayjs(input),
  (input, ctx) =>
    pipe(
      t.string.validate(input, ctx),
      E.chain(str => {
        const date = dayjs.utc(/^\d+$/.test(str) ? Number(str) : str)
        return date.isValid() ? t.success(date) : t.failure(str, ctx)
      }),
    ),
  date => date.toJSON(),
)
export type DayJsFromString = t.TypeOf<typeof DayJsFromString>
