import axios from 'axios'

const api = axios.create({
  baseURL: window.location.origin,
  timeout: 10000,
})

export default api

