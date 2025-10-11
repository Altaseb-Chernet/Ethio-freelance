// client/src/pages/Landing.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  Rocket, 
  Users, 
  Shield, 
  Zap, 
  Star, 
  ArrowRight,
  CheckCircle,
  Brain,
  TrendingUp
} from 'lucide-react'

const Landing = () => {
  const { isAuthenticated } = useAuth()

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Matching',
      description: 'Smart algorithms connect you with perfect clients and projects based on skills and preferences.'
    },
    {
      icon: Zap,
      title: 'Instant Proposals',
      description: 'AI-enhanced proposals that increase your chances of winning projects by up to 300%.'
    },
    {
      icon: Shield,
      title: 'Secure Escrow',
      description: 'Your payments are protected with our secure escrow system until work is completed.'
    },
    {
      icon: TrendingUp,
      title: 'Growth Tools',
      description: 'Analytics and insights to help you grow your freelance business effectively.'
    }
  ]

  const stats = [
    { number: '50K+', label: 'Active Freelancers' },
    { number: '25K+', label: 'Projects Completed' },
    { number: '$10M+', label: 'Paid to Freelancers' },
    { number: '4.9/5', label: 'Client Satisfaction' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
              <Rocket className="w-4 h-4" />
              <span className="text-sm font-medium">The future of freelance work is here</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Build Your
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Dream Career
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto mb-8 leading-relaxed">
              Join the AI-powered freelance marketplace where talent meets opportunity. 
              Smart matching, secure payments, and growth tools all in one platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="group bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-2xl hover:shadow-3xl flex items-center space-x-3"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="group bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-2xl hover:shadow-3xl flex items-center space-x-3"
                  >
                    <span>Start Freelancing</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/login"
                    className="group border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold mb-2">{stat.number}</div>
                  <div className="text-primary-200 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-bounce-gentle"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-bounce-gentle" style={{animationDelay: '2s'}}></div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose Ethio-Freelance?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've built the most advanced platform for modern freelancers and clients
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group card p-8 text-center hover:border-primary-200 transition-all duration-300 hover:transform hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of freelancers who are already building their dream careers on our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to={isAuthenticated ? "/dashboard" : "/register"}
              className="bg-primary-500 hover:bg-primary-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-3"
            >
              <span>{isAuthenticated ? 'Go to Dashboard' : 'Start Free Today'}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/search"
              className="border-2 border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300"
            >
              Browse Projects
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Landing