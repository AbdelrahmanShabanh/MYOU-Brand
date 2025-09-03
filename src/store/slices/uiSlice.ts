import { createSlice } from '@reduxjs/toolkit';

interface UIState {
  cartOpen: boolean;
  wishlistOpen: boolean;
  mobileMenuOpen: boolean;
}

const initialState: UIState = {
  cartOpen: false,
  wishlistOpen: false,
  mobileMenuOpen: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleCart: (state) => {
      state.cartOpen = !state.cartOpen;
      state.wishlistOpen = false;
      state.mobileMenuOpen = false;
    },
    toggleWishlist: (state) => {
      state.wishlistOpen = !state.wishlistOpen;
      state.cartOpen = false;
      state.mobileMenuOpen = false;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
      state.cartOpen = false;
      state.wishlistOpen = false;
    },
    closeAllOverlays: (state) => {
      state.cartOpen = false;
      state.wishlistOpen = false;
      state.mobileMenuOpen = false;
    },
  },
});

export const { toggleCart, toggleWishlist, toggleMobileMenu, closeAllOverlays } = uiSlice.actions;
export default uiSlice.reducer; 