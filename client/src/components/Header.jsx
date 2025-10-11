// client/src/components/Header.jsx
import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationsList from './NotificationsList'
import { 
  Menu, 
  X, 
  MessageSquare, 
  Briefcase, 
  User, 
  DollarSign,
  Settings,
  LogOut
} from 'lucide-react'

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  
  const mobileMenuRef = useRef(null)
  const profileMenuRef = useRef(null)

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false)
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsMobileMenuOpen(false)
    setIsProfileMenuOpen(false)
  }

  const navItems = [
    { path: '/', label: 'Home', icon: Briefcase },
    { path: '/search', label: 'Find Work', icon: Briefcase },
  ]

  if (isAuthenticated) {
    navItems.push(
      { path: '/dashboard', label: 'Dashboard', icon: Briefcase },
      { path: '/messages', label: 'Messages', icon: MessageSquare }
    )
  }

  const profileMenuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Briefcase },
    { path: '/messages', label: 'Messages', icon: MessageSquare },
    { path: '/wallet', label: 'Wallet', icon: DollarSign },
    { path: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group"
            onClick={() => {
              setIsMobileMenuOpen(false)
              setIsProfileMenuOpen(false)
            }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Ethio-freelance
              </h1>
              <p className="text-xs text-gray-500 -mt-1">Powered by Altaseb</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  setIsProfileMenuOpen(false)
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="hidden sm:block">
                  <NotificationsList />
                </div>

                {/* User Menu */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsProfileMenuOpen(!isProfileMenuOpen)
                      setIsMobileMenuOpen(false)
                    }}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-sm">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.profile?.firstName || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {user?.role}
                      </p>
                    </div>
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 animate-in slide-in-from-top z-50">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.profile?.firstName} {user?.profile?.lastName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full capitalize">
                            {user?.role}
                          </span>
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-1">
                        {profileMenuItems.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <item.icon className="w-4 h-4 mr-3 text-gray-400" />
                            {item.label}
                          </Link>
                        ))}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    setIsProfileMenuOpen(false)
                  }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary px-4 py-2 text-sm"
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    setIsProfileMenuOpen(false)
                  }}
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden" ref={mobileMenuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsMobileMenuOpen(!isMobileMenuOpen)
                  setIsProfileMenuOpen(false)
                }}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu - FIXED: This should render properly now */}
        {isMobileMenuOpen && (
          <div 
            ref={mobileMenuRef}
            className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg animate-in slide-in-from-top z-40"
          >
            <div className="px-4 py-3 space-y-1">
              {/* Navigation Links */}
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {/* Mobile user actions for authenticated users */}
              {isAuthenticated && (
                <>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-gray-900">Account</p>
                    </div>
                    
                    {/* Profile menu items in mobile */}
                    {profileMenuItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                    
                    {/* Notifications in mobile */}
                    <div className="px-3 py-3">
                      <NotificationsList />
                    </div>

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 w-full px-3 py-3 rounded-lg text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
              
              {/* Auth links for non-authenticated users */}
              {!isAuthenticated && (
                <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
                  <Link
                    to="/login"
                    className="flex items-center justify-center px-3 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center justify-center px-3 py-3 rounded-lg text-base font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </header>
  )
}

export default Header