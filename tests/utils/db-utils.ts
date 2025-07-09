import { DatabaseStorage } from '@server/storage';

// Test database utilities
export class TestDatabaseStorage extends DatabaseStorage {
  async cleanupTestData() {
    // Clean up test data after each test
    try {
      await this.pool.query('DELETE FROM orders WHERE user_id LIKE $1', ['test-%']);
      await this.pool.query('DELETE FROM cart_items WHERE user_id LIKE $1', ['test-%']);
      await this.pool.query('DELETE FROM products WHERE roaster_id IN (SELECT id FROM roasters WHERE user_id LIKE $1)', ['test-%']);
      await this.pool.query('DELETE FROM roasters WHERE user_id LIKE $1', ['test-%']);
      await this.pool.query('DELETE FROM users WHERE id LIKE $1', ['test-%']);
    } catch (error) {
      console.warn('Test cleanup failed:', error);
    }
  }

  async seedTestData() {
    // Create test users
    const testUsers = [
      {
        id: 'test-buyer-001',
        email: 'buyer@test.com',
        firstName: 'Test',
        lastName: 'Buyer',
        role: 'user',
        isRoasterApproved: false,
        mfaEnabled: false,
      },
      {
        id: 'test-seller-001',
        email: 'seller@test.com',
        firstName: 'Test',
        lastName: 'Seller',
        role: 'roaster',
        isRoasterApproved: true,
        mfaEnabled: false,
      },
    ];

    for (const user of testUsers) {
      await this.upsertUser(user);
    }

    // Create test roaster
    const testRoaster = {
      userId: 'test-seller-001',
      businessName: 'Test Coffee Roasters',
      description: 'Premium test coffee roasting',
      businessType: 'commercial',
    };

    await this.createRoaster(testRoaster);

    // Create test products
    const roaster = await this.getRoasterByUserId('test-seller-001');
    if (roaster) {
      const testProducts = [
        {
          name: 'Test Ethiopian Coffee',
          description: 'Test coffee from Ethiopia',
          price: 2499,
          roastLevel: 'medium',
          origin: 'Ethiopia',
          inStock: true,
          roasterId: roaster.id,
          imageUrl: 'https://example.com/coffee1.jpg',
        },
        {
          name: 'Test Colombian Coffee',
          description: 'Test coffee from Colombia',
          price: 2299,
          roastLevel: 'dark',
          origin: 'Colombia',
          inStock: true,
          roasterId: roaster.id,
          imageUrl: 'https://example.com/coffee2.jpg',
        },
      ];

      for (const product of testProducts) {
        await this.createProduct(product);
      }
    }
  }
}

export const testStorage = new TestDatabaseStorage();