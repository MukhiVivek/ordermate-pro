import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/sales';

export const useProducts = (searchQuery: string = '') => {
  return useQuery({
    queryKey: ['products', searchQuery],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase.functions.invoke('mongodb', {
        body: { action: 'getProducts' }
      });

      if (error) throw error;
      
      let products = data.documents as Product[];
      
      // Client-side search filtering for instant results
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        products = products.filter(p => 
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
        );
      }
      
      return products;
    },
    staleTime: 30000, // Cache for 30 seconds for fast subsequent loads
  });
};

export const useProductSearch = () => {
  const { data: allProducts = [], isLoading } = useProducts();
  
  const searchProducts = (query: string): Product[] => {
    if (!query) return allProducts;
    
    const lowerQuery = query.toLowerCase();
    return allProducts.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery)
    );
  };
  
  return { allProducts, searchProducts, isLoading };
};