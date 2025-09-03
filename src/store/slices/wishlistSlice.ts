import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WishlistItem } from '@/types';

interface WishlistState {
  items: WishlistItem[];
  isOpen: boolean;
}

const initialState: WishlistState = {
  items: [],
  isOpen: false
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action: PayloadAction<WishlistItem>) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (!existingItem) {
        state.items.push(action.payload);
      }
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    toggleWishlist: (state) => {
      state.isOpen = !state.isOpen;
    },
    closeWishlist: (state) => {
      state.isOpen = false;
    }
  }
});

export const { addToWishlist, removeFromWishlist, toggleWishlist, closeWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer; 