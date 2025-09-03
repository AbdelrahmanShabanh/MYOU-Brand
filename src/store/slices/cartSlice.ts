import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import type { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  total: number;
  loading: boolean;
  error: string | null;
  isHydrated: boolean; // Add hydration flag
}

// Helpers for localStorage persistence
function saveCartToStorage(cart: { items: CartItem[]; total: number }) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("cart", JSON.stringify(cart));
  } catch {}
}

const initialState: CartState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
  isHydrated: false, // Start with false
};

// Async thunk to fetch cart from backend
export const fetchCart = createAsyncThunk<CartItem[], string | undefined>(
  "cart/fetchCart",
  async (userId, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/cart/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch cart");
      const cart = await res.json();
      return cart.items || [];
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to update cart in backend
export const updateCart = createAsyncThunk<
  CartItem[],
  { userId: string; items: CartItem[] }
>("cart/updateCart", async ({ userId, items }, thunkAPI) => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      }/api/cart/${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items }),
      }
    );
    if (!res.ok) throw new Error("Failed to update cart");
    const cart = await res.json();
    return cart.items || [];
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return thunkAPI.rejectWithValue(errorMessage);
  }
});

// Async thunk to clear cart in backend
export const clearCartBackend = createAsyncThunk<void, string>(
  "cart/clearCartBackend",
  async (userId, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/cart/${userId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to clear cart");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    hydrateCart: (state) => {
      if (typeof window !== "undefined") {
        try {
          const data = localStorage.getItem("cart");
          if (data) {
            const parsed = JSON.parse(data);
            state.items = parsed.items || [];
            state.total = parsed.total || 0;
          }
        } catch {
          // Ignore localStorage errors
        }
      }
      state.isHydrated = true;
    },
    addToCart: (state, action: PayloadAction<Omit<CartItem, "quantity">>) => {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      state.total = state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      saveCartToStorage({ items: state.items, total: state.total });
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.total = state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      saveCartToStorage({ items: state.items, total: state.total });
    },
    updateCartItemQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
      state.total = state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      saveCartToStorage({ items: state.items, total: state.total });
    },
    updateCartItemSize: (
      state,
      action: PayloadAction<{ id: string; size: string }>
    ) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        item.size = action.payload.size;
      }
      saveCartToStorage({ items: state.items, total: state.total });
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      saveCartToStorage({ items: state.items, total: state.total });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.total = state.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateCart.fulfilled, (state, action) => {
        state.items = action.payload;
        state.total = state.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      })
      .addCase(clearCartBackend.fulfilled, (state) => {
        state.items = [];
        state.total = 0;
      });
  },
});

export const {
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  updateCartItemSize,
  clearCart,
  hydrateCart,
} = cartSlice.actions;
export default cartSlice.reducer;
