import shippo from 'shippo';
import { storage } from './storage';
import type { 
  ShippingAddress, 
  InsertShippingAddress, 
  RoasterShippingSettings,
  InsertShipment,
  Shipment,
  ShippingRate,
  InsertShippingRate,
  ReturnShipment,
  InsertReturnShipment
} from '@shared/schema';

// Initialize Shippo client
let shippoClient: any = null;

export function initializeShippo() {
  if (!process.env.SHIPPO_API_KEY) {
    console.log('⚠️ SHIPPO_API_KEY not found - shipping features will be limited');
    return;
  }
  
  shippoClient = shippo(process.env.SHIPPO_API_KEY);
  console.log('🚚 Shippo client initialized');
}

export class ShippoService {
  private static instance: ShippoService;
  
  public static getInstance(): ShippoService {
    if (!ShippoService.instance) {
      ShippoService.instance = new ShippoService();
    }
    return ShippoService.instance;
  }

  private constructor() {
    if (!shippoClient) {
      initializeShippo();
    }
  }

  private isShippoAvailable(): boolean {
    return shippoClient !== null;
  }

  // ==========================================
  // ADDRESS MANAGEMENT
  // ==========================================

  /**
   * Create and validate a shipping address with Shippo
   */
  async createShippingAddress(addressData: InsertShippingAddress): Promise<ShippingAddress> {
    try {
      let shippoAddressId = null;
      let isValidated = false;

      // Only use Shippo if API key is available
      if (this.isShippoAvailable()) {
        // Create address object with Shippo
        const shippoAddress = await shippoClient.address.create({
          name: addressData.name,
          company: addressData.company || '',
          street1: addressData.addressLine1,
          street2: addressData.addressLine2 || '',
          city: addressData.city,
          state: addressData.state,
          zip: addressData.zipCode,
          country: addressData.country || 'US',
          phone: addressData.phone || '',
          email: '', // Optional for shipping addresses
          validate: true
        });

        // Check if address is valid
        isValidated = shippoAddress.validation_results?.is_valid || false;
        shippoAddressId = shippoAddress.object_id;
      } else {
        // Basic validation without Shippo
        isValidated = this.basicAddressValidation(addressData);
      }
      
      // Save to database with Shippo address ID
      const dbAddress = await storage.createShippingAddress({
        ...addressData,
        shippoAddressId,
        isValidated,
      });

      return dbAddress;
    } catch (error) {
      console.error('Error creating shipping address:', error);
      throw new Error('Failed to create shipping address');
    }
  }

  /**
   * Get shipping rates for a specific route
   */
  async getShippingRates(
    fromAddressId: number,
    toAddressId: number,
    roasterId: number,
    packageInfo?: {
      weight?: number;
      length?: number;
      width?: number;
      height?: number;
    }
  ): Promise<ShippingRate[]> {
    try {
      // Get addresses from database
      const fromAddress = await storage.getShippingAddressById(fromAddressId);
      const toAddress = await storage.getShippingAddressById(toAddressId);
      const roasterSettings = await storage.getRoasterShippingSettings(roasterId);
      
      if (!fromAddress || !toAddress || !roasterSettings) {
        throw new Error('Missing required address or roaster settings');
      }

      // Check cache first
      const cachedRates = await this.getCachedShippingRates(fromAddressId, toAddressId, roasterId);
      if (cachedRates.length > 0) {
        return cachedRates;
      }

      // Create shipment to get rates
      const shipment = await shippoClient.shipment.create({
        address_from: fromAddress.shippoAddressId,
        address_to: toAddress.shippoAddressId,
        parcels: [{
          length: packageInfo?.length || roasterSettings.packageLength,
          width: packageInfo?.width || roasterSettings.packageWidth,
          height: packageInfo?.height || roasterSettings.packageHeight,
          distance_unit: 'in',
          weight: packageInfo?.weight || roasterSettings.packageWeight,
          mass_unit: 'lb'
        }],
        async: false
      });

      // Process and save rates
      const rates: ShippingRate[] = [];
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

      for (const rate of shipment.rates) {
        if (rate.provider === 'USPS' || rate.provider === 'UPS' || rate.provider === 'FedEx') {
          const shippingRate = await storage.createShippingRate({
            shippoRateId: rate.object_id,
            roasterId,
            fromAddressId,
            toAddressId,
            serviceName: rate.servicelevel.name,
            serviceToken: rate.servicelevel.token,
            carrier: rate.provider,
            amount: parseFloat(rate.amount),
            currency: rate.currency,
            estimatedDays: rate.estimated_days,
            expiresAt,
          });
          
          rates.push(shippingRate);
        }
      }

      return rates;
    } catch (error) {
      console.error('Error getting shipping rates:', error);
      throw new Error('Failed to get shipping rates');
    }
  }

  /**
   * Purchase shipping label
   */
  async purchaseShippingLabel(
    orderId: number,
    rateId: string,
    roasterId: number
  ): Promise<Shipment> {
    try {
      // Get the rate from database
      const rate = await storage.getShippingRateByShippoId(rateId);
      if (!rate) {
        throw new Error('Shipping rate not found');
      }

      // Purchase the label
      const transaction = await shippoClient.transaction.create({
        rate: rateId,
        label_file_type: 'PDF',
        async: false
      });

      if (transaction.status !== 'SUCCESS') {
        throw new Error('Failed to purchase shipping label');
      }

      // Get addresses for the shipment
      const fromAddress = await storage.getShippingAddressById(rate.fromAddressId);
      const toAddress = await storage.getShippingAddressById(rate.toAddressId);

      // Save shipment to database
      const shipment = await storage.createShipment({
        orderId,
        roasterId,
        shippoShipmentId: transaction.object_id,
        shippoTransactionId: transaction.object_id,
        trackingNumber: transaction.tracking_number,
        labelUrl: transaction.label_url,
        carrier: rate.carrier,
        serviceName: rate.serviceName,
        amount: rate.amount,
        currency: rate.currency,
        status: 'PURCHASED',
        fromAddress: fromAddress as any,
        toAddress: toAddress as any,
        packageType: 'CUSTOM', // Default for now
        weight: parseFloat('1.0'), // Default weight
        length: parseFloat('12.0'),
        width: parseFloat('9.0'),
        height: parseFloat('3.0'),
      });

      return shipment;
    } catch (error) {
      console.error('Error purchasing shipping label:', error);
      throw new Error('Failed to purchase shipping label');
    }
  }

  /**
   * Track a shipment
   */
  async trackShipment(trackingNumber: string, carrier: string) {
    try {
      const track = await shippoClient.track.create({
        tracking_number: trackingNumber,
        carrier: carrier.toLowerCase()
      });

      return {
        trackingNumber: track.tracking_number,
        carrier: track.carrier,
        status: track.tracking_status,
        statusDetails: track.tracking_status_details,
        trackingHistory: track.tracking_history?.map((event: any) => ({
          status: event.status,
          statusDetails: event.status_details,
          statusDate: new Date(event.status_date),
          location: event.location ? `${event.location.city}, ${event.location.state}` : null,
        })) || []
      };
    } catch (error) {
      console.error('Error tracking shipment:', error);
      throw new Error('Failed to track shipment');
    }
  }

  /**
   * Create return label
   */
  async createReturnLabel(
    originalShipmentId: number,
    returnReason: string,
    whoPaysCost: 'CUSTOMER' | 'ROASTER' | 'ROASTAH' = 'CUSTOMER'
  ): Promise<ReturnShipment> {
    try {
      // Get original shipment
      const originalShipment = await storage.getShipmentById(originalShipmentId);
      if (!originalShipment) {
        throw new Error('Original shipment not found');
      }

      // Create return shipment (reverse addresses)
      const returnShipment = await shippoClient.shipment.create({
        address_from: originalShipment.toAddress,
        address_to: originalShipment.fromAddress,
        parcels: [{
          length: originalShipment.length,
          width: originalShipment.width,
          height: originalShipment.height,
          distance_unit: 'in',
          weight: originalShipment.weight,
          mass_unit: 'lb'
        }],
        async: false
      });

      // Select cheapest rate (usually USPS Ground)
      const cheapestRate = returnShipment.rates.find((rate: any) => 
        rate.provider === 'USPS' && rate.servicelevel.name.includes('Ground')
      ) || returnShipment.rates[0];

      // Create return record
      const returnRecord = await storage.createReturnShipment({
        originalShipmentId,
        orderId: originalShipment.orderId,
        roasterId: originalShipment.roasterId,
        customerId: '', // Will be set by the calling function
        reason: returnReason,
        shippoShipmentId: returnShipment.object_id,
        carrier: cheapestRate.provider,
        serviceName: cheapestRate.servicelevel.name,
        amount: parseFloat(cheapestRate.amount),
        currency: cheapestRate.currency,
        status: 'APPROVED',
        whoPaysCost,
        fromAddress: originalShipment.toAddress,
        toAddress: originalShipment.fromAddress,
      });

      return returnRecord;
    } catch (error) {
      console.error('Error creating return label:', error);
      throw new Error('Failed to create return label');
    }
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  private async getCachedShippingRates(
    fromAddressId: number,
    toAddressId: number,
    roasterId: number
  ): Promise<ShippingRate[]> {
    return await storage.getCachedShippingRates(fromAddressId, toAddressId, roasterId);
  }

  /**
   * Webhook handler for Shippo events
   */
  async handleWebhook(event: any) {
    try {
      switch (event.event) {
        case 'track_updated':
          await this.handleTrackingUpdate(event.data);
          break;
        case 'transaction_created':
          await this.handleTransactionCreated(event.data);
          break;
        case 'transaction_updated':
          await this.handleTransactionUpdated(event.data);
          break;
        default:
          console.log(`Unhandled webhook event: ${event.event}`);
      }
    } catch (error) {
      console.error('Error handling Shippo webhook:', error);
    }
  }

  private async handleTrackingUpdate(trackingData: any) {
    // Update shipment tracking in database
    await storage.updateShipmentTracking(trackingData.tracking_number, {
      status: trackingData.tracking_status,
      statusDetails: trackingData.tracking_status_details,
      location: trackingData.location,
    });
  }

  private async handleTransactionCreated(transactionData: any) {
    // Handle transaction creation if needed
    console.log('Transaction created:', transactionData.object_id);
  }

  private async handleTransactionUpdated(transactionData: any) {
    // Handle transaction updates if needed
    console.log('Transaction updated:', transactionData.object_id);
  }

  /**
   * Basic address validation without Shippo
   */
  private basicAddressValidation(addressData: InsertShippingAddress): boolean {
    // Basic validation checks
    const hasRequiredFields = !!(
      addressData.name &&
      addressData.addressLine1 &&
      addressData.city &&
      addressData.state &&
      addressData.zipCode
    );

    const hasValidZip = /^\d{5}(-\d{4})?$/.test(addressData.zipCode);
    const hasValidState = /^[A-Z]{2}$/.test(addressData.state);

    return hasRequiredFields && hasValidZip && hasValidState;
  }

  /**
   * Get mock shipping rates when Shippo is not available
   */
  private async getMockShippingRates(
    fromAddressId: number,
    toAddressId: number,
    roasterId: number,
    packageInfo: any
  ): Promise<ShippingRate[]> {
    const mockRates = [
      {
        shippoRateId: 'mock_ground',
        serviceName: 'Ground',
        serviceType: 'GROUND',
        carrier: 'USPS',
        amount: 8.99,
        currency: 'USD',
        estimatedDays: 3,
        fromAddressId,
        toAddressId,
        roasterId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      },
      {
        shippoRateId: 'mock_priority',
        serviceName: 'Priority Mail',
        serviceType: 'PRIORITY',
        carrier: 'USPS',
        amount: 15.99,
        currency: 'USD',
        estimatedDays: 2,
        fromAddressId,
        toAddressId,
        roasterId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    ];

    // Save mock rates to database
    const savedRates = [];
    for (const rate of mockRates) {
      const savedRate = await storage.createShippingRate(rate);
      savedRates.push(savedRate);
    }

    return savedRates;
  }

  /**
   * Create mock tracking info when Shippo is not available
   */
  private getMockTrackingInfo(trackingNumber: string, carrier: string) {
    return {
      tracking_number: trackingNumber,
      carrier,
      tracking_status: 'DELIVERED',
      eta: null,
      tracking_history: [
        {
          status: 'DELIVERED',
          status_details: 'Package delivered',
          status_date: new Date().toISOString(),
          location: { city: 'New York', state: 'NY', zip: '10001' }
        }
      ]
    };
  }
}

export const shippoService = ShippoService.getInstance();