# Sereniquee Candles Store

The Sereniquee Candles storefront and admin dashboard use React, Vite, TypeScript, Supabase, and Vercel serverless email endpoints.

## Local development

1. Install Node.js and npm.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env` and set the Supabase URL and publishable key, plus the UPI ID, payee name, and QR image path used by checkout.
4. Start the local site with `npm run dev`.
5. Create a production bundle with `npm run build`.

## Payments and shipping

UPI product payments use manual UTR verification; COD product balances are collected on delivery. Shipping is quoted after an order is placed based on address, parcel weight, and courier-partner pricing. Customers approve the emailed quote and pay the shipping fee separately by UPI. Shipping payment must be verified before dispatch.

Apply the Supabase migrations in timestamp order before deploying schema-dependent changes. Server-side email functions require `RESEND_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` in the deployment environment. Never put the service-role key in a `VITE_` variable.

The email sender uses `team@sereniqueecandles.com`; verify the sending domain with the email provider and configure the domain records it supplies. The public site and canonical URLs use `https://www.sereniqueecandles.com`.
