import { useQuery } from '@tanstack/react-query';
import { Product } from '@/types/sales';
import { apiRequest } from '@/lib/api';

export const useProducts = (searchQuery: string = '') => {
  return useQuery({
    queryKey: ['products', searchQuery],
    queryFn: async (): Promise<Product[]> => {
      const data = await apiRequest('/product/data');
      const rawProducts = data.data || [];

      // Map Magnet DB flat products to hierarchical structure for Salesman UI
      const products: Product[] = rawProducts.map((doc: any) => ({
        _id: doc._id,
        name: doc.name,
        description: doc.description || `${doc.name} - ${doc.product_type}`,
        image: doc.image || '/placeholder-product.jpg',
        category: doc.product_type,
        variants: [
          {
            size: doc.measuring_unit || 'Default',
            price: doc.price,
            mrp: doc.price * 1.2,
            stock: doc.stock || 0,
            sku: `${doc.name.substring(0, 3).toUpperCase()}-${doc._id.toString().slice(-4)}`
          }
        ]
      }));

      // Client-side search filtering
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return products.filter(p =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
        );
      }

      return products;
    },
    staleTime: 30000,
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