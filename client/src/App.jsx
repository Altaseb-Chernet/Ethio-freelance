// client/src/App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider } from './context/AuthContext'
import { NotificationsProvider } from './context/NotificationsContext'
import Header from './components/Header'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import SearchResults from './pages/SearchResults'
import JobDetails from './pages/JobDetails'
import CreateJob from './pages/CreateJob'
import FreelancerProfile from './pages/FreelancerProfile'
import Messages from './pages/Messages'
import Wallet from './pages/Wallet'
import AdminPanel from './pages/AdminPanel'



const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationsProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/jobs/:id" element={<JobDetails />} />
                <Route path="/create-job" element={<CreateJob />} />
                <Route path="/profile/:id" element={<FreelancerProfile />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/admin" element={<AdminPanel />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
        </NotificationsProvider>
      </AuthProvider>
      {process.env.NODE_ENV === 'development' && (
    <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}

export default App