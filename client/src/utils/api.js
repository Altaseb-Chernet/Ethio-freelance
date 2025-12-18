// client/src/utils/api.js
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle responses and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API functions
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
}

export const jobsAPI = {
  getAll: (params = {}) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  acceptBid: (jobId, bidId) => api.post(`/jobs/${jobId}/accept-bid`, { bidId }),
}

export const bidsAPI = {
  create: (jobId, data) => api.post(`/bids/${jobId}`, data),
  getMyBids: () => api.get('/bids/my-bids'),
  update: (id, data) => api.put(`/bids/${id}`, data),
}

export const aiAPI = {
  enhanceProposal: (data) => api.post('/ai/enhance-proposal', data),
  matchJob: (jobId) => api.get(`/ai/match-job/${jobId}`),
  suggestPrice: (data) => api.post('/ai/suggest-price', data),
}

export const usersAPI = {
  // existing user endpoints
  getProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  searchFreelancers: (params) => api.get('/users/search/freelancers', { params }),

  // 🧠 add these admin endpoints
  getAll: (params = {}) => api.get('/admin/users', { params }),
  banUser: (id, reason = 'Violation of rules') => api.patch(`/admin/users/${id}/ban`, { reason }),
  unbanUser: (id) => api.patch(`/admin/users/${id}/unban`),
  getDashboard: () => api.get('/admin/dashboard'),
  getFlagged: () => api.get('/admin/flagged'),
}


export const chatAPI = {
  getContracts: () => api.get('/chat/contracts'),
  getMessages: (contractId) => api.get(`/chat/messages/${contractId}`),
  sendMessage: (contractId, data) => api.post(`/chat/messages/${contractId}`, data),
}

export const paymentsAPI = {
  getWallet: () => api.get('/payments/wallet'),
  fundJob: (jobId, data) => api.post(`/payments/fund-job/${jobId}`, data),
  releaseFunds: (jobId) => api.post(`/payments/release-funds/${jobId}`),
  refundJob: (jobId) => api.post(`/payments/refund-job/${jobId}`),
}