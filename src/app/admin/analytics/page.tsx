'use client';

import { useState } from 'react';
import { FiTrendingUp, FiShoppingBag, FiUsers, FiDollarSign } from 'react-icons/fi';

// Mock data for analytics
const mockData = {
  revenue: {
    total: 12500,
    change: 12.5,
    chart: [3000, 3500, 3200, 4000, 3800, 4200, 4500, 4800, 5000, 5200, 5500, 5800]
  },
  orders: {
    total: 245,
    change: 8.2,
    chart: [15, 18, 22, 25, 28, 30, 32, 35, 38, 40, 42, 45]
  },
  customers: {
    total: 120,
    change: 15.3,
    chart: [5, 8, 12, 15, 18, 20, 25, 30, 35, 40, 45, 50]
  },
  products: {
    total: 85,
    change: 5.7,
    chart: [60, 62, 65, 68, 70, 72, 75, 78, 80, 82, 84, 85]
  }
};

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('month');

  // Simple bar chart component
  const BarChart = ({ data, color }: { data: number[], color: string }) => {
    const max = Math.max(...data);
    return (
      <div className="flex items-end space-x-1 h-24">
        {data.map((value, index) => (
          <div
            key={index}
            className={`w-6 rounded-t ${color}`}
            style={{ height: `${(value / max) * 100}%` }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Analytics</h1>
        <select
          className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="week">Last 7 days</option>
          <option value="month">Last 30 days</option>
          <option value="year">Last 12 months</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        {/* Revenue Card */}
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <div className="flex justify-between items-center mb-4">
            <div className="p-3 bg-green-100 rounded-full dark:bg-green-900">
              <FiDollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className={`text-sm font-medium ${mockData.revenue.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {mockData.revenue.change >= 0 ? '+' : ''}{mockData.revenue.change}%
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">${mockData.revenue.total.toLocaleString()}</p>
          <div className="mt-4">
            <BarChart data={mockData.revenue.chart} color="bg-green-500" />
          </div>
        </div>

        {/* Orders Card */}
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <div className="flex justify-between items-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-900">
              <FiShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className={`text-sm font-medium ${mockData.orders.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {mockData.orders.change >= 0 ? '+' : ''}{mockData.orders.change}%
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Orders</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockData.orders.total}</p>
          <div className="mt-4">
            <BarChart data={mockData.orders.chart} color="bg-blue-500" />
          </div>
        </div>

        {/* Customers Card */}
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <div className="flex justify-between items-center mb-4">
            <div className="p-3 bg-purple-100 rounded-full dark:bg-purple-900">
              <FiUsers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className={`text-sm font-medium ${mockData.customers.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {mockData.customers.change >= 0 ? '+' : ''}{mockData.customers.change}%
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Customers</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockData.customers.total}</p>
          <div className="mt-4">
            <BarChart data={mockData.customers.chart} color="bg-purple-500" />
          </div>
        </div>

        {/* Products Card */}
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <div className="flex justify-between items-center mb-4">
            <div className="p-3 bg-pink-100 rounded-full dark:bg-pink-900">
              <FiTrendingUp className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
            <span className={`text-sm font-medium ${mockData.products.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {mockData.products.change >= 0 ? '+' : ''}{mockData.products.change}%
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Products</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockData.products.total}</p>
          <div className="mt-4">
            <BarChart data={mockData.products.chart} color="bg-pink-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Top Products</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-md dark:bg-gray-700"></div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Product {item}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{Math.floor(Math.random() * 100) + 50} sales</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  ${(Math.random() * 1000 + 500).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Recent Orders</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Order #{1000 + item}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    ${(Math.random() * 200 + 50).toFixed(2)}
                  </p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 