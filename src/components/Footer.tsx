"use client";

import { FiInstagram, FiFacebook, FiHeart } from "react-icons/fi";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="mt-auto bg-pink-200">
      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <h3 className="mb-4 text-2xl font-bold text-pink-600">MYOU</h3>
            <p className="text-gray-600">
              Elegant Modest Fashion for the Modern Woman
            </p>
          </div>

          {/* Social Links */}
          <div className="space-y-4 text-center">
            <h4 className="mb-4 text-lg font-semibold text-gray-900">
              Follow Us
            </h4>
            <div className="flex justify-center space-x-6">
              <motion.a
                href="https://www.instagram.com/m.you_brand?igsh=MXNzZDd3b3oxZHYxdw=="
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-600 hover:text-pink-600 dark:text-pink-600 dark:hover:text-pink-600"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiInstagram className="w-6 h-6" />
              </motion.a>
              <motion.a
                href="https://www.facebook.com/share/16BPebTTL7/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-600 hover:text-pink-600 dark:text-pink-600 dark:hover:text-pink-600"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiFacebook className="w-6 h-6" />
              </motion.a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-center md:text-right">
            <h4 className="mb-4 text-lg font-semibold text-gray-900">
              Contact
            </h4>
            <p className="text-gray-600 mb-2">Questions? Get in touch with us</p>
            <a
              href="https://wa.me/201070831335"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-600 flex items-center justify-center md:justify-end gap-2 hover:text-pink-600 dark:text-pink-600 dark:hover:text-pink-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></svg>
              WhatsApp Us
            </a>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="pt-8 mt-12 border-t border-gray-200">
          <div className="flex flex-col justify-between items-center text-sm text-gray-600 md:flex-row">
            <div className="flex flex-wrap gap-2 justify-center items-center mb-4 md:mb-0">
              <span>© 2025 MYOU.</span>
              <div className="flex gap-2 items-center">
                <span>Made with</span>
                <FiHeart className="w-4 h-4 text-pink-600" />
                <span>by</span>
                <motion.a
                  href="https://www.instagram.com/abd_elrahman_shaban.24?igsh=MXZrenM1aGVhY3I2dA%3D%3D&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-pink-600 hover:text-pink-600"
                  whileHover={{ scale: 1.05 }}
                >
                  Abdelrahman Shaban
                </motion.a>
              </div>
            </div>
            <div className="text-center md:text-right">All rights reserved</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
