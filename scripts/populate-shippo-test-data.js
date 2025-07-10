/**
 * Populate test data for comprehensive Shippo integration testing
 * This script creates realistic test data for all 17 Shippo endpoints
 */

import { storage } from '../server/storage.js';
import { ShippoService } from '../server/shippo-service.js';

const shippoService = ShippoService.getInstance();

async function populateTestData() {
  console.log('🚚 Starting Shippo test data population...');
  
  try {
    // 1. Create test users (buyers and sellers)
    const testUsers = await createTestUsers();
    
    // 2. Create test products
    const testProducts = await createTestProducts(testUsers.sellers);
    
    // 3. Create test shipping addresses
    const testAddresses = await createTestAddresses(testUsers.buyers);
    
    // 4. Create test orders
    const testOrders = await createTestOrders(testUsers.buyers, testUsers.sellers, testProducts);
    
    // 5. Create test shipping rates
    const testRates = await createTestRates(testAddresses);
    
    // 6. Create test shipments
    const testShipments = await createTestShipments(testOrders, testRates);
    
    // 7. Create test tracking records
    const testTracking = await createTestTracking(testShipments);
    
    // 8. Create test return shipments
    const testReturns = await createTestReturns(testShipments);
    
    console.log('✅ Test data population completed successfully!');
    console.log('📊 Summary:');
    console.log(`  - Users: ${testUsers.buyers.length} buyers, ${testUsers.sellers.length} sellers`);
    console.log(`  - Products: ${testProducts.length}`);
    console.log(`  - Addresses: ${testAddresses.length}`);
    console.log(`  - Orders: ${testOrders.length}`);
    console.log(`  - Shipping Rates: ${testRates.length}`);
    console.log(`  - Shipments: ${testShipments.length}`);
    console.log(`  - Tracking Records: ${testTracking.length}`);
    console.log(`  - Returns: ${testReturns.length}`);
    
    return {
      users: testUsers,
      products: testProducts,
      addresses: testAddresses,
      orders: testOrders,
      rates: testRates,
      shipments: testShipments,
      tracking: testTracking,
      returns: testReturns
    };
    
  } catch (error) {
    console.error('❌ Error populating test data:', error);
    throw error;
  }
}

async function createTestUsers() {
  console.log('👥 Creating test users...');
  
  const buyers = [];
  const sellers = [];
  
  // Create test buyers
  const buyerData = [
    { id: 'test-buyer-001', email: 'buyer1@test.com', firstName: 'Alice', lastName: 'Johnson' },
    { id: 'test-buyer-002', email: 'buyer2@test.com', firstName: 'Bob', lastName: 'Smith' },
    { id: 'test-buyer-003', email: 'buyer3@test.com', firstName: 'Carol', lastName: 'Williams' },
    { id: 'test-buyer-004', email: 'buyer4@test.com', firstName: 'David', lastName: 'Brown' },
    { id: 'test-buyer-005', email: 'buyer5@test.com', firstName: 'Emma', lastName: 'Davis' }
  ];
  
  for (const userData of buyerData) {
    const user = await storage.upsertUser({
      ...userData,
      role: 'user',
      isRoasterApproved: false,
      mfaEnabled: false
    });
    buyers.push(user);
  }
  
  // Create test sellers
  const sellerData = [
    { id: 'test-seller-001', email: 'seller1@test.com', firstName: 'Frank', lastName: 'Miller' },
    { id: 'test-seller-002', email: 'seller2@test.com', firstName: 'Grace', lastName: 'Wilson' },
    { id: 'test-seller-003', email: 'seller3@test.com', firstName: 'Henry', lastName: 'Moore' }
  ];
  
  for (const userData of sellerData) {
    const user = await storage.upsertUser({
      ...userData,
      role: 'roaster',
      isRoasterApproved: true,
      mfaEnabled: false
    });
    sellers.push(user);
    
    // Create roaster profile
    await storage.createRoaster({
      userId: user.id,
      businessName: `${userData.firstName}'s Coffee Roasters`,
      businessType: 'home_roaster',
      description: `Premium coffee roasted by ${userData.firstName} ${userData.lastName}`,
      location: 'San Francisco, CA',
      isApproved: true,
      commissionRate: 0.05
    });
  }
  
  return { buyers, sellers };
}

async function createTestProducts(sellers) {
  console.log('☕ Creating test products...');
  
  const products = [];
  const productData = [
    { name: 'Ethiopian Yirgacheffe', price: 18.99, origin: 'Ethiopia', roastLevel: 'medium' },
    { name: 'Colombian Supremo', price: 16.99, origin: 'Colombia', roastLevel: 'medium-dark' },
    { name: 'Kenya AA', price: 19.99, origin: 'Kenya', roastLevel: 'light' },
    { name: 'Guatemala Antigua', price: 17.99, origin: 'Guatemala', roastLevel: 'dark' },
    { name: 'Java Estate', price: 21.99, origin: 'Indonesia', roastLevel: 'medium' },
    { name: 'Costa Rica Tarrazú', price: 20.99, origin: 'Costa Rica', roastLevel: 'light' },
    { name: 'Blue Mountain Blend', price: 29.99, origin: 'Jamaica', roastLevel: 'medium' },
    { name: 'Sumatra Mandheling', price: 18.99, origin: 'Indonesia', roastLevel: 'dark' },
    { name: 'Brazil Santos', price: 15.99, origin: 'Brazil', roastLevel: 'medium-dark' },
    { name: 'Hawaiian Kona', price: 39.99, origin: 'Hawaii', roastLevel: 'medium' }
  ];
  
  for (let i = 0; i < productData.length; i++) {
    const seller = sellers[i % sellers.length];
    const roaster = await storage.getRoasterByUserId(seller.id);
    
    const product = await storage.createProduct({
      roasterId: roaster.id,
      name: productData[i].name,
      description: `Premium ${productData[i].name} coffee beans, carefully roasted to perfection`,
      price: productData[i].price,
      weight: 12, // 12 oz bags
      origin: productData[i].origin,
      roastLevel: productData[i].roastLevel,
      processingMethod: 'washed',
      flavorNotes: ['chocolate', 'citrus', 'floral'],
      stock: 50,
      isPublished: true,
      tags: []
    });
    
    products.push(product);
  }
  
  return products;
}

async function createTestAddresses(buyers) {
  console.log('🏠 Creating test shipping addresses...');
  
  const addresses = [];
  const addressData = [
    { name: 'Alice Johnson', street: '123 Market St', city: 'San Francisco', state: 'CA', zip: '94102', phone: '415-555-0101' },
    { name: 'Bob Smith', street: '456 Broadway', city: 'New York', state: 'NY', zip: '10013', phone: '212-555-0102' },
    { name: 'Carol Williams', street: '789 Michigan Ave', city: 'Chicago', state: 'IL', zip: '60611', phone: '312-555-0103' },
    { name: 'David Brown', street: '321 Ocean Drive', city: 'Miami', state: 'FL', zip: '33139', phone: '305-555-0104' },
    { name: 'Emma Davis', street: '654 Pine St', city: 'Seattle', state: 'WA', zip: '98101', phone: '206-555-0105' },
    { name: 'Alice Johnson', street: '999 Work Plaza', city: 'Palo Alto', state: 'CA', zip: '94301', phone: '650-555-0106' },
    { name: 'Bob Smith', street: '111 Home Ave', city: 'Brooklyn', state: 'NY', zip: '11201', phone: '718-555-0107' }
  ];
  
  for (let i = 0; i < addressData.length; i++) {
    const buyer = buyers[i % buyers.length];
    
    const address = await storage.createShippingAddress({
      userId: buyer.id,
      name: addressData[i].name,
      company: i % 3 === 0 ? 'Test Company' : null,
      addressLine1: addressData[i].street,
      addressLine2: i % 4 === 0 ? 'Apt 2B' : null,
      city: addressData[i].city,
      state: addressData[i].state,
      zipCode: addressData[i].zip,
      country: 'US',
      phone: addressData[i].phone,
      isDefault: i % buyers.length === 0
    });
    
    addresses.push(address);
  }
  
  return addresses;
}

async function createTestOrders(buyers, sellers, products) {
  console.log('📦 Creating test orders...');
  
  const orders = [];
  
  for (let i = 0; i < 8; i++) {
    const buyer = buyers[i % buyers.length];
    const seller = sellers[i % sellers.length];
    const product = products[i % products.length];
    
    const order = await storage.createOrder({
      customerId: buyer.id,
      customerEmail: buyer.email,
      totalAmount: product.price * 2, // 2 bags
      shippingAmount: 8.50,
      taxAmount: (product.price * 2) * 0.0875, // 8.75% tax
      status: i < 4 ? 'confirmed' : 'processing',
      shippingAddress: {
        name: buyer.firstName + ' ' + buyer.lastName,
        street: '123 Test St',
        city: 'Test City',
        state: 'CA',
        zipCode: '94102',
        country: 'US'
      },
      notes: `Test order ${i + 1}`
    });
    
    // Create order items
    await storage.createOrderItem({
      orderId: order.id,
      productId: product.id,
      roasterId: product.roasterId,
      quantity: 2,
      unitPrice: product.price,
      totalPrice: product.price * 2,
      grindSize: i % 2 === 0 ? 'whole_bean' : 'medium'
    });
    
    orders.push(order);
  }
  
  return orders;
}

async function createTestRates(addresses) {
  console.log('💰 Creating test shipping rates...');
  
  const rates = [];
  const carriers = ['USPS', 'UPS', 'FedEx'];
  const services = {
    'USPS': ['Ground Advantage', 'Priority Mail', 'Priority Mail Express'],
    'UPS': ['Ground', '3 Day Select', '2nd Day Air'],
    'FedEx': ['Ground', '2Day', 'Standard Overnight']
  };
  
  for (let i = 0; i < 15; i++) {
    const fromAddress = addresses[0]; // Use first address as sender
    const toAddress = addresses[(i % (addresses.length - 1)) + 1];
    const carrier = carriers[i % carriers.length];
    const service = services[carrier][i % services[carrier].length];
    
    const rate = await storage.createShippingRate({
      fromAddressId: fromAddress.id,
      toAddressId: toAddress.id,
      carrier: carrier,
      serviceName: service,
      amount: (5.99 + (i * 2.5)).toFixed(2),
      currency: 'USD',
      deliveryDays: Math.floor(Math.random() * 7) + 1,
      deliveryDate: new Date(Date.now() + (Math.floor(Math.random() * 7) + 1) * 24 * 60 * 60 * 1000)
    });
    
    rates.push(rate);
  }
  
  return rates;
}

async function createTestShipments(orders, rates) {
  console.log('🚚 Creating test shipments...');
  
  const shipments = [];
  
  for (let i = 0; i < Math.min(orders.length, rates.length); i++) {
    const order = orders[i];
    const rate = rates[i];
    
    const shipment = await storage.createShipment({
      orderId: order.id,
      rateId: rate.id,
      trackingNumber: `1Z999AA${String(i).padStart(10, '0')}`,
      carrier: rate.carrier,
      service: rate.serviceName,
      status: i < 4 ? 'label_created' : 'in_transit',
      labelUrl: `https://example.com/labels/test-${i}.pdf`,
      estimatedDeliveryDate: rate.deliveryDate,
      shippingCost: parseFloat(rate.amount),
      weight: 1.5, // 1.5 lbs
      dimensions: {
        length: 12,
        width: 8,
        height: 4,
        unit: 'in'
      }
    });
    
    shipments.push(shipment);
  }
  
  return shipments;
}

async function createTestTracking(shipments) {
  console.log('📍 Creating test tracking records...');
  
  const tracking = [];
  const trackingStatuses = [
    { status: 'label_created', location: 'Origin Facility', message: 'Shipping label created' },
    { status: 'in_transit', location: 'San Francisco, CA', message: 'Package picked up' },
    { status: 'in_transit', location: 'Oakland, CA', message: 'In transit to next facility' },
    { status: 'out_for_delivery', location: 'Destination City', message: 'Out for delivery' },
    { status: 'delivered', location: 'Destination Address', message: 'Package delivered' }
  ];
  
  for (let i = 0; i < shipments.length; i++) {
    const shipment = shipments[i];
    const numEvents = Math.floor(Math.random() * 5) + 1;
    
    for (let j = 0; j < numEvents; j++) {
      const statusInfo = trackingStatuses[j % trackingStatuses.length];
      
      const trackingRecord = await storage.createOrderTracking({
        shipmentId: shipment.id,
        status: statusInfo.status,
        location: statusInfo.location,
        message: statusInfo.message,
        timestamp: new Date(Date.now() - (numEvents - j) * 24 * 60 * 60 * 1000)
      });
      
      tracking.push(trackingRecord);
    }
  }
  
  return tracking;
}

async function createTestReturns(shipments) {
  console.log('↩️ Creating test return shipments...');
  
  const returns = [];
  const returnReasons = [
    'Customer return - wrong size',
    'Customer return - not as expected',
    'Damaged in transit',
    'Customer return - changed mind',
    'Defective product'
  ];
  
  // Create returns for about 30% of shipments
  for (let i = 0; i < Math.floor(shipments.length * 0.3); i++) {
    const shipment = shipments[i * 2]; // Every other shipment
    const reason = returnReasons[i % returnReasons.length];
    
    const returnShipment = await storage.createReturnShipment({
      originalShipmentId: shipment.id,
      returnTrackingNumber: `RT999AA${String(i).padStart(10, '0')}`,
      reason: reason,
      status: i % 2 === 0 ? 'requested' : 'approved',
      refundAmount: shipment.shippingCost * 0.8, // 80% refund
      returnLabelUrl: `https://example.com/return-labels/test-${i}.pdf`,
      requestedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
    });
    
    returns.push(returnShipment);
  }
  
  return returns;
}

// Export for use in other scripts
export { populateTestData };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  populateTestData()
    .then(() => {
      console.log('🎉 Test data population completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Failed to populate test data:', error);
      process.exit(1);
    });
}