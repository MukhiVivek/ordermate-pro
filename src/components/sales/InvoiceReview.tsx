import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, CheckCircle, Clock, Download, User, Phone } from 'lucide-react';
import { CartItem, InvoiceItem } from '@/types/sales';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid'>('pending');

  const generateInvoiceNumber = () => {
    const date = new Date();
    const prefix = 'INV';
    const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${datePart}-${random}`;
  };

  const handleGenerateInvoice = async (status: 'pending' | 'paid') => {
    if (!customerName.trim()) {
      toast.error('Please enter customer name');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus(status);

    try {
      const newInvoiceNumber = generateInvoiceNumber();
      
      // Create invoice in MongoDB
      const { data, error } = await supabase.functions.invoke('mongodb', {
        body: {
          action: 'createInvoice',
          data: {
            invoiceNumber: newInvoiceNumber,
            items: invoiceItems,
            subtotal: totals.subtotal,
            tax: totals.tax,
            total: totals.total,
            status,
            customerName,
            customerPhone
          }
        }
      });

      if (error) throw error;

      // Update stock for each item
      for (const item of cart) {
        await supabase.functions.invoke('mongodb', {
          body: {
            action: 'updateStock',
            data: {
              productId: item.productId,
              sku: item.variant.sku,
              quantity: -item.quantity
            }
          }
        });
      }

      setInvoiceNumber(newInvoiceNumber);
      setInvoiceGenerated(true);
      toast.success(`Invoice ${newInvoiceNumber} generated!`);

    } catch (error) {
      console.error('Invoice generation error:', error);
      toast.error('Failed to generate invoice');
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
            className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center ${
              paymentStatus === 'paid' ? 'bg-success/10' : 'bg-warning/10'
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

          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            paymentStatus === 'paid' 
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
          <div className="space-y-3">
            <Input
              placeholder="Customer Name *"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="h-12 bg-muted border-border"
            />
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Phone Number (Optional)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
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