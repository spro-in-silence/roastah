# Shippo Integration Testing Guide

## Overview
The Roastah platform now includes comprehensive white label Shippo integration with 17 API endpoints covering shipping addresses, rates, labels, tracking, and returns management. This guide provides step-by-step testing instructions.

## Testing Environment Setup

### 1. Verify API Key Configuration
- ✅ SHIPPO_API_KEY is now configured in Replit Secrets
- ✅ Server logs show: "🚚 Shippo service initialized successfully"
- ✅ All 17 shipping endpoints are active

### 2. Available Test Endpoints

#### Address Management
- `POST /api/shipping/addresses` - Create shipping address
- `GET /api/shipping/addresses` - List user addresses
- `PUT /api/shipping/addresses/:id` - Update address
- `DELETE /api/shipping/addresses/:id` - Delete address

#### Shipping Rates
- `POST /api/shipping/rates` - Get shipping rates
- `GET /api/shipping/rates/:id` - Get specific rate

#### Label Generation
- `POST /api/shipping/labels` - Create shipping label
- `GET /api/shipping/labels/:id` - Get label details
- `GET /api/shipping/labels/:id/download` - Download label PDF

#### Tracking
- `POST /api/shipping/tracking` - Create tracking record
- `GET /api/shipping/tracking/:id` - Get tracking info
- `PUT /api/shipping/tracking/:id` - Update tracking

#### Returns Management
- `POST /api/shipping/returns` - Create return label
- `GET /api/shipping/returns` - List returns
- `PUT /api/shipping/returns/:id` - Update return status

#### Order Integration
- `GET /api/orders/:orderId/shipments` - Get order shipments
- `GET /api/orders/:orderId/returns` - Get order returns

## Step-by-Step Testing Process

### Phase 1: Basic Address Management

#### 1.1 Create a Shipping Address
```bash
curl -X POST http://localhost:5000/api/shipping/addresses \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "name": "John Doe",
    "company": "Test Company",
    "addressLine1": "123 Main St",
    "addressLine2": "Apt 2B",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94102",
    "country": "US",
    "phone": "415-555-0123"
  }'
```

Expected Response:
```json
{
  "id": 1,
  "name": "John Doe",
  "shippoAddressId": "abc123...",
  "isValidated": true,
  "validationMessage": "Address is valid"
}
```

#### 1.2 List All Addresses
```bash
curl -X GET http://localhost:5000/api/shipping/addresses \
  -H "Cookie: your-session-cookie"
```

### Phase 2: Shipping Rates Testing

#### 2.1 Get Shipping Rates
```bash
curl -X POST http://localhost:5000/api/shipping/rates \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "fromAddressId": 1,
    "toAddressId": 2,
    "parcels": [{
      "length": 10,
      "width": 8,
      "height": 4,
      "weight": 2.5,
      "weightUnit": "lb"
    }]
  }'
```

Expected Response:
```json
{
  "rates": [
    {
      "id": 1,
      "carrier": "USPS",
      "serviceName": "Priority Mail",
      "amount": "8.50",
      "currency": "USD",
      "deliveryDays": 2,
      "shippoRateId": "rate_abc123..."
    }
  ]
}
```

### Phase 3: Label Generation

#### 3.1 Create Shipping Label
```bash
curl -X POST http://localhost:5000/api/shipping/labels \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "rateId": 1,
    "orderId": 1,
    "labelFormat": "PDF"
  }'
```

#### 3.2 Download Label PDF
```bash
curl -X GET http://localhost:5000/api/shipping/labels/1/download \
  -H "Cookie: your-session-cookie" \
  -o shipping_label.pdf
```

### Phase 4: Tracking Integration

#### 4.1 Create Tracking Record
```bash
curl -X POST http://localhost:5000/api/shipping/tracking \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "shipmentId": 1,
    "trackingNumber": "1234567890",
    "carrier": "USPS"
  }'
```

#### 4.2 Get Tracking Information
```bash
curl -X GET http://localhost:5000/api/shipping/tracking/1 \
  -H "Cookie: your-session-cookie"
```

### Phase 5: Returns Management

#### 5.1 Create Return Label
```bash
curl -X POST http://localhost:5000/api/shipping/returns \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "originalShipmentId": 1,
    "reason": "Customer return",
    "refundAmount": 25.00
  }'
```

## Frontend Integration Testing

### 1. Shipping Address Form Component
- Navigate to checkout page
- Test the shipping address form at `/checkout`
- Verify address validation works
- Check that addresses save correctly

### 2. Seller Dashboard Integration
- Switch to seller mode: `POST /api/dev/impersonate` with `{ "role": "seller" }`
- Navigate to seller orders: `/seller/orders`
- Test shipping label generation
- Verify tracking updates

### 3. Buyer Order Tracking
- Switch to buyer mode: `POST /api/dev/impersonate` with `{ "role": "buyer" }`
- Navigate to orders page: `/orders`
- Check tracking information display
- Test tracking number links

## Browser-Based Testing

### 1. Development Environment Access
```bash
# Start the application (already running)
npm run dev

# Access the application
http://localhost:5000
```

### 2. Authentication Flow
1. Go to `/auth` to login
2. After login, go to `/dev-login` for impersonation
3. Choose buyer or seller role for testing

### 3. Manual Testing Workflow

#### As a Buyer:
1. **Place Order with Shipping**
   - Browse products at `/products`
   - Add items to cart
   - Go to checkout `/checkout`
   - Fill shipping address form
   - Complete order

2. **Track Order**
   - Navigate to `/orders`
   - View order details
   - Check tracking information

#### As a Seller:
1. **Process Orders**
   - Navigate to `/seller/orders`
   - View pending orders
   - Generate shipping labels
   - Update tracking information

2. **Manage Returns**
   - Handle return requests
   - Generate return labels
   - Update return status

## Expected Results

### Successful Integration Indicators:
- ✅ All API endpoints respond without errors
- ✅ Real shipping rates from carriers (USPS, FedEx, UPS)
- ✅ Valid shipping labels generated
- ✅ Tracking numbers update correctly
- ✅ Address validation works properly
- ✅ Return labels generate successfully

### Error Handling:
- Invalid addresses show validation errors
- Missing required fields return 400 errors
- Authentication required for all endpoints
- Graceful fallback when Shippo API is unavailable

## Troubleshooting

### Common Issues:
1. **Authentication Errors**: Ensure you're logged in and have valid session
2. **Address Validation Failures**: Check address format and completeness
3. **Rate Calculation Issues**: Verify parcel dimensions and weight
4. **Label Generation Problems**: Ensure rate is selected and valid

### Debug Commands:
```bash
# Check server logs
npm run dev

# Test API connectivity
curl -X GET http://localhost:5000/api/health

# Verify authentication
curl -X GET http://localhost:5000/api/auth/user -H "Cookie: your-session-cookie"
```

## Production Deployment Notes

### Before Production:
1. **Switch to Live Shippo API Key**
   - Replace test key with live key in secrets
   - Update webhook URLs

2. **SSL Certificate**
   - Ensure HTTPS is enabled
   - Update webhook endpoints

3. **Rate Limiting**
   - Configure appropriate rate limits
   - Monitor API usage

4. **Error Monitoring**
   - Set up error tracking
   - Monitor shipping failures

## Support

For issues or questions:
1. Check server logs for error messages
2. Verify API key configuration
3. Test with simpler requests first
4. Check Shippo dashboard for API usage and errors

The integration is now complete and ready for comprehensive testing across all shipping workflows.