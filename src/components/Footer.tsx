'use client';

import { FiInstagram, FiFacebook, FiHeart } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="bg-pink-50 dark:bg-pink-950/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-pink-600 dark:text-pink-500 mb-4">MYOU</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Elegant Modest Fashion for the Modern Woman
            </p>
          </div>

          {/* Social Links */}
          <div className="text-center space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Follow Us</h4>
            <div className="flex justify-center space-x-6">
              <motion.a
                href="https://www.instagram.com/m.you_brand?igsh=MXNzZDd3b3oxZHYxdw=="
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-600 hover:text-pink-700 dark:text-pink-500 dark:hover:text-pink-400"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiInstagram className="w-6 h-6" />
              </motion.a>
              <motion.a
                href="https://www.facebook.com/share/16BPebTTL7/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-600 hover:text-pink-700 dark:text-pink-500 dark:hover:text-pink-400"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiFacebook className="w-6 h-6" />
              </motion.a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-center md:text-right">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact</h4>
            <p className="text-gray-600 dark:text-gray-400">
              Questions? Get in touch with us
            </p>
            <a
              href="mailto:contact@myou.com"
              className="text-pink-600 hover:text-pink-700 dark:text-pink-500 dark:hover:text-pink-400"
            >
              contact@myou.com
            </a>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2 flex-wrap justify-center mb-4 md:mb-0">
              <span>© 2025 MYOU.</span>
              <div className="flex items-center gap-2">
                <span>Made with</span>
                <FiHeart className="w-4 h-4 text-pink-600 dark:text-pink-500" />
                <span>by</span>
                <motion.a
                  href="https://www.instagram.com/abd_elrahman_shaban.24?igsh=MXZrenM1aGVhY3I2dA%3D%3D&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-600 hover:text-pink-700 dark:text-pink-500 dark:hover:text-pink-400 font-medium"
                  whileHover={{ scale: 1.05 }}
                >
                  Abdelrahman Shaban
                </motion.a>
              </div>
            </div>
            <div className="text-center md:text-right">
              All rights reserved
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 