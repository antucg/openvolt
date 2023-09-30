import { Dayjs } from 'dayjs'

import { ProcessedData } from './consumptionCalculatorService'
import { TFuel } from '../types'

export const printConsumptionData = ({
  data,
  startInterval,
  endInterval,
}: {
  data: ProcessedData
  startInterval: Dayjs
  endInterval: Dayjs
}) => {
  console.log(`Consumption data for interval: ${startInterval} - ${endInterval}`)
  Object.keys(data).forEach(date => {
    console.log(`- ${date}:`)
    console.log(`\tConsumption: ${data[date].consumption.toFixed(2)} kWh`)
    console.log(`\tCarbon Intensity: ${(data[date].carbonIntensity / 1000).toFixed(2)} kg CO2`)
    console.log(`\tGeneration Mix:`)
    Object.keys(data[date].generationMix).forEach(fuel => {
      console.log(`\t\t${fuel}: ${data[date].generationMix[fuel as TFuel].toFixed(2)}%`)
    })
  })
}
