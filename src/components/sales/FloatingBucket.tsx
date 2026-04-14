import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Minus, Plus, Trash2, ChevronUp, Pencil, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { CartItem } from '@/types/sales';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getProductImage } from '@/lib/product-images';

interface FloatingBucketProps {
  cart: CartItem[];
  totals: {
    subtotal: number;
    tax: number;
    total: number;
    itemCount: number;
  };
  onUpdateQuantity: (productId: string, sku: string, quantity: number) => void;
  onUpdatePrice: (productId: string, sku: string, price: number) => void;
  onRemove: (productId: string, sku: string) => void;
  onCheckout: () => void;
  notes: string;
  onNotesChange: (notes: string) => void;
}

export const FloatingBucket = ({
  cart,
  totals,
  onUpdateQuantity,
  onUpdatePrice,
  onRemove,
  onCheckout,
  notes,
  onNotesChange,
}: FloatingBucketProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState('');

  if (cart.length === 0) return null;

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sticky bottom bar */}
      <motion.div
        layout
        className="fixed bottom-0 left-0 right-0 z-50"
      >
        <motion.div
          layout
          className="bg-card border-t border-border shadow-[0_-4px_24px_-4px_hsl(0_0%_0%/0.5)] overflow-hidden"
        >
          {/* ── Expanded panel ── */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                className="max-h-[55vh] overflow-y-auto"
              >
                <div className="px-4 pt-4 pb-2 space-y-2.5">
                  {cart.map((item) => (
                    <motion.div
                      key={`${item.productId}-${item.variant.sku}`}
                      layout
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-3 p-2.5 bg-muted rounded-xl"
                    >
                      {/* Thumbnail */}
                      <div className="h-10 w-10 rounded-lg bg-background flex-shrink-0 flex items-center justify-center overflow-hidden border border-border/50">
                        {(() => {
                          const imgSrc = getProductImage(item.productName, item.image);
                          if (imgSrc && imgSrc !== '/placeholder.svg') {
                            return <img src={imgSrc} alt={item.productName} className="w-full h-full object-cover" />;
                          }
                          return <ShoppingCart className="h-4 w-4 text-muted-foreground/30" />;
                        })()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs text-foreground truncate">{item.productName}</p>
                        <p className="text-[10px] text-muted-foreground">{item.variant.size}</p>
                        {editingPrice === `${item.productId}-${item.variant.sku}` ? (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs text-muted-foreground">₹</span>
                            <Input
                              type="number"
                              value={priceInput}
                              onChange={(e) => setPriceInput(e.target.value)}
                              onBlur={() => {
                                const newPrice = parseFloat(priceInput);
                                if (!isNaN(newPrice) && newPrice > 0) {
                                  onUpdatePrice(item.productId, item.variant.sku, newPrice);
                                }
                                setEditingPrice(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const newPrice = parseFloat(priceInput);
                                  if (!isNaN(newPrice) && newPrice > 0) {
                                    onUpdatePrice(item.productId, item.variant.sku, newPrice);
                                  }
                                  setEditingPrice(null);
                                }
                              }}
                              autoFocus
                              onFocus={(e) => e.target.select()}
                              className="h-6 w-20 text-xs px-1"
                            />
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingPrice(`${item.productId}-${item.variant.sku}`);
                              setPriceInput(item.variant.price.toString());
                            }}
                            className="flex items-center gap-1 mt-0.5 group/price"
                          >
                            <p className="text-xs font-semibold text-primary">
                              ₹{item.variant.price.toLocaleString()} × {item.quantity} = ₹{(item.variant.price * item.quantity).toLocaleString()}
                            </p>
                            <Pencil className="h-2.5 w-2.5 text-muted-foreground opacity-0 group-hover/price:opacity-100 transition-opacity" />
                          </button>
                        )}
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onUpdateQuantity(item.productId, item.variant.sku, item.quantity - 1)}
                          className="p-1 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <Input
                          type="tel"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val) && val >= 0) {
                              onUpdateQuantity(item.productId, item.variant.sku, val);
                            }
                          }}
                          onFocus={(e) => e.target.select()}
                          className="h-7 w-10 text-center text-xs font-medium px-0.5 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          min={1}
                        />
                        <button
                          onClick={() => onUpdateQuantity(item.productId, item.variant.sku, item.quantity + 1)}
                          className="p-1 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => onRemove(item.productId, item.variant.sku)}
                          className="p-1 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors ml-0.5"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Notes */}
                <div className="px-4 pb-3">
                  <Textarea
                    placeholder="Add notes for this order..."
                    value={notes}
                    onChange={(e) => onNotesChange(e.target.value)}
                    className="min-h-[48px] text-xs bg-muted border-border resize-none focus:ring-1 focus:ring-primary/20"
                  />
                </div>

                {/* Totals strip */}
                <div className="border-t border-border px-4 py-2.5 flex items-center justify-between bg-muted/40">
                  <span className="text-xs text-muted-foreground">
                    {totals.itemCount} items · Subtotal
                  </span>
                  <span className="text-sm font-bold text-primary">₹{totals.total.toLocaleString()}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Slim bottom bar ── */}
          <div className="flex items-center gap-3 px-4 py-3 safe-area-pb">
            {/* Left: tap to expand */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2.5 flex-1 min-w-0"
            >
              {/* Cart icon with badge */}
              <div className="relative flex-shrink-0">
                <div className="p-1.5 bg-gradient-primary rounded-xl">
                  <ShoppingCart className="h-4 w-4 text-primary-foreground" />
                </div>
                <motion.span
                  key={totals.itemCount}
                  initial={{ scale: 1.4 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center leading-none"
                >
                  {totals.itemCount}
                </motion.span>
              </div>

              {/* Summary text */}
              <div className="text-left min-w-0">
                <p className="text-[10px] text-muted-foreground leading-none">
                  {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'}
                </p>
                <motion.p
                  key={totals.total}
                  initial={{ y: -6, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="font-bold text-base text-foreground leading-tight"
                >
                  ₹{totals.total.toLocaleString()}
                </motion.p>
              </div>

              {/* Chevron toggle */}
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="ml-auto flex-shrink-0"
              >
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            </button>

            {/* CTA */}
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                onClick={onCheckout}
                className="bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold h-10 px-4 rounded-xl flex items-center gap-1.5 text-sm whitespace-nowrap"
              >
                Review
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};