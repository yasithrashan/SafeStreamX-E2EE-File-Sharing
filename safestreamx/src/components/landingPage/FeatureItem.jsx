import React from 'react';
import { motion } from 'framer-motion';

const FeatureItem = ({ icon, title, description }) => {
  return (
    <motion.div
      className="flex"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex-shrink-0">
        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white">
          {icon}
        </div>
      </div>
      <div className="ml-4">
        <h3 className="text-base sm:text-lg font-medium text-gray-100">{title}</h3>
        <p className="mt-2 text-sm sm:text-base text-gray-400">{description}</p>
      </div>
    </motion.div>
  );
};

export default FeatureItem;
