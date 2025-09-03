import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

interface ProductsState {
  items: Product[];
  loading: boolean;
  error: string | null;
}

// Async thunk to fetch products from backend
export const fetchProducts = createAsyncThunk<Product[], string | undefined>(
  "products/fetchProducts",
  async (category, thunkAPI) => {
    try {
      let url = `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      }/api/products`;
      if (category && category !== "all") {
        url += `?category=${category}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch products");
      return await res.json();
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

const initialState: ProductsState = {
  items: [],
  loading: false,
  error: null,
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
    },
    addProduct: (state, action: PayloadAction<Product>) => {
      state.items.push(action.payload);
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.items.findIndex(
        (product) => product.id === action.payload.id
      );
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (product) => product.id !== action.payload
      );
    },
    updateStock: (
      state,
      action: PayloadAction<{ id: string; stock: number }>
    ) => {
      const product = state.items.find((p) => p.id === action.payload.id);
      if (product) {
        product.stock = action.payload.stock;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  updateStock,
} = productsSlice.actions;
export default productsSlice.reducer;
