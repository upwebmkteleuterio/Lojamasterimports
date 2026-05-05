# AbacatePay Integration - Transparent PIX Checkout

## Overview
This document describes the integration of AbacatePay for a transparent PIX checkout experience.

## API Endpoints
- Create Transparent Charge: `POST https://api.abacatepay.com/v2/transparents/create`
- Method: `PIX`

## Edge Functions
- `abacatepay-process`: Handles order creation and AbacatePay charge initiation.
- `abacatepay-webhook`: Receives status updates from AbacatePay.

## Environment Variables
- `ABACATE_API_KEY`: API key for AbacatePay.
- `ABACATE_WEBHOOK_SECRET`: Secret for validating webhook signatures.

## Flow
1. User fills out checkout form (Name, CPF, WhatsApp).
2. Frontend calls `abacatepay-process`.
3. `abacatepay-process` creates an order in `orders` table and calls AbacatePay API.
4. AbacatePay returns PIX data (`brCode`, `brCodeBase64`).
5. Frontend displays `PIXPaymentModal` with QR Code.
6. User pays via PIX.
7. AbacatePay sends webhook to `abacatepay-webhook`.
8. `abacatepay-webhook` updates order status to 'Pago'.
9. Frontend (Realtime) detects status change and shows success message.
