'use client';

import { useState } from 'react';
import { FiUser, FiMail, FiLock, FiEdit2, FiSave } from 'react-icons/fi';

export default function AdminProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'Administrator',
    joinDate: 'January 1, 2023',
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Profile</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
        >
          {isEditing ? (
            <>
              <FiSave className="mr-2 h-4 w-4" />
              Save Changes
            </>
          ) : (
            <>
              <FiEdit2 className="mr-2 h-4 w-4" />
              Edit Profile
            </>
          )}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-pink-100 dark:bg-pink-900/50 flex items-center justify-center">
              <span className="text-2xl font-medium text-pink-600 dark:text-pink-500">A</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{profile.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{profile.role}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <div className="mt-1 flex items-center">
                <FiUser className="h-5 w-5 text-gray-400 mr-2" />
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="block w-full pl-3 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{profile.name}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="mt-1 flex items-center">
                <FiMail className="h-5 w-5 text-gray-400 mr-2" />
                {isEditing ? (
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="block w-full pl-3 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white">{profile.email}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Role
              </label>
              <div className="mt-1 flex items-center">
                <FiUser className="h-5 w-5 text-gray-400 mr-2" />
                <p className="text-gray-900 dark:text-white">{profile.role}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Join Date
              </label>
              <div className="mt-1 flex items-center">
                <FiUser className="h-5 w-5 text-gray-400 mr-2" />
                <p className="text-gray-900 dark:text-white">{profile.joinDate}</p>
              </div>
            </div>

            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Change Password
                </label>
                <div className="mt-1 flex items-center">
                  <FiLock className="h-5 w-5 text-gray-400 mr-2" />
                  <input
                    type="password"
                    placeholder="New password"
                    className="block w-full pl-3 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 