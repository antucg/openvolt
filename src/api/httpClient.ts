import axios from 'axios'

export const openvoltHttpClient = axios.create({
  baseURL: process.env.OPENVOLT_API_URL,
})

openvoltHttpClient.defaults.headers.common['x-api-key'] = process.env.OPENVOLT_API_KEY

export const carbonIntensityHttpClient = axios.create({
  baseURL: process.env.CARBON_INTENSITY_API_URL,
})
