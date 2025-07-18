import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { FiUser, FiSettings, FiShield } from 'react-icons/fi';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>
          
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center space-x-6 mb-8">
              <img
                src={user?.avatar}
                alt="Avatar"
                className="w-20 h-20 rounded-full"
              />
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{user?.displayName}</h2>
                <p className="text-gray-600">{user?.anonymousId}</p>
                <p className="text-sm text-gray-500">Reputation: {user?.reputation || 0} points</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <FiUser className="text-blue-600 text-xl" />
                  <h3 className="font-semibold text-gray-900">Account Info</h3>
                </div>
                <p className="text-gray-600">Email: {user?.email}</p>
                <p className="text-gray-600">Joined: {new Date(user?.createdAt).toLocaleDateString()}</p>
              </div>
              
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <FiShield className="text-green-600 text-xl" />
                  <h3 className="font-semibold text-gray-900">Privacy</h3>
                </div>
                <p className="text-gray-600">Anonymous ID: {user?.anonymousId}</p>
                <p className="text-gray-600">End-to-end encrypted</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;