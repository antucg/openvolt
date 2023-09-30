import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import dayjs from 'dayjs'

import 'dotenv/config'
import './utils/dayjs.init'

import { getMeter, getConsumptionData } from './services/openVoltService'
import {
  getCarbonIntensityForInterval,
  getGenerationMixForInterval,
} from './services/carbonIntensitityService'
import { calculateConsumption } from './services/consumptionCalculatorService'
import { printConsumptionData } from './services/printService'

/**
 * This values are hardcoded for the sake of simplicity. In a real world scenario
 * they would be part of a payload in a request.
 */
const START_DATE = dayjs('2023-01-01').utc(true)
const END_DATE = dayjs('2023-02-01').utc(true)
// Small hack so the API doesn't complain about time range
const CARBON_INTENSITY_START_DATE = dayjs('2023-01-01T00:00:01').utc(true)
const CARBON_INTENSITY_END_DATE = dayjs('2023-02-01T00:00:00').utc(true)

/**
 * Get meter information and its consumption data.
 */
const readMeterCosumptionData = () =>
  pipe(
    getMeter(process.env.OPENVOLT_METER_ID!),
    TE.chain(meter =>
      getConsumptionData({
        meter,
        granularity: 'hh',
        startDate: START_DATE,
        endDate: END_DATE,
      }),
    ),
  )

const initApp = async () => {
  console.log('\nLoading data (this could take a few seconds ...)\n')
  await pipe(
    TE.Do,
    TE.bind('consumptionPerInterval', readMeterCosumptionData),
    TE.bind('carbonIntensityPerInterval', () =>
      getCarbonIntensityForInterval(CARBON_INTENSITY_START_DATE, CARBON_INTENSITY_END_DATE),
    ),
    TE.bind('generationMixPerInterval', () =>
      getGenerationMixForInterval(CARBON_INTENSITY_START_DATE, CARBON_INTENSITY_END_DATE),
    ),
    TE.bindW(
      'processedData',
      ({ consumptionPerInterval, carbonIntensityPerInterval, generationMixPerInterval }) =>
        TE.fromEither(
          calculateConsumption({
            consumptionData: consumptionPerInterval,
            carbonIntensityData: carbonIntensityPerInterval,
            generationMixData: generationMixPerInterval,
          }),
        ),
    ),
  )().then(
    E.fold(
      error => {
        console.log('Error getting remote data')
        console.log(error)
        console.log(`\nRetrying...\n`)
        initApp()
      },
      ({ consumptionPerInterval, processedData }) => {
        printConsumptionData({
          startInterval: consumptionPerInterval.startInterval,
          endInterval: consumptionPerInterval.endInterval,
          data: processedData,
        })
      },
    ),
  )
}

initApp()
