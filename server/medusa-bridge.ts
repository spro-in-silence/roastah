import { Express } from 'express';
import { storage } from './storage';

// MedusaJS integration bridge for Roastah marketplace
export class MedusaBridge {
  private app: Express;

  constructor(app: Express) {
    this.app = app;
  }

  // Convert existing products to MedusaJS format
  async syncProductsToMedusa() {
    const products = await storage.getProducts();
    const medusaProducts = [];

    for (const product of products) {
      const roaster = await storage.getRoasterByUserId(product.roasterId.toString());
      
      const medusaProduct = {
        title: product.name,
        description: product.description,
        handle: product.name.toLowerCase().replace(/\s+/g, '-'),
        status: product.isActive ? 'published' : 'draft',
        variants: [{
          title: 'Default Variant',
          prices: [{
            currency_code: 'usd',
            amount: parseFloat(product.price) * 100 // Convert to cents
          }],
          inventory_quantity: product.stockQuantity,
          manage_inventory: true,
          options: [
            { value: 'whole_bean' },
            { value: 'ground' }
          ]
        }],
        options: [{
          title: 'Grind',
          values: [
            { value: 'whole_bean' },
            { value: 'ground' }
          ]
        }],
        metadata: {
          roaster_id: product.roasterId,
          roaster_name: roaster?.businessName || 'Unknown Roaster',
          origin: product.origin,
          roast_level: product.roastLevel,
          process: product.process,
          altitude: product.altitude,
          varietal: product.varietal,
          tasting_notes: product.tastingNotes
        },
        images: product.images ? product.images.map(url => ({ url })) : []
      };

      medusaProducts.push(medusaProduct);
    }

    return medusaProducts;
  }

  // Convert MedusaJS orders back to Roastah format
  async syncOrdersFromMedusa(medusaOrders: any[]) {
    const roastahOrders = [];

    for (const order of medusaOrders) {
      const roastahOrder = {
        userId: order.customer_id,
        totalAmount: (order.total / 100).toString(), // Convert from cents
        status: this.mapMedusaOrderStatus(order.status),
        shippingAddress: {
          firstName: order.shipping_address.first_name,
          lastName: order.shipping_address.last_name,
          address: order.shipping_address.address_1,
          city: order.shipping_address.city,
          state: order.shipping_address.province,
          zipCode: order.shipping_address.postal_code,
          email: order.email
        },
        items: order.items.map((item: any) => ({
          productId: parseInt(item.variant.product.metadata.roaster_product_id || '0'),
          quantity: item.quantity,
          price: (item.unit_price / 100).toString(),
          grindSize: item.variant.options?.find((opt: any) => opt.option.title === 'Grind')?.value || 'whole_bean'
        }))
      };

      roastahOrders.push(roastahOrder);
    }

    return roastahOrders;
  }

  private mapMedusaOrderStatus(medusaStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'pending',
      'completed': 'completed',
      'canceled': 'cancelled',
      'requires_action': 'processing'
    };

    return statusMap[medusaStatus] || 'pending';
  }

  // Setup routes for MedusaJS integration
  setupRoutes() {
    // Sync products to MedusaJS
    this.app.post('/api/medusa/sync-products', async (req, res) => {
      try {
        const products = await this.syncProductsToMedusa();
        res.json({ message: 'Products synced successfully', count: products.length });
      } catch (error) {
        console.error('Error syncing products:', error);
        res.status(500).json({ error: 'Failed to sync products' });
      }
    });

    // Webhook for MedusaJS orders
    this.app.post('/api/medusa/webhook/orders', async (req, res) => {
      try {
        const { event, data } = req.body;
        
        if (event === 'order.placed') {
          const roastahOrders = await this.syncOrdersFromMedusa([data]);
          
          // Process each order
          for (const orderData of roastahOrders) {
            await storage.createOrder(orderData);
          }
        }
        
        res.status(200).json({ received: true });
      } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ error: 'Failed to process webhook' });
      }
    });

    // Get MedusaJS-formatted products
    this.app.get('/api/medusa/products', async (req, res) => {
      try {
        const products = await this.syncProductsToMedusa();
        res.json({ products });
      } catch (error) {
        console.error('Error fetching MedusaJS products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
      }
    });
  }
}