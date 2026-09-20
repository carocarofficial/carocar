# CarOcar v11 — full marketplace backend

This build includes Buy, Sell, Rent and Saathi flows plus authentication, admin approvals, document upload/verification, payments, transactions, notifications, favourites, comparisons, test drives, rental availability and Saathi seat protection.

## Local setup

1. Copy your existing `.env` into the project root.
2. `npm install`
3. `npx prisma db push`
4. `npx prisma generate`
5. `npm run db:seed`
6. `npm run dev`

Demo user: `demo@carocar.in` / `carocar123`
Admin: `admin@carocar.in` / `carocar123`

## Production connectors

- Payments: Razorpay is wired when `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` are configured. Without them, local mock payment mode is available for end-to-end testing.
- OTP: local OTP mode is available for testing. Connect your SMS provider in the OTP provider hook before production.
- Documents: local uploads are stored under `public/uploads`. For production, replace the storage adapter with S3/R2/GCS or another persistent object store.
- Admin approvals are protected by the server-side `ADMIN` role and write audit logs.
