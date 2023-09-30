import dayjs from 'dayjs'
import { pipe } from 'fp-ts/function'
import * as E from 'fp-ts/Either'

import {
  processCarbonIntensityPerDay,
  processGenerationMixPerDay,
  processCosumptionPerDay,
  calculateConsumption,
} from '../src/services/consumptionCalculatorService'
import { TCarbonIntensityData, TConsumptionData, TFuel, TGenerationMixData } from '../src/types'

describe('processCosumptionPerDay', () => {
  it('should return the total consumption per day', () => {
    const consumptionData: TConsumptionData = {
      startInterval: dayjs('2022-01-01T00:00:00Z'),
      endInterval: dayjs('2022-01-02T00:30:00Z'),
      granularity: 'hh',
      data: [
        {
          start_interval: dayjs('2022-01-01T00:00:00Z'),
          meter_id: '1',
          meter_number: '11',
          customer_id: '2',
          consumption: '10',
          consumption_units: 'kWh',
        },
        {
          start_interval: dayjs('2022-01-01T00:30:00Z'),
          meter_id: '1',
          meter_number: '11',
          customer_id: '2',
          consumption: '20',
          consumption_units: 'kWh',
        },
        {
          start_interval: dayjs('2022-01-02T00:00:00Z'),
          meter_id: '1',
          meter_number: '11',
          customer_id: '2',
          consumption: '30',
          consumption_units: 'kWh',
        },
        {
          start_interval: dayjs('2022-01-02T00:30:00Z'),
          meter_id: '1',
          meter_number: '11',
          customer_id: '2',
          consumption: '40',
          consumption_units: 'kWh',
        },
      ],
    }

    const result = processCosumptionPerDay(consumptionData)

    expect(result).toEqual({
      '2022-01-01': [10, 20],
      '2022-01-02': [30, 40],
    })
  })
})

describe('processCarbonIntensityPerDay', () => {
  it('should return the average carbon intensity per day', () => {
    const carbonIntensityData: TCarbonIntensityData = {
      data: [
        {
          from: dayjs('2022-01-01T00:00:00Z'),
          to: dayjs('2022-01-01T00:30:00Z'),
          intensity: { actual: 100, forecast: 100, index: 'moderate' },
        },
        {
          from: dayjs('2022-01-01T00:30:00Z'),
          to: dayjs('2022-01-01T01:00:00Z'),
          intensity: { actual: 200, forecast: 200, index: 'moderate' },
        },
        {
          from: dayjs('2022-01-02T00:00:00Z'),
          to: dayjs('2022-01-02T00:30:00Z'),
          intensity: { actual: 300, forecast: 300, index: 'moderate' },
        },
        {
          from: dayjs('2022-01-02T00:30:00Z'),
          to: dayjs('2022-01-02T01:00:00Z'),
          intensity: { actual: 400, forecast: 400, index: 'moderate' },
        },
      ],
    }

    const result = processCarbonIntensityPerDay(carbonIntensityData)

    expect(result).toEqual({
      '2022-01-01': [100, 200],
      '2022-01-02': [300, 400],
    })
  })
})

describe('processGenerationMixPerDay', () => {
  it('should return the average production for each fuel type per day', () => {
    const generationmixData: TGenerationMixData = {
      data: [
        {
          from: dayjs('2022-01-01T00:00:00Z'),
          to: dayjs('2022-01-01T00:30:00Z'),
          generationmix: [
            { fuel: 'gas', perc: 10 },
            { fuel: 'coal', perc: 20 },
            { fuel: 'biomass', perc: 30 },
            { fuel: 'nuclear', perc: 40 },
          ],
        },
        {
          from: dayjs('2022-01-01T00:30:00Z'),
          to: dayjs('2022-01-01T01:00:00Z'),
          generationmix: [
            { fuel: 'gas', perc: 20 },
            { fuel: 'coal', perc: 30 },
            { fuel: 'biomass', perc: 40 },
            { fuel: 'nuclear', perc: 10 },
          ],
        },
        {
          from: dayjs('2022-01-02T00:00:00Z'),
          to: dayjs('2022-01-02T00:30:00Z'),
          generationmix: [
            { fuel: 'gas', perc: 30 },
            { fuel: 'coal', perc: 40 },
            { fuel: 'biomass', perc: 10 },
            { fuel: 'nuclear', perc: 20 },
          ],
        },
        {
          from: dayjs('2022-01-02T00:30:00Z'),
          to: dayjs('2022-01-02T01:00:00Z'),
          generationmix: [
            { fuel: 'gas', perc: 40 },
            { fuel: 'coal', perc: 10 },
            { fuel: 'biomass', perc: 20 },
            { fuel: 'nuclear', perc: 30 },
          ],
        },
      ],
    }

    const result = processGenerationMixPerDay(generationmixData)

    expect(result).toEqual({
      '2022-01-01': {
        gas: 15,
        coal: 25,
        biomass: 35,
        nuclear: 25,
        hydro: 0,
        imports: 0,
        other: 0,
        wind: 0,
        solar: 0,
      },
      '2022-01-02': {
        gas: 35,
        coal: 25,
        biomass: 15,
        nuclear: 25,
        hydro: 0,
        imports: 0,
        other: 0,
        wind: 0,
        solar: 0,
      },
    })
  })
})

describe('calculateConsumption', () => {
  it('should return the processed data', () => {
    const consumptionData: TConsumptionData = {
      startInterval: dayjs('2022-01-01T00:00:00Z'),
      endInterval: dayjs('2022-01-01T01:00:00Z'),
      granularity: 'hh',
      data: [
        {
          start_interval: dayjs('2022-01-01T00:00:00.000Z'),
          meter_id: '1',
          meter_number: '11',
          customer_id: '2',
          consumption: '10',
          consumption_units: 'kWh',
        },
        {
          start_interval: dayjs('2022-01-01T00:30:00.000Z'),
          meter_id: '1',
          meter_number: '11',
          customer_id: '2',
          consumption: '20',
          consumption_units: 'kWh',
        },
      ],
    }
    const carbonIntensityData: TCarbonIntensityData = {
      data: [
        {
          from: dayjs('2022-01-01T00:00:00.000Z'),
          to: dayjs('2022-01-01T00:30:00.000Z'),
          intensity: {
            forecast: 100,
            actual: 100,
            index: 'moderate',
          },
        },
        {
          from: dayjs('2022-01-01T00:30:00.000Z'),
          to: dayjs('2022-01-01T01:00:00.000Z'),
          intensity: {
            forecast: 200,
            actual: 200,
            index: 'moderate',
          },
        },
      ],
    }
    const generationMixData: TGenerationMixData = {
      data: [
        {
          from: dayjs('2022-01-01T00:00:00.000Z'),
          to: dayjs('2022-01-01T00:30:00.000Z'),
          generationmix: [
            { fuel: 'gas' as TFuel, perc: 10 },
            { fuel: 'coal' as TFuel, perc: 20 },
          ],
        },
        {
          from: dayjs('2022-01-01T00:30:00.000Z'),
          to: dayjs('2022-01-01T01:00:00.000Z'),
          generationmix: [
            { fuel: 'gas' as TFuel, perc: 30 },
            { fuel: 'coal' as TFuel, perc: 40 },
          ],
        },
      ],
    }

    const expectedProcessedData = {
      '2022-01-01': {
        consumption: 30,
        carbonIntensity: 5000,
        generationMix: {
          gas: 20,
          coal: 30,
          biomass: 0,
          nuclear: 0,
          hydro: 0,
          imports: 0,
          other: 0,
          wind: 0,
          solar: 0,
        },
      },
    }

    pipe(
      calculateConsumption({
        consumptionData,
        carbonIntensityData,
        generationMixData,
      }),
      E.fold(
        () => {
          throw new Error('Error processing data')
        },
        processedData => {
          expect(processedData).toEqual(expectedProcessedData)
        },
      ),
    )
  })
})
