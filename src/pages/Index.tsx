import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Loader2, LogOut, User, FileText } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { SearchBar } from '@/components/sales/SearchBar';
import { ProductCard } from '@/components/sales/ProductCard';
import { CategoryBar } from '@/components/sales/CategoryBar';
import { FloatingBucket } from '@/components/sales/FloatingBucket';
import { InvoiceReview } from '@/components/sales/InvoiceReview';
import { Product, ProductVariant } from '@/types/sales';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

type ViewState = 'catalog' | 'review';

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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
    toInvoiceItems,
    getItemQuantity,
  } = useCart();
  const [notes, setNotes] = useState('');

  // Unique categories from all products
  const categories = useMemo(() => {
    if (!products) return [];
    const cats = Array.from(new Set(products.map((p) => p.category))).sort();
    return cats;
  }, [products]);

  // Filter by search + category
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    let list = products;

    if (selectedCategory) {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    return list;
  }, [products, searchQuery, selectedCategory]);

  const handleAddToCart = (product: Product, variant: ProductVariant) => {
    addToCart(product._id, product.name, variant, product.image);
  };

  const handleIncrement = (product: Product, variant: ProductVariant) => {
    addToCart(product._id, product.name, variant, product.image, 1);
  };

  const handleDecrement = (productId: string, sku: string, currentQty: number) => {
    updateQuantity(productId, sku, currentQty - 1);
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
    setSelectedCategory(null);
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
        <div className="max-w-7xl mx-auto px-3 pt-3 pb-0">
          {/* Top row: branding + actions */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-gradient-primary rounded-lg">
                <Package className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-base font-bold text-foreground leading-tight">SalesFlow Pro</h1>
                <p className="text-[10px] text-muted-foreground leading-tight">Quick Order System</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col items-end mr-1">
                <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">Salesman</span>
                <span className="text-xs font-bold text-foreground">{user?.username}</span>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <User className="h-4 w-4 text-primary" />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/orders')}
                className="h-8 w-8 rounded-full hover:bg-primary/10 text-primary transition-colors"
                title="My Orders"
              >
                <FileText className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search + Trending chips */}
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search products by name or category..."
          />

          {/* Category bar */}
          {categories.length > 0 && (
            <CategoryBar
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 pt-3 pb-28">
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
            {/* Results count */}
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                {searchQuery && ` for "${searchQuery}"`}
                {selectedCategory && ` · ${selectedCategory}`}
              </p>
            </div>

            {/* Dense q-commerce grid: 3 cols on mobile, 4 on sm, 5 on lg */}
            <motion.div
              layout
              className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2"
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => {
                  const firstVariant = product.variants.find((v) => v.stock > 0) ?? product.variants[0];
                  const qty = firstVariant ? getItemQuantity(product._id, firstVariant.sku) : 0;
                  return (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      cartQuantity={qty}
                      onIncrement={handleIncrement}
                      onDecrement={handleDecrement}
                    />
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <Package className="h-14 w-14 mx-auto text-muted-foreground/40 mb-4" />
                <p className="text-base font-medium text-foreground">No products found</p>
                <p className="text-muted-foreground text-sm mt-1">Try a different search term or category</p>
              </motion.div>
            )}
          </>
        )}
      </main>

      {/* Slim Sticky Cart Bar */}
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