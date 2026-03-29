import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { Order, OrderStatus } from '../types';
import { RealtimeChannel } from '@supabase/supabase-js';

interface OrdersState {
  orders: Order[];
  loading: boolean;
  channel: RealtimeChannel | null;

  fetchOrders: (role: string) => Promise<void>;
  subscribeToOrders: (role: string) => void;
  unsubscribe: () => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  batchUpdateStatus: (orderIds: string[], status: OrderStatus) => Promise<void>;
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  loading: false,
  channel: null,

  fetchOrders: async (role) => {
    set({ loading: true });
    try {
      let query = supabase
        .from('orders')
        .select('*, order_items(*), customer:profiles!customer_id(full_name, phone, email)')
        .order('created_at', { ascending: false });

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { set({ loading: false }); return; }

      if (role === 'customer') {
        query = query.eq('customer_id', session.user.id);
      } else if (role === 'franchisee') {
        query = query.eq('franchisee_id', session.user.id);
      } else if (role === 'production') {
        query = query.eq('production_id', session.user.id)
          .in('status', ['confirmed', 'sewing', 'ready']);
      }

      const { data } = await query;
      if (data) set({ orders: data as Order[] });
    } finally {
      set({ loading: false });
    }
  },

  subscribeToOrders: (role) => {
    get().unsubscribe();

    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          get().fetchOrders(role);
        }
      )
      .subscribe();

    set({ channel });
  },

  unsubscribe: () => {
    const { channel } = get();
    if (channel) {
      supabase.removeChannel(channel);
      set({ channel: null });
    }
  },

  updateOrderStatus: async (orderId, status) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (!error) {
      set({
        orders: get().orders.map((o) =>
          o.id === orderId ? { ...o, status, updated_at: new Date().toISOString() } : o
        ),
      });
    }
  },

  batchUpdateStatus: async (orderIds, status) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .in('id', orderIds);

    if (!error) {
      const now = new Date().toISOString();
      set({
        orders: get().orders.map((o) =>
          orderIds.includes(o.id) ? { ...o, status, updated_at: now } : o
        ),
      });
    }
  },
}));
