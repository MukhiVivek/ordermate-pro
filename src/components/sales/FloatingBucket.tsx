import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Minus, Plus, Trash2, ChevronUp, Pencil } from 'lucide-react';
import { useState } from 'react';
import { CartItem } from '@/types/sales';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
}

export const FloatingBucket = ({
  cart,
  totals,
  onUpdateQuantity,
  onUpdatePrice,
  onRemove,
  onCheckout
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

      {/* Floating Bucket */}
      <motion.div
        layout
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50"
      >
        <motion.div
          layout
          className="bg-card border border-border rounded-2xl shadow-soft overflow-hidden"
        >
          {/* Expanded Cart Items */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="max-h-80 overflow-y-auto"
              >
                <div className="p-4 space-y-3">
                  {cart.map((item) => (
                    <motion.div
                      key={`${item.productId}-${item.variant.sku}`}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-3 p-3 bg-muted rounded-xl"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                          {item.productName}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.variant.size}</p>
                        {editingPrice === `${item.productId}-${item.variant.sku}` ? (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-sm text-muted-foreground">₹</span>
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
                              className="h-6 w-20 text-sm px-1"
                            />
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingPrice(`${item.productId}-${item.variant.sku}`);
                              setPriceInput(item.variant.price.toString());
                            }}
                            className="flex items-center gap-1 mt-1 group/price"
                          >
                            <p className="text-sm font-semibold text-primary">
                              ₹{item.variant.price.toLocaleString()} × {item.quantity} = ₹{(item.variant.price * item.quantity).toLocaleString()}
                            </p>
                            <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover/price:opacity-100 transition-opacity" />
                          </button>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onUpdateQuantity(item.productId, item.variant.sku, item.quantity - 1)}
                          className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                        >
                          <Minus className="h-4 w-4" />
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
                          className="h-8 w-12 text-center text-sm font-medium px-1 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          min={1}
                        />
                        <button
                          onClick={() => onUpdateQuantity(item.productId, item.variant.sku, item.quantity + 1)}
                          className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onRemove(item.productId, item.variant.sku)}
                          className="p-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors ml-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-border p-4 space-y-2 bg-muted/50">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{totals.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">₹{totals.total.toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Bar */}
          <div className="p-4 bg-card">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-3 flex-1"
              >
                <div className="relative">
                  <div className="p-2 bg-gradient-primary rounded-xl">
                    <ShoppingCart className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {totals.itemCount}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">
                    {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'}
                  </p>
                  <p className="font-semibold text-lg">₹{totals.total.toLocaleString()}</p>
                </div>
                <ChevronUp
                  className={`h-5 w-5 ml-auto text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
              </button>

              <Button
                onClick={onCheckout}
                className="bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold px-6 h-12"
              >
                Review Order
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};