import { Dayjs } from 'dayjs'
import { carbonIntensityHttpClient } from './httpClient'
import { TCarbonIntensityData, TGenerationMixData } from '../types'

const DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss'

export const getCarbonIntensity = (
  start_interval: Dayjs,
  end_interval: Dayjs,
): Promise<TCarbonIntensityData> =>
  carbonIntensityHttpClient
    .get(`/intensity/${start_interval.format(DATE_FORMAT)}/${end_interval.format(DATE_FORMAT)}`)
    .then(response => response.data)

export const getGenerationMix = (
  start_interval: Dayjs,
  end_interval: Dayjs,
): Promise<TGenerationMixData> =>
  carbonIntensityHttpClient
    .get(`/generation/${start_interval.format(DATE_FORMAT)}/${end_interval.format(DATE_FORMAT)}`)
    .then(response => response.data)
