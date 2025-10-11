// client/src/components/Footer.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Heart, Github, Twitter, Linkedin } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-gray-900" />
              </div>
              <span className="text-xl font-bold">Ethio-Freelance</span>
            </Link>
            <p className="text-gray-400 max-w-md text-sm leading-relaxed">
              The future of freelance work is here. Connect with top talent, leverage AI-powered tools, 
              and build your dream projects with our cutting-edge marketplace.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/search" className="hover:text-white transition-colors">Find Work</Link></li>
              <li><Link to="/search" className="hover:text-white transition-colors">Find Talent</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link to="/messages" className="hover:text-white transition-colors">Messages</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 Ethio-Freelance. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 text-sm text-gray-400 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer