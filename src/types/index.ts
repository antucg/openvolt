import * as t from 'io-ts'

import { Id } from './Id'
import { DayJsFromString } from './DayJsFromString'
import { nullable } from './tools'

/**
 * Openvolt Types
 */

export const Customer = t.type(
  {
    _id: Id,
    object: t.string,
    account: Id,
    name: t.string,
    email: t.string,
    address: t.string,
    notes: t.array(t.string),
    created_at: DayJsFromString,
    __v: t.number,
  },
  'Customer',
)
export type TCustomer = t.TypeOf<typeof Customer>

export const Meter = t.type(
  {
    _id: Id,
    object: t.string,
    account: Id,
    meter_number: t.string,
    customer: Customer,
    address: t.string,
    update_frequency: t.string,
    data_source: t.string,
    status: t.string,
    notes: t.array(t.string),
    created_at: DayJsFromString,
    __v: t.number,
    description: t.string,
  },
  'Meter',
)

export type TMeter = t.TypeOf<typeof Meter>

export const Granularity = t.keyof(
  {
    hh: null,
    day: null,
    week: null,
    month: null,
    year: null,
  },
  'Granularity',
)
export type TGranularity = t.TypeOf<typeof Granularity>

export const Consumption = t.type(
  {
    start_interval: DayJsFromString,
    meter_id: Id,
    meter_number: t.string,
    customer_id: Id,
    consumption: t.string,
    consumption_units: t.string,
  },
  'Consumption',
)

export type TConsumption = t.TypeOf<typeof Consumption>

export const ConsumptionData = t.type(
  {
    startInterval: DayJsFromString,
    endInterval: DayJsFromString,
    granularity: Granularity,
    data: t.array(Consumption),
  },
  'ConsumptionData',
)

export type TConsumptionData = t.TypeOf<typeof ConsumptionData>

/**
 * Carbon Intensity Types
 */

export const IntensityIndex = t.keyof({
  'very low': null,
  'low': null,
  'moderate': null,
  'high': null,
  'very high': null,
})

export type TIntensityIndex = t.TypeOf<typeof IntensityIndex>

export const CarbonIntensity = t.type(
  {
    from: DayJsFromString,
    to: DayJsFromString,
    intensity: t.type(
      {
        forecast: t.number,
        actual: nullable(t.number),
        index: IntensityIndex,
      },
      'Intensity',
    ),
  },
  'CarbonIntensity',
)

export type TCarbonIntensity = t.TypeOf<typeof CarbonIntensity>

export const CarbonIntensityData = t.type(
  {
    data: t.array(CarbonIntensity),
  },
  'CarbonIntensityData',
)

export type TCarbonIntensityData = t.TypeOf<typeof CarbonIntensityData>

export const Fuel = t.keyof({
  gas: null,
  coal: null,
  biomass: null,
  nuclear: null,
  hydro: null,
  imports: null,
  other: null,
  wind: null,
  solar: null,
})

export type TFuel = t.TypeOf<typeof Fuel>

export const GenerationMix = t.type({
  from: DayJsFromString,
  to: DayJsFromString,
  generationmix: t.array(
    t.type(
      {
        fuel: Fuel,
        perc: t.number,
      },
      'GenerationMixFuel',
    ),
    'GenerationMix',
  ),
})

export type TGenerationMix = t.TypeOf<typeof GenerationMix>

export const GenerationMixData = t.type(
  {
    data: t.array(GenerationMix),
  },
  'GenerationMixData',
)

export type TGenerationMixData = t.TypeOf<typeof GenerationMixData>

/**
 * Consumption computation types
 */

export const DataPerDay = t.record(
  t.string,
  t.type({
    consumption: t.number,
    carbonIntensity: t.number,
    generationMix: t.record(Fuel, t.number),
  }),
)

export type TDataPerDay = t.TypeOf<typeof DataPerDay>
