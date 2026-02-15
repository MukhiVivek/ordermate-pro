import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Sample product data - In production, this would come from MongoDB
const sampleProducts = [
  {
    _id: '1',
    name: 'Achar Masala',
    description: 'Gath Chhap premium pickle masala powder',
    image: '/products/achar-masala.jpg',
    category: 'Masala',
    variants: [
      { size: '100g', price: 30, mrp: 35, stock: 200, sku: 'ACH-100' },
      { size: '200g', price: 55, mrp: 65, stock: 150, sku: 'ACH-200' },
      { size: '500g', price: 120, mrp: 140, stock: 100, sku: 'ACH-500' }
    ]
  },
  {
    _id: '2',
    name: 'Besan',
    description: 'Gath Chhap superfine gram flour',
    image: '/products/besan.webp',
    category: 'Flour',
    variants: [
      { size: '500g', price: 45, mrp: 50, stock: 150, sku: 'BES-500' },
      { size: '1kg', price: 85, mrp: 95, stock: 100, sku: 'BES-1K' }
    ]
  },
  {
    _id: '3',
    name: 'Coriander Cumin Powder',
    description: 'Gath Chhap dhania jeera powder',
    image: '/products/dhanajiru.jpg',
    category: 'Masala',
    variants: [
      { size: '100g', price: 28, mrp: 32, stock: 200, sku: 'DJ-100' },
      { size: '200g', price: 50, mrp: 58, stock: 150, sku: 'DJ-200' },
      { size: '500g', price: 110, mrp: 130, stock: 80, sku: 'DJ-500' }
    ]
  },
  {
    _id: '4',
    name: 'Turmeric Powder',
    description: 'Gath Chhap haldi powder',
    image: '/products/haldi.jpg',
    category: 'Masala',
    variants: [
      { size: '100g', price: 22, mrp: 25, stock: 200, sku: 'HAL-100' },
      { size: '200g', price: 40, mrp: 45, stock: 150, sku: 'HAL-200' },
      { size: '500g', price: 90, mrp: 105, stock: 100, sku: 'HAL-500' }
    ]
  },
  {
    _id: '5',
    name: 'Extra Hot Chilli Powder',
    description: 'Gath Chhap extra hot mirch powder',
    image: '/products/hot-chilli.jpg',
    category: 'Masala',
    variants: [
      { size: '100g', price: 35, mrp: 40, stock: 180, sku: 'HOT-100' },
      { size: '200g', price: 65, mrp: 75, stock: 120, sku: 'HOT-200' },
      { size: '500g', price: 140, mrp: 160, stock: 60, sku: 'HOT-500' }
    ]
  },
  {
    _id: '6',
    name: 'Maida',
    description: 'Uttam superfine maida flour',
    image: '/products/maida.png',
    category: 'Flour',
    variants: [
      { size: '500g', price: 25, mrp: 28, stock: 200, sku: 'MAI-500' },
      { size: '1kg', price: 48, mrp: 54, stock: 100, sku: 'MAI-1K' }
    ]
  },
  {
    _id: '7',
    name: 'Chilli Powder',
    description: 'Gath Chhap mirch powder',
    image: '/products/chilli-powder.webp',
    category: 'Masala',
    variants: [
      { size: '100g', price: 25, mrp: 30, stock: 200, sku: 'MRC-100' },
      { size: '200g', price: 45, mrp: 55, stock: 150, sku: 'MRC-200' },
      { size: '500g', price: 100, mrp: 120, stock: 80, sku: 'MRC-500' }
    ]
  },
  {
    _id: '8',
    name: 'Moraiyo',
    description: 'Gath Chhap moraiyo fasting grain',
    image: '/products/moraiyo.jpg',
    category: 'Grain',
    variants: [
      { size: '250g', price: 40, mrp: 45, stock: 100, sku: 'MOR-250' },
      { size: '500g', price: 75, mrp: 85, stock: 60, sku: 'MOR-500' }
    ]
  },
  {
    _id: '9',
    name: 'Ragi Flour',
    description: 'Gath Chhap chakki fresh ragi ka atta',
    image: '/products/ragi.jpg',
    category: 'Flour',
    variants: [
      { size: '500g', price: 50, mrp: 58, stock: 100, sku: 'RAG-500' },
      { size: '1kg', price: 95, mrp: 110, stock: 50, sku: 'RAG-1K' }
    ]
  }
];

// In-memory invoice storage (in production, use MongoDB)
const invoices: Record<string, unknown>[] = [];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();
    
    let result;
    
    switch (action) {
      case 'getProducts':
        result = { documents: sampleProducts };
        break;
        
      case 'createInvoice':
        const invoice = {
          _id: crypto.randomUUID(),
          ...data,
          createdAt: new Date().toISOString()
        };
        invoices.push(invoice);
        result = {
          insertedId: invoice._id,
          invoice
        };
        console.log('Invoice created:', invoice.invoiceNumber);
        break;
        
      case 'updateStock':
        // In production, this would update MongoDB
        console.log('Stock update requested:', data);
        result = {
          modifiedCount: 1,
          message: 'Stock updated successfully'
        };
        break;
        
      case 'getInvoices':
        result = { documents: invoices };
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Operation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});