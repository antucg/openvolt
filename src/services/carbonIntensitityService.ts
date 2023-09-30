import { Dayjs } from 'dayjs'
import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import * as RA from 'fp-ts/ReadonlyArray'

import { CarbonIntensityData, GenerationMixData } from '../types'
import { getCarbonIntensity, getGenerationMix } from '../api/carbonIntensityApi'
import { ApiError } from '../errors/ApiError'
import { handleDecodeError } from '../errors/DecodeError'

export const getCarbonIntensityForInterval = (start_interval: Dayjs, end_interval: Dayjs) =>
  pipe(
    TE.tryCatch(
      () => getCarbonIntensity(start_interval, end_interval),
      error =>
        new ApiError(
          `Error fetching carbon intensity for interval ${start_interval} - ${end_interval}: ${error}`,
        ),
    ),
    // Remove first item in data since it belongs to the previous day.
    // This way the intervals we have will fall within [startDate, endDate) range.
    TE.map(result => ({
      ...result,
      data: pipe(result.data, RA.dropLeft(1)),
    })),
    TE.chainW(result =>
      // Validate that API data has proper format
      pipe(result, CarbonIntensityData.decode, E.mapLeft(handleDecodeError), TE.fromEither),
    ),
  )

export const getGenerationMixForInterval = (start_interval: Dayjs, end_interval: Dayjs) =>
  pipe(
    TE.tryCatch(
      () => getGenerationMix(start_interval, end_interval),
      error =>
        new ApiError(
          `Error fetching generation mix for interval ${start_interval} - ${end_interval}: ${error}`,
        ),
    ),
    TE.chainW(result =>
      // Validate that API data has proper format
      pipe(result, GenerationMixData.decode, E.mapLeft(handleDecodeError), TE.fromEither),
    ),
  )
