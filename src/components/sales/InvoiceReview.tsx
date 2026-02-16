import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, CheckCircle, Clock, Download, User, Phone, Search } from 'lucide-react';
import { CartItem, InvoiceItem } from '@/types/sales';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useCustomers, Customer } from '@/hooks/useCustomers';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/api';
import { AnimatePresence } from 'framer-motion';

interface InvoiceReviewProps {
  cart: CartItem[];
  totals: {
    subtotal: number;
    tax: number;
    total: number;
    itemCount: number;
  };
  invoiceItems: InvoiceItem[];
  onBack: () => void;
  onComplete: () => void;
}

export const InvoiceReview = ({
  cart,
  totals,
  invoiceItems,
  onBack,
  onComplete
}: InvoiceReviewProps) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid'>('pending');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const { data: allCustomers = [] } = useCustomers();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCustomers = allCustomers.filter(customer => {
    const search = (customerName || customerPhone).toLowerCase();
    if (!search) return false;

    return (
      customer.name.toLowerCase().includes(search) ||
      (customer.phone_number?.toString() || '').includes(search)
    );
  }).slice(0, 5);

  const handleSelectCustomer = (customer: Customer) => {
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone_number?.toString() || '');
    setSelectedCustomerId(customer._id);
    setShowSuggestions(false);
  };

  const generateInvoiceNumber = () => {
    return Math.floor(1000 + Math.random() * 9000);
  };

  const handleGenerateInvoice = async (status: 'pending' | 'paid') => {
    if (!customerName.trim()) {
      toast.error('Please enter customer name');
      return;
    }

    if (!selectedCustomerId) {
      toast.error('Please select an existing customer from the list');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus(status);

    try {
      const body = {
        customer_id: selectedCustomerId,
        invoice_number: `OM-${generateInvoiceNumber()}`,
        items: cart.map(item => ({
          product_id: item.productId,
          name: item.productName,
          qty: item.quantity,
          price: item.variant.price,
          tamount: item.quantity * item.variant.price
        })),
        subtotal: totals.subtotal,
        tax: totals.tax,
        total: totals.total,
        status,
        customerName,
        customerPhone
      };

      const response = await apiRequest('/ordermate/add', {
        method: 'POST',
        body: JSON.stringify(body)
      });

      setInvoiceNumber(response.id?.slice(-6).toUpperCase() || 'NEW');
      setInvoiceGenerated(true);
      toast.success(`Invoice generated successfully!`);

    } catch (error: any) {
      console.error('Invoice generation error:', error);
      toast.error(error.message || 'Failed to generate invoice');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPDF = () => {
    // Create printable invoice content
    const invoiceContent = `
      INVOICE
      ========================================
      Invoice #: ${invoiceNumber}
      Date: ${new Date().toLocaleDateString()}
      Status: ${paymentStatus.toUpperCase()}
      
      Customer: ${customerName}
      Phone: ${customerPhone || 'N/A'}
      
      ----------------------------------------
      ITEMS
      ----------------------------------------
      ${invoiceItems.map(item =>
      `${item.name}\n  Qty: ${item.qty} x ₹${item.price} = ₹${item.tamount}`
    ).join('\n\n')}
      
      ----------------------------------------
      Subtotal: ₹${totals.subtotal.toLocaleString()}
      GST (18%): ₹${totals.tax.toLocaleString()}
      ----------------------------------------
      TOTAL: ₹${totals.total.toLocaleString()}
      ========================================
    `;

    // Create and download
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoiceNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Invoice downloaded!');
  };

  if (invoiceGenerated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen bg-background flex items-center justify-center p-4"
      >
        <div className="bg-card rounded-2xl border border-border p-8 max-w-md w-full text-center space-y-6 shadow-soft">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center ${paymentStatus === 'paid' ? 'bg-success/10' : 'bg-warning/10'
              }`}
          >
            {paymentStatus === 'paid' ? (
              <CheckCircle className="h-10 w-10 text-success" />
            ) : (
              <Clock className="h-10 w-10 text-warning" />
            )}
          </motion.div>

          <div>
            <h2 className="text-2xl font-bold text-foreground">Invoice Generated!</h2>
            <p className="text-muted-foreground mt-2">
              Invoice #{invoiceNumber}
            </p>
          </div>

          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${paymentStatus === 'paid'
            ? 'bg-success/10 text-success'
            : 'bg-warning/10 text-warning'
            }`}>
            {paymentStatus === 'paid' ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
            {paymentStatus === 'paid' ? 'Paid' : 'Payment Pending'}
          </div>

          <div className="bg-muted rounded-xl p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-medium">{customerName}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="font-bold text-primary">₹{totals.total.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              onClick={onComplete}
              className="flex-1 bg-gradient-primary hover:opacity-90"
            >
              New Order
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <header className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Review Order</h1>
            <p className="text-sm text-muted-foreground">{totals.itemCount} items</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 pb-32 space-y-6">
        {/* Customer Info */}
        <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Customer Details
          </h2>
          <div className="space-y-3" ref={suggestionRef}>
            <div className="relative group">
              <Input
                placeholder="Customer Name *"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="h-12 bg-muted border-border"
              />

              <AnimatePresence>
                {showSuggestions && filteredCustomers.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-50 left-0 right-0 top-[calc(100%+4px)] bg-card border border-border rounded-xl shadow-lg overflow-hidden"
                  >
                    {filteredCustomers.map((customer) => (
                      <button
                        key={customer._id}
                        onClick={() => handleSelectCustomer(customer)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-left border-b border-border last:border-0"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">{customer.phone_number}</p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Phone Number (Optional)"
                value={customerPhone}
                onChange={(e) => {
                  setCustomerPhone(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="h-12 pl-12 bg-muted border-border"
              />
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-card rounded-2xl border border-border p-4 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Order Items
          </h2>

          <div className="space-y-3">
            {invoiceItems.map((item, index) => (
              <div key={index} className="flex justify-between items-start py-3 border-b border-border last:border-0">
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.qty} × ₹{item.price.toLocaleString()}
                  </p>
                </div>
                <p className="font-semibold">₹{item.tamount.toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{totals.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">GST (18%)</span>
              <span>₹{totals.tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-xl pt-3 border-t border-border">
              <span>Total</span>
              <span className="text-primary">₹{totals.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border p-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Button
            onClick={() => handleGenerateInvoice('pending')}
            disabled={isProcessing}
            variant="outline"
            className="flex-1 h-14 text-base"
          >
            <Clock className="h-5 w-5 mr-2" />
            Mark Pending
          </Button>
          <Button
            onClick={() => handleGenerateInvoice('paid')}
            disabled={isProcessing}
            className="flex-1 h-14 text-base bg-gradient-primary hover:opacity-90"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Mark Paid
          </Button>
        </div>
      </div>
    </motion.div>
  );
};