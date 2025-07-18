import React from 'react';
import { motion } from 'framer-motion';
import { FiBook, FiSearch, FiFilter } from 'react-icons/fi';

const NotesMarketplace = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Notes Marketplace</h1>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Upload Notes
            </button>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <FiBook className="text-6xl text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Notes Marketplace Coming Soon
            </h2>
            <p className="text-gray-600">
              Buy and sell high-quality study notes from fellow students
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotesMarketplace;