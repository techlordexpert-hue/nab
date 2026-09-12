import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initialProducts, initialSettings } from './src/data/initialProducts.ts';
import { Product, Order, StoreSettings } from './src/types.ts';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Persistent store setup
const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

interface AppData {
  products: Product[];
  orders: Order[];
  settings: StoreSettings;
}

let storeData: AppData = {
  products: initialProducts,
  orders: [
    {
      id: "NF-2648",
      customerName: "Kofi Owusu",
      customerPhone: "0246782648",
      deliveryMethod: "pickup",
      deliveryAddress: "Agona Nkwanta (Pickup Station)",
      items: [
        {
          productId: "pf-12x16-ring",
          name: "12 by 16 with ring",
          price: 140,
          quantity: 1,
          customNote: "Gold border finish preferred"
        }
      ],
      subtotal: 140,
      total: 140,
      status: "production",
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      customerNotes: "Please handle with care",
      timeline: [
        {
          status: "pending",
          timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
          title: "Order Placed",
          description: "Order submitted via WhatsApp & logged in system"
        },
        {
          status: "confirmed",
          timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
          title: "Order Confirmed",
          description: "NAB's FRAMES verified photo details and confirmed specs"
        },
        {
          status: "production",
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          title: "In Production / Framing",
          description: "Frame assembly and glass fitting in progress"
        }
      ]
    }
  ],
  settings: initialSettings,
};

// Load saved data if exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (fs.existsSync(STORE_FILE)) {
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed.products && Array.isArray(parsed.products)) {
      storeData.products = parsed.products;
    }
    if (parsed.orders && Array.isArray(parsed.orders)) {
      storeData.orders = parsed.orders;
    }
    if (parsed.settings) {
      storeData.settings = { ...initialSettings, ...parsed.settings };
    }
  } else {
    fs.writeFileSync(STORE_FILE, JSON.stringify(storeData, null, 2));
  }
} catch (err) {
  console.error('Error initializing store data:', err);
}

function saveStore() {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(storeData, null, 2));
  } catch (err) {
    console.error('Error saving store data:', err);
  }
}

// Real-time SSE Connections
const sseClients = new Set<Response>();

function broadcast(eventType: string, data: any) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Keep-alive ping for SSE
setInterval(() => {
  for (const client of sseClients) {
    try {
      client.write(': keepalive\n\n');
    } catch {
      sseClients.delete(client);
    }
  }
}, 20000);

// SSE endpoint for instant real-time sync across all devices
app.get('/api/events', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  res.write(`event: init\ndata: ${JSON.stringify({
    products: storeData.products,
    settings: {
      brandName: storeData.settings.brandName,
      contactNumber: storeData.settings.contactNumber,
      whatsappNumber: storeData.settings.whatsappNumber,
      location: storeData.settings.location,
    }
  })}\n\n`);

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// API Routes
app.get('/api/products', (_req: Request, res: Response) => {
  res.json(storeData.products);
});

app.get('/api/settings', (_req: Request, res: Response) => {
  const { adminPin, ...safeSettings } = storeData.settings;
  res.json(safeSettings);
});

// Order tracking
app.get('/api/orders/track/:query', (req: Request, res: Response) => {
  const query = req.params.query.trim().toUpperCase();
  const rawQuery = req.params.query.trim();
  
  const found = storeData.orders.filter(
    (o) => o.id.toUpperCase() === query || 
           o.customerPhone.replace(/[^0-9]/g, '') === rawQuery.replace(/[^0-9]/g, '')
  );

  if (found.length === 0) {
    return res.status(404).json({ message: 'No orders found matching this tracking code or phone number.' });
  }

  // Return most recent order first
  res.json(found.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
});

// Create Order (WhatsApp Order Flow)
app.post('/api/orders', (req: Request, res: Response) => {
  const { customerName, customerPhone, deliveryMethod, deliveryAddress, items, subtotal, total, customerNotes } = req.body;

  if (!customerName || !customerPhone || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Customer name, phone, and items are required.' });
  }

  const orderId = `NF-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  const newOrder: Order = {
    id: orderId,
    customerName,
    customerPhone,
    deliveryMethod: deliveryMethod || 'pickup',
    deliveryAddress: deliveryAddress || (deliveryMethod === 'pickup' ? 'Agona Nkwanta (Pickup)' : 'Delivery Address'),
    items,
    subtotal: Number(subtotal) || Number(total) || 0,
    total: Number(total) || 0,
    status: 'pending',
    createdAt: now,
    customerNotes: customerNotes || '',
    timeline: [
      {
        status: 'pending',
        timestamp: now,
        title: 'Order Placed',
        description: 'Order placed and sent to NAB’s FRAMES WhatsApp'
      }
    ]
  };

  // Reduce product stock if tracked
  items.forEach((item: any) => {
    const prod = storeData.products.find(p => p.id === item.productId);
    if (prod && prod.stock > 0) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
      if (prod.stock === 0) {
        prod.inStock = false;
      }
    }
  });

  storeData.orders.unshift(newOrder);
  saveStore();

  // Instant broadcast of updated stock and new order
  broadcast('products_updated', storeData.products);
  broadcast('order_created', newOrder);

  res.status(201).json(newOrder);
});

// Admin Authentication
app.post('/api/admin/verify-pin', (req: Request, res: Response) => {
  const { pin } = req.body;
  if (pin && String(pin) === String(storeData.settings.adminPin)) {
    return res.json({ success: true, message: 'Authorized' });
  }
  return res.status(401).json({ success: false, message: 'Invalid Admin PIN. (Default is 2648)' });
});

// Admin: Get all orders
app.get('/api/admin/orders', (req: Request, res: Response) => {
  const pin = req.headers['x-admin-pin'];
  if (String(pin) !== String(storeData.settings.adminPin)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  res.json(storeData.orders);
});

// Admin: Update Order Status
app.put('/api/admin/orders/:id/status', (req: Request, res: Response) => {
  const pin = req.headers['x-admin-pin'];
  if (String(pin) !== String(storeData.settings.adminPin)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.params;
  const { status, note } = req.body;

  const order = storeData.orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  order.status = status;
  const now = new Date().toISOString();

  let title = 'Status Updated';
  let description = note || `Order marked as ${status}`;

  if (status === 'confirmed') {
    title = 'Order Confirmed';
    description = note || 'NAB’s FRAMES confirmed the order and design specifications.';
  } else if (status === 'production') {
    title = 'In Production / Framing';
    description = note || 'Your frames/crafts are actively being assembled in our Agona Nkwanta workshop.';
  } else if (status === 'ready') {
    title = order.deliveryMethod === 'pickup' ? 'Ready for Pickup' : 'Out for Delivery';
    description = note || (order.deliveryMethod === 'pickup' ? 'Your order is ready for pickup at Agona Nkwanta!' : 'Your package is packaged and on the way for delivery.');
  } else if (status === 'completed') {
    title = 'Completed & Handed Over';
    description = note || 'Order has been successfully fulfilled. Thank you for choosing NAB’s FRAMES!';
  } else if (status === 'cancelled') {
    title = 'Order Cancelled';
    description = note || 'Order was cancelled.';
  }

  order.timeline.push({
    status,
    timestamp: now,
    title,
    description
  });

  saveStore();
  broadcast('order_updated', order);

  res.json(order);
});

// Admin: Update Product Price and Stock (Instant live reflection across all devices)
app.put('/api/admin/products/:id', (req: Request, res: Response) => {
  const pin = req.headers['x-admin-pin'];
  if (String(pin) !== String(storeData.settings.adminPin)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.params;
  const { price, stock, inStock, name, description, badge, size, image, category, withRing } = req.body;

  const product = storeData.products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  if (price !== undefined) product.price = Math.max(0, Number(price));
  if (stock !== undefined) {
    product.stock = Math.max(0, Number(stock));
    if (inStock === undefined) {
      product.inStock = product.stock > 0;
    }
  }
  if (inStock !== undefined) product.inStock = Boolean(inStock);
  if (name !== undefined) product.name = String(name);
  if (description !== undefined) product.description = String(description);
  if (badge !== undefined) product.badge = String(badge);
  if (size !== undefined) product.size = String(size);
  if (image !== undefined) product.image = String(image);
  if (category !== undefined) product.category = category;
  if (withRing !== undefined) product.withRing = Boolean(withRing);

  saveStore();
  // Broadcast instant real-time update to all connected smartphones and computers!
  broadcast('products_updated', storeData.products);

  res.json({ success: true, product, products: storeData.products });
});

// Admin: Change PIN
app.put('/api/admin/change-pin', (req: Request, res: Response) => {
  const pin = req.headers['x-admin-pin'];
  const { currentPin, newPin } = req.body;

  const activeAdminPin = String(storeData.settings.adminPin);

  if (String(pin) !== activeAdminPin && String(currentPin) !== activeAdminPin) {
    return res.status(401).json({ success: false, message: 'Current password/PIN is incorrect.' });
  }

  if (!newPin || String(newPin).trim().length < 4) {
    return res.status(400).json({ success: false, message: 'New password/PIN must be at least 4 characters.' });
  }

  storeData.settings.adminPin = String(newPin).trim();
  saveStore();

  res.json({ success: true, message: 'Admin password/PIN updated successfully.' });
});

// Admin: Add new product
app.post('/api/admin/products', (req: Request, res: Response) => {
  const pin = req.headers['x-admin-pin'];
  if (String(pin) !== String(storeData.settings.adminPin)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { name, category, price, stock, inStock, size, withRing, description, image, badge } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ message: 'Name and price are required' });
  }

  const newProduct: Product = {
    id: `custom-${Date.now()}`,
    name,
    category: category || 'picture_frames',
    price: Number(price) || 0,
    stock: stock !== undefined ? Number(stock) : 10,
    inStock: inStock !== undefined ? Boolean(inStock) : true,
    size: size || '',
    withRing: Boolean(withRing),
    description: description || 'Custom craft item from NAB’s FRAMES',
    image: image || '/images/picture_frames.jpg',
    badge: badge || ''
  };

  storeData.products.push(newProduct);
  saveStore();
  broadcast('products_updated', storeData.products);

  res.status(201).json(newProduct);
});

// Admin: Delete product
app.delete('/api/admin/products/:id', (req: Request, res: Response) => {
  const pin = req.headers['x-admin-pin'];
  if (String(pin) !== String(storeData.settings.adminPin)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.params;
  const index = storeData.products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }

  storeData.products.splice(index, 1);
  saveStore();
  broadcast('products_updated', storeData.products);

  res.json({ success: true, message: 'Product deleted' });
});

// Admin: Reset catalog to defaults if requested
app.post('/api/admin/reset-catalog', (req: Request, res: Response) => {
  const pin = req.headers['x-admin-pin'];
  if (String(pin) !== String(storeData.settings.adminPin)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  storeData.products = [...initialProducts];
  saveStore();
  broadcast('products_updated', storeData.products);
  res.json({ success: true, products: storeData.products });
});

// Start server with Vite middleware
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NAB’s FRAMES Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
