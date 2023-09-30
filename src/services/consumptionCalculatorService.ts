import { pipe } from 'fp-ts/function'
import * as RA from 'fp-ts/ReadonlyArray'
import * as R from 'fp-ts/Record'
import * as E from 'fp-ts/Either'

import {
  TCarbonIntensity,
  TCarbonIntensityData,
  TConsumption,
  TConsumptionData,
  TFuel,
  TGenerationMix,
  TGenerationMixData,
} from '../types'
import { AppError } from '../errors/AppError'

export type ProcessedData = Record<
  string,
  {
    consumption: number
    carbonIntensity: number
    generationMix: Record<TFuel, number>
  }
>

/**
 * Given consumption data in 30 mins interval, group the consumption intervals
 * per day.
 * Exported for testing purposes.
 */
export const processCosumptionPerDay = (
  consumptionData: TConsumptionData,
): Record<string, Array<number>> =>
  pipe(
    consumptionData.data,
    RA.reduce<TConsumption, Record<string, Array<number>>>({}, (acc, record) => {
      const date = record.start_interval.format('YYYY-MM-DD')
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(parseFloat(record.consumption))
      return acc
    }),
  )

/**
 * Given carbon intensity data in 30 mins interval, group the consumption intervals
 * per day.
 * Exported for testing purposes.
 */
export const processCarbonIntensityPerDay = (
  carbonIntensityData: TCarbonIntensityData,
): Record<string, Array<number>> =>
  pipe(
    carbonIntensityData.data,
    RA.reduce<TCarbonIntensity, Record<string, Array<number>>>({}, (acc, record) => {
      const date = record.from.format('YYYY-MM-DD')
      if (!acc[date]) {
        acc[date] = []
      }
      // Save values for each interval in an array
      // Sometimes the actual value can be null
      acc[date].push(record.intensity.actual ?? record.intensity.forecast)
      return acc
    }),
  )

/**
 * Given generation mix data in 30 mins interval, calculates the average production
 * for each fuel type per day.
 * Exported for testing purposes.
 */
export const processGenerationMixPerDay = (
  generationmixData: TGenerationMixData,
): Record<string, Record<TFuel, number>> =>
  pipe(
    generationmixData.data,
    RA.reduce<TGenerationMix, Record<string, Record<TFuel, Array<number>>>>({}, (acc, record) => {
      const date = record.from.format('YYYY-MM-DD')
      if (!acc[date]) {
        acc[date] = {
          gas: [],
          coal: [],
          biomass: [],
          nuclear: [],
          hydro: [],
          imports: [],
          other: [],
          wind: [],
          solar: [],
        }
      }

      // Save percentages for each fuel type in an array
      record.generationmix.forEach(generationMix => {
        acc[date][generationMix.fuel].push(generationMix.perc)
      })

      return acc
    }),
    R.map(generationMixesInADay =>
      pipe(
        generationMixesInADay,
        R.map(generationMixes =>
          pipe(
            generationMixes,
            // Add all percentages for each fuel type
            RA.reduce(0, (acc, perc) => acc + perc),
            // Divide by the amount of records to calculate the average
            accPerc => accPerc / (generationMixes.length || 1),
          ),
        ),
      ),
    ),
  )

/**
 * Given consumption, carbon intensity and generation mix data (in 30 mins
 * intervals), calculates the different parameters accumulating them by day for
 * easier visualization.
 */
export const calculateConsumption = ({
  consumptionData,
  carbonIntensityData,
  generationMixData,
}: {
  consumptionData: TConsumptionData
  carbonIntensityData: TCarbonIntensityData
  generationMixData: TGenerationMixData
}): E.Either<AppError, ProcessedData> => {
  const consumptionPerDay = processCosumptionPerDay(consumptionData)
  const carbonIntensityPerDay = processCarbonIntensityPerDay(carbonIntensityData)
  const generationMixPerDay = processGenerationMixPerDay(generationMixData)

  return pipe(
    consumptionPerDay,
    R.mapWithIndex((date, consumption) => {
      // Small sanity check, we should have the same amount of intervals for each day
      if (consumption.length !== carbonIntensityPerDay[date].length) {
        return E.left(
          `Intervals count don't match ${consumption.length} - ${carbonIntensityPerDay[date].length}]}`,
        )
      }
      return E.right({
        // Total consumption per day
        // kWh
        consumption: consumption.reduce((acc, intervalConsumption) => acc + intervalConsumption, 0),
        // Calculate carbon intensity per interval and accunulate them all in a day
        // grams CO2
        carbonIntensity: carbonIntensityPerDay[date].reduce(
          (acc, intervalCarbonIntensity, index) =>
            acc + intervalCarbonIntensity * consumptionPerDay[date][index],
          0,
        ),
        // { fuel: percentage }
        generationMix: generationMixPerDay[date],
      })
    }),
    R.separate,
    ({ left, right }) => {
      // If the amount of intervals in any of the days don't match, return an error
      if (!R.isEmpty(left)) {
        return E.left(new AppError('Intervals for some days do not match'))
      }
      return E.right(right)
    },
  )
}
