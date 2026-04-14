import { useState, forwardRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Package } from 'lucide-react';
import { Product, ProductVariant } from '@/types/sales';
import { getProductImage } from '@/lib/product-images';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, variant: ProductVariant) => void;
  cartQuantity?: number; // total qty of this product (any variant) in cart
  onIncrement?: (product: Product, variant: ProductVariant) => void;
  onDecrement?: (productId: string, sku: string, currentQty: number) => void;
}

export const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(
  ({ product, onAddToCart, cartQuantity = 0, onIncrement, onDecrement }, ref) => {
    // For products with multiple variants, we default to the first in-stock one
    const defaultVariant = product.variants.find(v => v.stock > 0) ?? product.variants[0];
    const [selectedVariant] = useState<ProductVariant>(defaultVariant);

    const [pressed, setPressed] = useState(false);

    const handleAdd = useCallback(() => {
      if (!selectedVariant) return;
      setPressed(true);
      setTimeout(() => setPressed(false), 150);
      onAddToCart(product, selectedVariant);
    }, [onAddToCart, product, selectedVariant]);

    const handleIncrement = useCallback(() => {
      if (!selectedVariant) return;
      setPressed(true);
      setTimeout(() => setPressed(false), 150);
      if (onIncrement) onIncrement(product, selectedVariant);
      else onAddToCart(product, selectedVariant);
    }, [onAddToCart, onIncrement, product, selectedVariant]);

    const handleDecrement = useCallback(() => {
      if (!selectedVariant || !onDecrement) return;
      onDecrement(product._id, selectedVariant.sku, cartQuantity);
    }, [onDecrement, product._id, selectedVariant, cartQuantity]);

    const imgSrc = getProductImage(product.name, product.image);
    const hasImage = imgSrc && imgSrc !== '/placeholder.svg';
    const isInCart = cartQuantity > 0;

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, scale: 0.93 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.93 }}
        transition={{ duration: 0.18 }}
        className="relative bg-card rounded-xl border border-border overflow-hidden shadow-soft group"
        style={{ contain: 'layout paint' }}
      >
        {/* Image area */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          {hasImage ? (
            <img
              src={imgSrc}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-8 w-8 text-muted-foreground/40" />
            </div>
          )}

          {/* Category badge top-left */}
          <span className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full backdrop-blur-sm leading-tight">
            {product.category}
          </span>

          {/* In-cart badge top-right */}
          <AnimatePresence>
            {isInCart && (
              <motion.span
                key="cart-badge"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-tight shadow-glow"
              >
                {cartQuantity}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Overlay bottom bar — price + stepper */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-2 pt-4 pb-2">
            <div className="flex items-center justify-between gap-1">
              {/* Price */}
              <div className="flex flex-col leading-tight">
                <span className="text-white text-[11px] font-bold leading-none">
                  ₹{selectedVariant.price.toLocaleString()}
                </span>
                {selectedVariant.mrp > selectedVariant.price && (
                  <span className="text-white/50 text-[9px] line-through leading-none mt-0.5">
                    ₹{selectedVariant.mrp.toLocaleString()}
                  </span>
                )}
              </div>

              {/* ADD / Stepper */}
              <AnimatePresence mode="wait" initial={false}>
                {isInCart ? (
                  <motion.div
                    key="stepper"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="flex items-center gap-0.5 bg-primary rounded-full px-0.5 py-0.5 shadow-glow"
                  >
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={handleDecrement}
                      className="h-5 w-5 flex items-center justify-center rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 active:bg-primary-foreground/40 transition-colors"
                    >
                      <Minus className="h-3 w-3 text-primary-foreground" />
                    </motion.button>
                    <span className="text-primary-foreground font-bold text-[11px] min-w-[16px] text-center">
                      {cartQuantity}
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={handleIncrement}
                      className="h-5 w-5 flex items-center justify-center rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 active:bg-primary-foreground/40 transition-colors"
                    >
                      <Plus className="h-3 w-3 text-primary-foreground" />
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.button
                    key="add"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={pressed ? { scale: 0.85, opacity: 1 } : { scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    whileTap={{ scale: 0.82 }}
                    onClick={handleAdd}
                    disabled={!selectedVariant || selectedVariant.stock === 0}
                    className="h-6 w-6 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Product name */}
        <div className="px-2 py-1.5">
          <p className="text-foreground font-semibold text-[11px] leading-tight line-clamp-2">
            {product.name}
          </p>
          <p className="text-muted-foreground text-[9px] mt-0.5 leading-tight">
            {selectedVariant.size}
          </p>
        </div>
      </motion.div>
    );
  }
);

ProductCard.displayName = 'ProductCard';
