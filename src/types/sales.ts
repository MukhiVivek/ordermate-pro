// Product variant structure
export interface ProductVariant {
  size: string;
  price: number;
  stock: number;
  sku: string;
}

// Product with variants
export interface Product {
  _id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  variants: ProductVariant[];
}

// Cart item - selected product with specific variant
export interface CartItem {
  productId: string;
  productName: string;
  variant: ProductVariant;
  quantity: number;
  image: string;
}

// Invoice line item matching your MongoDB schema
export interface InvoiceItem {
  name: string;
  qty: number;
  price: number;
  tamount: number; // total amount (qty * price)
}

// Full invoice structure
export interface Invoice {
  _id?: string;
  invoiceNumber: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid';
  customerName?: string;
  customerPhone?: string;
  salesmanId?: string;
  createdAt: string;
}

// Order state
export interface OrderState {
  cart: CartItem[];
  customerInfo: {
    name: string;
    phone: string;
  };
}