import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import * as RA from 'fp-ts/ReadonlyArray'

import { getIntervalData, getMeterById } from '../api/openvoltApi'
import { Id } from '../types/Id'
import { ApiError } from '../errors/ApiError'
import { ConsumptionData, Meter, TGranularity, TMeter } from '../types'
import { handleDecodeError } from '../errors/DecodeError'
import { Dayjs } from 'dayjs'

export const getMeter = (id: Id) =>
  pipe(
    TE.tryCatch(
      () => getMeterById(id),
      error => new ApiError(`Error fetching meter with id ${id}: ${error}`),
    ),
    // Validate that API data has proper format
    TE.chain(result => pipe(result, Meter.decode, E.mapLeft(handleDecodeError), TE.fromEither)),
  )

export const getConsumptionData = ({
  meter,
  granularity,
  startDate,
  endDate,
}: {
  meter: TMeter
  granularity: TGranularity
  startDate: Dayjs
  endDate: Dayjs
}) =>
  pipe(
    TE.tryCatch(
      () => getIntervalData({ meter, granularity, startDate, endDate }),
      error =>
        new ApiError(`Error fetching consumption data for meter ${meter.meter_number}: ${error}`),
    ),
    // Remove last item in data since it belongs to the following day.
    // This way the intervals we have will fall within [startDate, endDate) range.
    TE.map(result => ({
      ...result,
      data: pipe(result.data, RA.dropRight(1)),
    })),
    TE.chainW(result =>
      // Validate that API data has proper format
      pipe(result, ConsumptionData.decode, E.mapLeft(handleDecodeError), TE.fromEither),
    ),
  )
