import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Sample product data - In production, this would come from MongoDB
const sampleProducts = [
  {
    _id: '1',
    name: 'Premium Engine Oil',
    description: 'High-quality synthetic engine oil for all vehicles',
    image: '/placeholder.svg',
    category: 'Lubricants',
    variants: [
      { size: '1L Bottle', price: 450, stock: 100, sku: 'OIL-1L' },
      { size: '5L Jar', price: 1800, stock: 50, sku: 'OIL-5L' },
      { size: '15L Tin', price: 4500, stock: 25, sku: 'OIL-15L' }
    ]
  },
  {
    _id: '2',
    name: 'Brake Fluid DOT 4',
    description: 'Premium brake fluid for all vehicles',
    image: '/placeholder.svg',
    category: 'Fluids',
    variants: [
      { size: '500ml', price: 280, stock: 150, sku: 'BF-500' },
      { size: '1L Bottle', price: 480, stock: 80, sku: 'BF-1L' }
    ]
  },
  {
    _id: '3',
    name: 'Coolant Antifreeze',
    description: 'All-season engine coolant for optimal performance',
    image: '/placeholder.svg',
    category: 'Fluids',
    variants: [
      { size: '1L Bottle', price: 320, stock: 120, sku: 'COOL-1L' },
      { size: '5L Jar', price: 1400, stock: 40, sku: 'COOL-5L' },
      { size: '20L Drum', price: 4800, stock: 15, sku: 'COOL-20L' }
    ]
  },
  {
    _id: '4',
    name: 'Transmission Fluid ATF',
    description: 'Automatic transmission fluid for smooth gear shifts',
    image: '/placeholder.svg',
    category: 'Lubricants',
    variants: [
      { size: '1L Bottle', price: 550, stock: 90, sku: 'TF-1L' },
      { size: '4L Pack', price: 1900, stock: 35, sku: 'TF-4L' }
    ]
  },
  {
    _id: '5',
    name: 'Power Steering Fluid',
    description: 'Universal power steering fluid for smooth handling',
    image: '/placeholder.svg',
    category: 'Fluids',
    variants: [
      { size: '500ml', price: 220, stock: 200, sku: 'PS-500' },
      { size: '1L Bottle', price: 380, stock: 100, sku: 'PS-1L' }
    ]
  },
  {
    _id: '6',
    name: 'Diesel Engine Oil 15W-40',
    description: 'Heavy-duty diesel engine oil for commercial vehicles',
    image: '/placeholder.svg',
    category: 'Lubricants',
    variants: [
      { size: '5L Jar', price: 2200, stock: 60, sku: 'DEO-5L' },
      { size: '10L Drum', price: 4000, stock: 30, sku: 'DEO-10L' },
      { size: '20L Drum', price: 7500, stock: 20, sku: 'DEO-20L' }
    ]
  },
  {
    _id: '7',
    name: 'Gear Oil 80W-90',
    description: 'Multi-grade gear oil for manual transmissions',
    image: '/placeholder.svg',
    category: 'Lubricants',
    variants: [
      { size: '1L Bottle', price: 350, stock: 75, sku: 'GO-1L' },
      { size: '5L Jar', price: 1500, stock: 40, sku: 'GO-5L' }
    ]
  },
  {
    _id: '8',
    name: 'Windshield Washer Fluid',
    description: 'Clear visibility windshield cleaner concentrate',
    image: '/placeholder.svg',
    category: 'Fluids',
    variants: [
      { size: '1L Bottle', price: 150, stock: 200, sku: 'WW-1L' },
      { size: '5L Jar', price: 600, stock: 80, sku: 'WW-5L' }
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