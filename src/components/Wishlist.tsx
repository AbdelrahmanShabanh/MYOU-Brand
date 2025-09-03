'use client';

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { removeFromWishlist, toggleWishlist } from '@/store/slices/wishlistSlice';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FiX, FiShoppingBag } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

const Wishlist = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { items, isOpen } = useAppSelector((state) => state.wishlist);

  const handleProceedToOrder = (productId: string) => {
    dispatch(toggleWishlist());
    router.push(`/product/${productId}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(toggleWishlist())}
            className="fixed inset-0 z-50 backdrop-blur-sm bg-black/30"
          />
          
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="flex fixed top-0 right-0 z-50 flex-col w-full max-w-md h-full bg-white shadow-xl dark:bg-gray-900"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Wishlist</h2>
              <button
                onClick={() => dispatch(toggleWishlist())}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-4 py-6 sm:px-6">
              {items.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mb-4 text-gray-500 dark:text-gray-400">Your wishlist is empty</div>
                  <button
                    onClick={() => {
                      dispatch(toggleWishlist());
                      router.push('/');
                    }}
                    className="font-medium text-pink-600 hover:text-pink-500"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {items.map((item) => (
                    <li key={item.id} className="flex py-6">
                      <div className="overflow-hidden relative flex-shrink-0 w-24 h-24 rounded-md">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>

                      <div className="flex flex-col flex-1 ml-4">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                            <h3>{item.name}</h3>
                            <button
                              onClick={() => dispatch(removeFromWishlist(item.id))}
                              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                            >
                              <FiX className="w-5 h-5" />
                            </button>
                          </div>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            LE {item.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex flex-1 items-end">
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleProceedToOrder(item.id)}
                            className="flex justify-center items-center px-4 py-2 w-full text-sm font-medium text-white bg-pink-600 rounded-md border border-transparent hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                          >
                            <FiShoppingBag className="mr-2 w-5 h-5" />
                            Proceed to Order
                          </motion.button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Wishlist; 