export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size: string; // Required size
}

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

export interface Product {
  id: string;
  _id?: string;
  name: string;
  description: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  stock: number;
  sizes?: string[];
  sizeStock?: Record<string, number>;
  isSoldOut?: boolean;
  discount?: number;
}

export interface RootState {
  cart: {
    items: CartItem[];
    total: number;
  };
  wishlist: {
    items: WishlistItem[];
  };
  ui: {
    cartOpen: boolean;
    wishlistOpen: boolean;
    mobileMenuOpen: boolean;
  };
  products: {
    items: Product[];
    loading: boolean;
    error: string | null;
  };
}
