import { configureStore } from '@reduxjs/toolkit';
import { RootState } from '@/types';
import cartReducer from '@/store/slices/cartSlice';
import wishlistReducer from '@/store/slices/wishlistSlice';
import uiReducer from '@/store/slices/uiSlice';
import productsReducer from './slices/productsSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    wishlist: wishlistReducer,
    ui: uiReducer,
    products: productsReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type StoreState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Verify that StoreState matches our RootState type
export type VerifyState = StoreState extends RootState ? true : false; 