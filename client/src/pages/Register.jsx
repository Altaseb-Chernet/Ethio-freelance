// client/src/pages/Register.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Mail, Lock, User, Briefcase, UserCheck, ArrowRight } from 'lucide-react'

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'freelancer',
    firstName: '',
    lastName: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await register(formData)

    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">AL</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Ethio-Freelance</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-gray-600">
            Join thousands of freelancers and clients
          </p>
        </div>

        <div className="card p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I want to join as a
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'freelancer' }))}
                  className={`p-4 border-2 rounded-xl text-center transition-all duration-200 ${
                    formData.role === 'freelancer'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  <UserCheck className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">Freelancer</div>
                  <div className="text-xs opacity-75">Find work</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'client' }))}
                  className={`p-4 border-2 rounded-xl text-center transition-all duration-200 ${
                    formData.role === 'client'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  <Briefcase className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">Client</div>
                  <div className="text-xs opacity-75">Hire talent</div>
                </button>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="First name"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input pl-10 pr-10"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 6 characters long
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>Create account</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register