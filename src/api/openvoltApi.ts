import { Dayjs } from 'dayjs'
import { TGranularity, TConsumptionData, TMeter } from '../types'
import { Id } from '../types/Id'
import { openvoltHttpClient } from './httpClient'

export const getMeterById = (id: Id): Promise<TMeter> =>
  openvoltHttpClient.get(`/v1/meters/${id}`).then(response => response.data)

export const getIntervalData = ({
  meter,
  granularity,
  startDate,
  endDate,
}: {
  meter: TMeter
  granularity: TGranularity
  startDate: Dayjs
  endDate: Dayjs
}): Promise<TConsumptionData> =>
  openvoltHttpClient
    .get(`/v1/interval-data`, {
      params: {
        meter_number: meter.meter_number,
        customer_id: meter.customer._id,
        granularity: granularity,
        start_date: startDate.format('YYYY-MM-D'),
        end_date: endDate.format('YYYY-MM-D'),
      },
    })
    .then(response => response.data)
