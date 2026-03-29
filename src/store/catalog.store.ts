import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { Product, CartItem } from '../types';

const PAGE_SIZE = 6;

interface CatalogState {
  products: Product[];
  totalCount: number;
  currentPage: number;
  searchQuery: string;
  activeCategory: string | null;
  favorites: string[];
  cart: CartItem[];
  loading: boolean;
  currentUserId: string | null;

  fetchProducts: (params?: { page?: number; category?: string | null; search?: string }) => Promise<void>;
  setSearch: (query: string) => void;
  setCategory: (category: string | null) => void;
  setPage: (page: number) => void;
  getTotalPages: () => number;
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (productId: string) => Promise<void>;
  addToCart: (product: Product, qty: number, size: string, dueDate?: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  createOrderFromCart: () => Promise<string | null>;
  resetForUser: (userId: string | null) => void;
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  products: [],
  totalCount: 0,
  currentPage: 0,
  searchQuery: '',
  activeCategory: null,
  favorites: [],
  cart: [],
  loading: false,
  currentUserId: null,

  resetForUser: (userId) => {
    if (userId !== get().currentUserId) {
      set({ cart: [], favorites: [], currentUserId: userId });
    }
  },

  fetchProducts: async (params) => {
    const page = params?.page ?? get().currentPage;
    const category = params?.category !== undefined ? params.category : get().activeCategory;
    const search = params?.search !== undefined ? params.search : get().searchQuery;

    set({ loading: true, currentPage: page, activeCategory: category, searchQuery: search });

    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      if (category) {
        query = query.eq('category', category);
      }
      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      query = query.order('created_at').range(from, to);

      const { data, count } = await query;
      set({
        products: (data as Product[]) || [],
        totalCount: count || 0,
      });
    } finally {
      set({ loading: false });
    }
  },

  setSearch: (query) => {
    get().fetchProducts({ search: query, page: 0 });
  },

  setCategory: (category) => {
    get().fetchProducts({ category, page: 0 });
  },

  setPage: (page) => {
    get().fetchProducts({ page });
  },

  getTotalPages: () => Math.ceil(get().totalCount / PAGE_SIZE),

  fetchFavorites: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from('favorites')
      .select('product_id')
      .eq('user_id', session.user.id);

    if (data) {
      set({ favorites: data.map((f: any) => f.product_id) });
    }
  },

  toggleFavorite: async (productId) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { favorites } = get();
    const isFav = favorites.includes(productId);

    if (isFav) {
      await supabase.from('favorites').delete().match({ user_id: session.user.id, product_id: productId });
      set({ favorites: favorites.filter((id) => id !== productId) });
    } else {
      await supabase.from('favorites').insert({ user_id: session.user.id, product_id: productId });
      set({ favorites: [...favorites, productId] });
    }
  },

  addToCart: (product, qty, size, dueDate) => {
    const { cart } = get();
    const existing = cart.find((i) => i.product_id === product.id && i.size === size);
    if (existing) {
      set({
        cart: cart.map((i) =>
          i.product_id === product.id && i.size === size
            ? { ...i, quantity: i.quantity + qty, due_date: dueDate || i.due_date }
            : i
        ),
      });
    } else {
      set({ cart: [...cart, { product_id: product.id, product, quantity: qty, size, due_date: dueDate }] });
    }
  },

  removeFromCart: (productId) => {
    set({ cart: get().cart.filter((i) => i.product_id !== productId) });
  },

  updateCartQty: (productId, qty) => {
    if (qty <= 0) { get().removeFromCart(productId); return; }
    set({ cart: get().cart.map((i) => i.product_id === productId ? { ...i, quantity: qty } : i) });
  },

  clearCart: () => set({ cart: [] }),

  getCartTotal: () => get().cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0),

  createOrderFromCart: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { cart } = get();
    if (cart.length === 0) return null;

    const totalAmount = get().getCartTotal();
    const dueDates = cart.filter((i) => i.due_date).map((i) => i.due_date!);
    const dueDate = dueDates.length > 0 ? dueDates.sort()[0] : undefined;

    // Get franchise_id and production_id from the first cart item's product
    const firstProduct = cart[0].product;
    const franchiseId = firstProduct.franchise_id || null;
    const productionId = firstProduct.production_id || null;

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        customer_id: session.user.id,
        franchisee_id: franchiseId,
        production_id: productionId,
        total_amount: totalAmount,
        status: 'new',
        ...(dueDate ? { due_date: dueDate } : {}),
      })
      .select()
      .single();

    if (error || !order) return null;

    const items = cart.map((i) => ({
      order_id: order.id,
      product_id: i.product_id,
      product_title: i.product.title,
      quantity: i.quantity,
      size: i.size,
      price_snapshot: i.product.price,
    }));

    await supabase.from('order_items').insert(items);
    get().clearCart();
    return order.id;
  },
}));
