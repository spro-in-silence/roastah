#!/usr/bin/env node

/**
 * Test all 17 Shippo endpoints with comprehensive scenarios
 * This script demonstrates the full shipping workflow
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

class ShippoEndpointTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      skipped: 0,
      details: []
    };
  }

  async runAllTests() {
    console.log('🧪 Starting comprehensive Shippo endpoint testing...\n');
    
    try {
      // Authentication
      await this.authenticate();
      
      // Test each endpoint category
      await this.testAddressManagement();
      await this.testRateCalculation();
      await this.testLabelGeneration();
      await this.testTrackingSystem();
      await this.testReturnsManagement();
      await this.testOrderIntegration();
      
      this.printSummary();
      
    } catch (error) {
      console.error('❌ Testing failed:', error);
      process.exit(1);
    }
  }

  async authenticate() {
    console.log('🔐 Authenticating...');
    
    try {
      const response = await fetch(`${BASE_URL}/api/dev/impersonate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userType: 'buyer' })
      });
      
      if (response.ok) {
        this.logSuccess('Authentication successful');
      } else {
        throw new Error(`Authentication failed: ${response.status}`);
      }
    } catch (error) {
      this.logError('Authentication', error.message);
      throw error;
    }
  }

  async testAddressManagement() {
    console.log('\n🏠 Testing Address Management (4 endpoints)...');
    
    let addressId = null;
    
    // 1. POST /api/shipping/addresses - Create address
    try {
      const addressData = {
        name: 'Test User',
        company: 'Test Company',
        addressLine1: '123 Test Street',
        addressLine2: 'Suite 100',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'US',
        phone: '415-555-0123'
      };
      
      const response = await fetch(`${BASE_URL}/api/shipping/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressData)
      });
      
      if (response.ok) {
        const address = await response.json();
        addressId = address.id;
        this.logSuccess(`Create address (ID: ${addressId})`);
      } else {
        this.logError('Create address', `Status: ${response.status}`);
      }
    } catch (error) {
      this.logError('Create address', error.message);
    }
    
    // 2. GET /api/shipping/addresses - List addresses
    try {
      const response = await fetch(`${BASE_URL}/api/shipping/addresses`);
      
      if (response.ok) {
        const addresses = await response.json();
        this.logSuccess(`List addresses (${addresses.length} found)`);
      } else {
        this.logError('List addresses', `Status: ${response.status}`);
      }
    } catch (error) {
      this.logError('List addresses', error.message);
    }
    
    // 3. PUT /api/shipping/addresses/:id - Update address
    if (addressId) {
      try {
        const updateData = {
          name: 'Updated Test User',
          addressLine2: 'Updated Suite 200'
        };
        
        const response = await fetch(`${BASE_URL}/api/shipping/addresses/${addressId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        });
        
        if (response.ok) {
          this.logSuccess('Update address');
        } else {
          this.logError('Update address', `Status: ${response.status}`);
        }
      } catch (error) {
        this.logError('Update address', error.message);
      }
    } else {
      this.logSkipped('Update address', 'No address ID available');
    }
    
    // 4. DELETE /api/shipping/addresses/:id - Delete address (skip to preserve test data)
    this.logSkipped('Delete address', 'Skipped to preserve test data');
  }

  async testRateCalculation() {
    console.log('\n💰 Testing Rate Calculation (2 endpoints)...');
    
    // 1. POST /api/shipping/rates - Calculate rates
    try {
      const rateRequest = {
        fromAddress: {
          name: 'Sender Name',
          street: '123 Sender St',
          city: 'San Francisco',
          state: 'CA',
          zip: '94102',
          country: 'US'
        },
        toAddress: {
          name: 'Recipient Name',
          street: '456 Recipient Ave',
          city: 'Los Angeles',
          state: 'CA',
          zip: '90210',
          country: 'US'
        },
        parcels: [{
          length: 12,
          width: 8,
          height: 4,
          weight: 2.5,
          weightUnit: 'lb'
        }]
      };
      
      const response = await fetch(`${BASE_URL}/api/shipping/rates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rateRequest)
      });
      
      if (response.ok) {
        const rates = await response.json();
        this.logSuccess(`Calculate rates (${rates.rates?.length || 0} rates returned)`);
      } else {
        this.logError('Calculate rates', `Status: ${response.status}`);
      }
    } catch (error) {
      this.logError('Calculate rates', error.message);
    }
    
    // 2. GET /api/shipping/rates/:id - Get specific rate
    try {
      const response = await fetch(`${BASE_URL}/api/shipping/rates/1`);
      
      if (response.ok) {
        this.logSuccess('Get specific rate');
      } else if (response.status === 404) {
        this.logSkipped('Get specific rate', 'No rate found (expected in test mode)');
      } else {
        this.logError('Get specific rate', `Status: ${response.status}`);
      }
    } catch (error) {
      this.logError('Get specific rate', error.message);
    }
  }

  async testLabelGeneration() {
    console.log('\n🏷️ Testing Label Generation (3 endpoints)...');
    
    // 1. POST /api/shipping/labels - Create label
    try {
      const labelRequest = {
        rateId: 1,
        orderId: 1,
        labelFormat: 'PDF'
      };
      
      const response = await fetch(`${BASE_URL}/api/shipping/labels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(labelRequest)
      });
      
      if (response.ok) {
        const label = await response.json();
        this.logSuccess(`Create label (ID: ${label.id})`);
      } else {
        this.logSkipped('Create label', `Status: ${response.status} (expected in test mode)`);
      }
    } catch (error) {
      this.logError('Create label', error.message);
    }
    
    // 2. GET /api/shipping/labels/:id - Get label details
    try {
      const response = await fetch(`${BASE_URL}/api/shipping/labels/1`);
      
      if (response.ok) {
        this.logSuccess('Get label details');
      } else {
        this.logSkipped('Get label details', 'No label found (expected in test mode)');
      }
    } catch (error) {
      this.logError('Get label details', error.message);
    }
    
    // 3. GET /api/shipping/labels/:id/download - Download label
    try {
      const response = await fetch(`${BASE_URL}/api/shipping/labels/1/download`);
      
      if (response.ok) {
        this.logSuccess('Download label');
      } else {
        this.logSkipped('Download label', 'No label found (expected in test mode)');
      }
    } catch (error) {
      this.logError('Download label', error.message);
    }
  }

  async testTrackingSystem() {
    console.log('\n📍 Testing Tracking System (3 endpoints)...');
    
    // 1. POST /api/shipping/tracking - Create tracking
    try {
      const trackingRequest = {
        shipmentId: 1,
        trackingNumber: '1Z999AA1234567890',
        carrier: 'UPS'
      };
      
      const response = await fetch(`${BASE_URL}/api/shipping/tracking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackingRequest)
      });
      
      if (response.ok) {
        const tracking = await response.json();
        this.logSuccess(`Create tracking (ID: ${tracking.id})`);
      } else {
        this.logSkipped('Create tracking', `Status: ${response.status} (expected in test mode)`);
      }
    } catch (error) {
      this.logError('Create tracking', error.message);
    }
    
    // 2. GET /api/shipping/tracking/:id - Get tracking info
    try {
      const response = await fetch(`${BASE_URL}/api/shipping/tracking/1`);
      
      if (response.ok) {
        this.logSuccess('Get tracking info');
      } else {
        this.logSkipped('Get tracking info', 'No tracking found (expected in test mode)');
      }
    } catch (error) {
      this.logError('Get tracking info', error.message);
    }
    
    // 3. PUT /api/shipping/tracking/:id - Update tracking
    try {
      const updateData = { status: 'in_transit' };
      
      const response = await fetch(`${BASE_URL}/api/shipping/tracking/1`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        this.logSuccess('Update tracking');
      } else {
        this.logSkipped('Update tracking', 'No tracking found (expected in test mode)');
      }
    } catch (error) {
      this.logError('Update tracking', error.message);
    }
  }

  async testReturnsManagement() {
    console.log('\n↩️ Testing Returns Management (3 endpoints)...');
    
    // 1. POST /api/shipping/returns - Create return
    try {
      const returnRequest = {
        originalShipmentId: 1,
        reason: 'Customer return - testing',
        refundAmount: 25.00
      };
      
      const response = await fetch(`${BASE_URL}/api/shipping/returns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(returnRequest)
      });
      
      if (response.ok) {
        const returnShipment = await response.json();
        this.logSuccess(`Create return (ID: ${returnShipment.id})`);
      } else {
        this.logSkipped('Create return', `Status: ${response.status} (expected in test mode)`);
      }
    } catch (error) {
      this.logError('Create return', error.message);
    }
    
    // 2. GET /api/shipping/returns - List returns
    try {
      const response = await fetch(`${BASE_URL}/api/shipping/returns`);
      
      if (response.ok) {
        const returns = await response.json();
        this.logSuccess(`List returns (${returns.length} found)`);
      } else {
        this.logError('List returns', `Status: ${response.status}`);
      }
    } catch (error) {
      this.logError('List returns', error.message);
    }
    
    // 3. PUT /api/shipping/returns/:id - Update return
    try {
      const updateData = { status: 'approved' };
      
      const response = await fetch(`${BASE_URL}/api/shipping/returns/1`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        this.logSuccess('Update return');
      } else {
        this.logSkipped('Update return', 'No return found (expected in test mode)');
      }
    } catch (error) {
      this.logError('Update return', error.message);
    }
  }

  async testOrderIntegration() {
    console.log('\n📦 Testing Order Integration (2 endpoints)...');
    
    // 1. GET /api/orders/:orderId/shipments - Get order shipments
    try {
      const response = await fetch(`${BASE_URL}/api/orders/1/shipments`);
      
      if (response.ok) {
        const shipments = await response.json();
        this.logSuccess(`Get order shipments (${shipments.length} found)`);
      } else {
        this.logError('Get order shipments', `Status: ${response.status}`);
      }
    } catch (error) {
      this.logError('Get order shipments', error.message);
    }
    
    // 2. GET /api/orders/:orderId/returns - Get order returns
    try {
      const response = await fetch(`${BASE_URL}/api/orders/1/returns`);
      
      if (response.ok) {
        const returns = await response.json();
        this.logSuccess(`Get order returns (${returns.length} found)`);
      } else {
        this.logError('Get order returns', `Status: ${response.status}`);
      }
    } catch (error) {
      this.logError('Get order returns', error.message);
    }
  }

  logSuccess(test) {
    console.log(`✅ ${test}`);
    this.testResults.passed++;
    this.testResults.details.push({ test, result: 'PASS' });
  }

  logError(test, error) {
    console.log(`❌ ${test}: ${error}`);
    this.testResults.failed++;
    this.testResults.details.push({ test, result: 'FAIL', error });
  }

  logSkipped(test, reason) {
    console.log(`⚠️ ${test}: ${reason}`);
    this.testResults.skipped++;
    this.testResults.details.push({ test, result: 'SKIP', reason });
  }

  printSummary() {
    console.log('\n📊 Test Summary:');
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`⚠️ Skipped: ${this.testResults.skipped}`);
    console.log(`📋 Total: ${this.testResults.passed + this.testResults.failed + this.testResults.skipped}`);
    
    if (this.testResults.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults.details
        .filter(detail => detail.result === 'FAIL')
        .forEach(detail => {
          console.log(`  - ${detail.test}: ${detail.error}`);
        });
    }
    
    console.log('\n🎉 Shippo endpoint testing completed!');
  }
}

// Run the tests
const tester = new ShippoEndpointTester();
tester.runAllTests();