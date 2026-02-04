import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Loader2 } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { SearchBar } from '@/components/sales/SearchBar';
import { ProductCard } from '@/components/sales/ProductCard';
import { FloatingBucket } from '@/components/sales/FloatingBucket';
import { InvoiceReview } from '@/components/sales/InvoiceReview';
import { Product, ProductVariant } from '@/types/sales';

type ViewState = 'catalog' | 'review';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<ViewState>('catalog');
  
  const { data: products, isLoading, error } = useProducts();
  const { 
    cart, 
    addToCart, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    totals, 
    toInvoiceItems 
  } = useCart();

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!searchQuery) return products;
    
    const query = searchQuery.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const handleAddToCart = (product: Product, variant: ProductVariant) => {
    addToCart(product._id, product.name, variant, product.image);
  };

  const handleCheckout = () => {
    setCurrentView('review');
  };

  const handleBackToCatalog = () => {
    setCurrentView('catalog');
  };

  const handleOrderComplete = () => {
    clearCart();
    setCurrentView('catalog');
    setSearchQuery('');
  };

  // Show Invoice Review
  if (currentView === 'review') {
    return (
      <InvoiceReview
        cart={cart}
        totals={totals}
        invoiceItems={toInvoiceItems()}
        onBack={handleBackToCatalog}
        onComplete={handleOrderComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-gradient-primary rounded-xl">
              <Package className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">SalesFlow Pro</h1>
              <p className="text-sm text-muted-foreground">Quick Order System</p>
            </div>
          </div>
          
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search products by name or category..."
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 pb-32">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <p className="text-destructive">Failed to load products</p>
            <p className="text-muted-foreground text-sm mt-2">Please check your connection</p>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && !error && (
          <>
            {/* Results Count */}
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>

            <motion.div 
              layout
              className="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4"
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <Package className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium text-foreground">No products found</p>
                <p className="text-muted-foreground mt-1">Try a different search term</p>
              </motion.div>
            )}
          </>
        )}
      </main>

      {/* Floating Cart */}
      <FloatingBucket
        cart={cart}
        totals={totals}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default Index;