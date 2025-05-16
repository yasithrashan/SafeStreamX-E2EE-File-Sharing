import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <div className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 pb-10 sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32"
        >
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 xl:mt-28">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
                <span className="text-gray-100 block">Secure File Sharing with</span>
                <span className="text-indigo-400 block">End-to-End Encryption</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-sm sm:text-base md:text-lg text-gray-400 md:mt-5 md:max-w-2xl">
                Share files with confidence. Your data is encrypted before it leaves your device,
                ensuring only the intended recipients can access your information.
              </p>
              <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto flex items-center justify-center px-6 py-2 md:px-10 md:py-4 border border-transparent text-sm md:text-lg font-medium rounded-md bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Get Started
                </motion.button>
                <a
                  href="#features"
                  className="mt-3 sm:mt-0 sm:ml-3 w-full sm:w-auto flex items-center justify-center px-6 py-2 md:px-10 md:py-4 border border-transparent text-sm md:text-lg font-medium rounded-md bg-gray-800 text-gray-100"
                >
                  Learn More
                </a>
              </div>
            </div>
          </main>
        </motion.div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 w-full text-gray-800">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" fill="currentColor">
          <path d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,213.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </div>
  );
};

export default Hero;
