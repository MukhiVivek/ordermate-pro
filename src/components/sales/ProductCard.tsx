import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Package } from 'lucide-react';
import { Product, ProductVariant } from '@/types/sales';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, variant: ProductVariant) => void;
}

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSelectVariant = (variant: ProductVariant) => {
    setSelectedVariant(variant);
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    
    onAddToCart(product, selectedVariant);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedVariant(null);
    }, 1500);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-card rounded-lg sm:rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-all duration-200 shadow-soft"
    >
      {/* Product Image */}
      <div className="relative aspect-square bg-muted flex items-center justify-center">
        <Package className="h-6 w-6 sm:h-16 sm:w-16 text-muted-foreground/50" />
        <Badge className="absolute top-1 left-1 sm:top-3 sm:left-3 bg-secondary text-secondary-foreground text-[6px] sm:text-xs px-1 py-0 sm:px-2 sm:py-0.5">
          {product.category}
        </Badge>
      </div>

      {/* Product Info */}
      <div className="p-1.5 sm:p-4 space-y-1 sm:space-y-3">
        <div>
          <h3 className="font-semibold text-foreground text-[10px] sm:text-base line-clamp-1">{product.name}</h3>
          <p className="hidden sm:block text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        </div>

        {/* Size/Variant Selection */}
        <div className="space-y-0.5 sm:space-y-2">
          <p className="hidden sm:block text-xs font-medium text-muted-foreground uppercase tracking-wide">Select Size</p>
          <div className="flex flex-wrap gap-0.5 sm:gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.sku}
                onClick={() => handleSelectVariant(variant)}
                disabled={variant.stock === 0}
                className={`px-1 py-0.5 sm:px-3 sm:py-2 text-[8px] sm:text-sm rounded sm:rounded-lg border transition-all ${
                  selectedVariant?.sku === variant.sku
                    ? 'border-primary bg-primary/10 text-primary'
                    : variant.stock === 0
                    ? 'border-border bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                    : 'border-border hover:border-primary/50 text-foreground'
                }`}
              >
                <span className="font-medium">{variant.size}</span>
                <span className="hidden sm:block text-xs mt-0.5">₹{variant.price.toLocaleString()}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Add to Cart Button */}
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center justify-center gap-1 sm:gap-2 h-6 sm:h-11 bg-success/10 text-success rounded sm:rounded-lg"
            >
              <Check className="h-3 w-3 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline font-medium">Added!</span>
            </motion.div>
          ) : (
            <motion.div
              key="button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              {/* Mobile: Icon-only button */}
              <Button
                onClick={handleAddToCart}
                disabled={!selectedVariant}
                size="icon"
                className="sm:hidden w-full h-6 bg-gradient-primary hover:opacity-90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-3 w-3" />
              </Button>
              {/* Desktop: Full button */}
              <Button
                onClick={handleAddToCart}
                disabled={!selectedVariant}
                className="hidden sm:flex w-full h-11 bg-gradient-primary hover:opacity-90 text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add to Bucket
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
