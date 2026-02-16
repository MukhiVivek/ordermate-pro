import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';

export interface Customer {
    _id: string;
    name: string;
    phone_number: string | number;
    company?: string;
    email?: string;
}

export const useCustomers = () => {
    return useQuery({
        queryKey: ['customers'],
        queryFn: async (): Promise<Customer[]> => {
            const data = await apiRequest('/customer/data');
            return data.data || [];
        },
        staleTime: 60000,
    });
};
