import React from 'react';

const FeatureItem = ({ icon, title, description }) => {
  return (
    <div className="flex">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white">
          {icon}
        </div>
      </div>
      <div className="ml-4">
        <h3 className="text-lg font-medium text-gray-100">{title}</h3>
        <p className="mt-2 text-gray-400">{description}</p>
      </div>
    </div>
  );
};

export default FeatureItem;