import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Loader2, LogOut, User, FileText } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { SearchBar } from '@/components/sales/SearchBar';
import { ProductCard } from '@/components/sales/ProductCard';
import { FloatingBucket } from '@/components/sales/FloatingBucket';
import { InvoiceReview } from '@/components/sales/InvoiceReview';
import { Product, ProductVariant } from '@/types/sales';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

type ViewState = 'catalog' | 'review';

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<ViewState>('catalog');

  const { user, logout } = useAuth();
  const { data: products, isLoading, error } = useProducts();
  const {
    cart,
    addToCart,
    updateQuantity,
    updatePrice,
    removeFromCart,
    clearCart,
    totals,
    toInvoiceItems
  } = useCart();
  const [notes, setNotes] = useState('');

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
    setNotes('');
    setCurrentView('catalog');
    setSearchQuery('');
  };

  // Show Invoice Review
  if (currentView === 'review') {
    return (
      <InvoiceReview
        cart={cart}
        totals={totals}
        notes={notes}
        setNotes={setNotes}
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-primary rounded-xl">
                <Package className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">SalesFlow Pro</h1>
                <p className="text-sm text-muted-foreground">Quick Order System</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Salesman</span>
                <span className="text-sm font-bold text-foreground">{user?.username}</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <User className="h-5 w-5 text-primary" />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/orders')}
                className="rounded-full hover:bg-primary/10 text-primary transition-colors"
                title="My Orders"
              >
                <FileText className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
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
              className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
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
        notes={notes}
        onNotesChange={setNotes}
        onUpdateQuantity={updateQuantity}
        onUpdatePrice={updatePrice}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default Index;