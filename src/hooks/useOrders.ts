import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';

export interface OrderItem {
    product_id: string;
    name: string;
    qty: number;
    price: number;
    tamount: number;
}

export interface Order {
    _id: string;
    invoice_number: string;
    invoice_date: string;
    items: OrderItem[];
    subtotal: number;
    tax: number;
    total: number;
    status: 'pending' | 'paid';
    customerName: string;
    customerPhone?: string;
    notes?: string;
    location?: {
        latitude: number;
        longitude: number;
    };
    createdAt: string;
}

export const useOrders = () => {
    return useQuery({
        queryKey: ['ordermate_orders'],
        queryFn: async (): Promise<Order[]> => {
            const response = await apiRequest('/ordermate/data');
            return response.data || [];
        },
        staleTime: 30000, // 30 seconds
    });
};
