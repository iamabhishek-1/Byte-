import React from 'react';
import { motion } from 'framer-motion';
import { FiBot, FiSend } from 'react-icons/fi';

const ChatBot = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">AI Assistant</h1>
          
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <FiBot className="text-xl" />
                </div>
                <div>
                  <h2 className="font-semibold">StudyShare AI</h2>
                  <p className="text-sm opacity-90">Your personal study assistant</p>
                </div>
              </div>
            </div>
            
            <div className="p-8 text-center">
              <FiBot className="text-6xl text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                AI Assistant Coming Soon
              </h2>
              <p className="text-gray-600">
                Get instant help from our AI tutor for any subject
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChatBot;