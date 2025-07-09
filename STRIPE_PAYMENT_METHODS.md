# Stripe Payment Methods Configuration

## Currently Implemented in Code
- **Card**: ✅ Configured
- **PayPal**: ⚠️ Needs Stripe dashboard activation
- **Amazon Pay**: ⚠️ Needs Stripe dashboard activation
- **Apple Pay**: ✅ Auto-enabled on supported devices
- **Google Pay**: ✅ Auto-enabled on supported devices

## Required Stripe Dashboard Configuration

### To Enable PayPal:
1. Go to your Stripe Dashboard → Settings → Payment Methods
2. Enable PayPal in the "Wallets" section
3. Complete PayPal integration setup

### To Enable Amazon Pay:
1. Go to your Stripe Dashboard → Settings → Payment Methods
2. Enable Amazon Pay in the "Wallets" section
3. Complete Amazon Pay integration setup

### To Disable Unwanted Methods:
1. Go to your Stripe Dashboard → Settings → Payment Methods
2. Disable "Cash App Pay" and "Klarna" if you don't want them

### Shop Pay (Shopify):
Shop Pay requires additional setup and may not be available for all Stripe accounts. Contact Stripe support for availability.

## Current Status
- The code is configured for your requested payment methods
- The checkout page will show what's enabled in your Stripe account
- You need to update your Stripe dashboard settings to match your requirements