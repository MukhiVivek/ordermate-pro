import { useState, useCallback, useMemo } from 'react';
import { CartItem, ProductVariant, InvoiceItem } from '@/types/sales';

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = useCallback((
    productId: string,
    productName: string,
    variant: ProductVariant,
    image: string,
    quantity: number = 1
  ) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.productId === productId && item.variant.sku === variant.sku
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity
        };
        return updated;
      }

      return [...prev, { productId, productName, variant, quantity, image }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, sku: string, quantity: number) => {
    setCart(prev => {
      if (quantity <= 0) {
        return prev.filter(item => !(item.productId === productId && item.variant.sku === sku));
      }
      
      return prev.map(item => 
        item.productId === productId && item.variant.sku === sku
          ? { ...item, quantity }
          : item
      );
    });
  }, []);

  const removeFromCart = useCallback((productId: string, sku: string) => {
    setCart(prev => prev.filter(
      item => !(item.productId === productId && item.variant.sku === sku)
    ));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const totals = useMemo(() => {
    const subtotal = cart.reduce(
      (sum, item) => sum + (item.variant.price * item.quantity),
      0
    );
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + tax;
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return { subtotal, tax, total, itemCount };
  }, [cart]);

  // Convert cart to invoice items matching MongoDB schema
  const toInvoiceItems = useCallback((): InvoiceItem[] => {
    return cart.map(item => ({
      name: `${item.productName} - ${item.variant.size}`,
      qty: item.quantity,
      price: item.variant.price,
      tamount: item.variant.price * item.quantity
    }));
  }, [cart]);

  return {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totals,
    toInvoiceItems
  };
};