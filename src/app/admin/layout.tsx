'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  FiHome, 
  FiUsers, 
  FiShoppingBag, 
  FiBarChart2, 
  FiSettings,
  FiMenu,
  FiX,
  FiLogOut,
  FiUser
} from 'react-icons/fi';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: FiHome },
    { name: 'Users', href: '/admin/users', icon: FiUsers },
    { name: 'Products', href: '/admin/products', icon: FiShoppingBag },
    { name: 'Analytics', href: '/admin/analytics', icon: FiBarChart2 },
    { name: 'Settings', href: '/admin/settings', icon: FiSettings },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transform 
                      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                      transition-transform duration-300 ease-in-out lg:translate-x-0`}>
        <div className="flex items-center justify-between h-16 px-4 border-b dark:border-gray-700">
          <Link href="/admin" className="flex items-center space-x-3">
            <Image
              src="/icons/myoulog.png"
              alt="MYOU"
              width={32}
              height={32}
              className="object-contain"
            />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Admin</span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-600 dark:text-gray-400 
                     dark:hover:text-gray-300 focus:outline-none lg:hidden"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md
                          ${isActive
                            ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/50 dark:text-pink-500'
                            : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                          }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5
                            ${isActive
                              ? 'text-pink-600 dark:text-pink-500'
                              : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'
                            }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t dark:border-gray-700">
          <button
            onClick={() => {/* Handle logout */}}
            className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 
                     rounded-md hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <FiLogOut className="w-5 h-5 mr-3 text-gray-400" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className={`lg:pl-64 flex flex-col min-h-screen transition-all duration-300 ${isSidebarOpen ? 'pl-64' : 'pl-0'}`}>
        {/* Top header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className={`p-2 rounded-md text-gray-500 hover:text-gray-600 dark:text-gray-400 
                       dark:hover:text-gray-300 focus:outline-none ${isSidebarOpen ? 'hidden' : ''} lg:hidden`}
            >
              <FiMenu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">Admin User</span>
              <Link href="/auth/signup" className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/50 flex items-center justify-center hover:bg-pink-200 dark:hover:bg-pink-900/70 transition-colors">
                <FiUser className="w-5 h-5 text-pink-600 dark:text-pink-500" />
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
} 