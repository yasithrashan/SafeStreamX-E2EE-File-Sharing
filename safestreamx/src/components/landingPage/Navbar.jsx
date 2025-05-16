import React from 'react';
import { motion } from 'framer-motion';

const Navbar = () => {
  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-gray-900 border-b border-gray-700 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center text-indigo-400">
              <svg className="h-8 w-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M20.618 5.984C17.45 2.667 12.442 2.614 9.207 5.856C5.973 9.097 5.941 14.097 9.145 17.373L12 20.294L14.855 17.373C18.059 14.097 18.027 9.097 14.793 5.856C13.234 4.29 11.14 3.514 9.029 3.525" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  stroke="currentColor" />
              </svg>
              <span className="text-lg sm:text-xl font-bold">SafeStreamX</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm font-medium shadow-sm transition-colors">
              Log In
            </button>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm font-medium shadow-sm transition-colors">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
