export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size: string; // Required size
  shippingCost?: number;
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
  countInStock?: number;
  sizes?: string[];
  sizeStock?: Record<string, number>;
  isSoldOut?: boolean;
  discount?: number;
}

export interface RootState {
  cart: {
    items: CartItem[];
    total: number;
    isHydrated: boolean;
  };
  wishlist: {
    items: WishlistItem[];
    isOpen: boolean;
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
