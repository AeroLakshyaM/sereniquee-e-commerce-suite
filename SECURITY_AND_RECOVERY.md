# Security, backups, and recovery

## Secrets

- Store `GEMINI_API_KEY`, `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `VITE_SUPABASE_URL` in Vercel server environment settings. The Supabase publishable/anon key and UPI display settings are public browser configuration.
- Never commit `.env`. It is ignored by Git; `.env.example` contains placeholders only.
- A Gemini key previously placed in `VITE_GEMINI_API_KEY` was included in browser builds and may remain in Git history. Revoke/rotate that key in Google AI Studio, set the replacement as `GEMINI_API_KEY` in Vercel, redeploy, and remove the old key from any local or deployment settings.
- Restrict Vercel production environment access to trusted administrators and rotate service-role/email keys immediately if exposed.

## Database and storage access

- Browser code uses the Supabase publishable/anon key. Row Level Security remains the boundary for customer data; the service-role key is only used by server API handlers.
- Customer order creation, payment submission, expiration, and quote actions use restricted database functions. Phase 6 removes direct customer writes to `orders` and `order_items`; public custom-order and newsletter inserts now go through rate-limited server endpoints.
- Admin API routes verify the Supabase access token and the `admin` role on the server.
- Payment proof storage must remain a private bucket with the 5 MB image MIME limits from the payment-proof migration. Only admins can read/delete proof objects; upload is allowed only for an eligible pending-payment order path, and the payment-submission RPC verifies the account or guest email before accepting the UTR/proof reference.
- Apply `supabase/migrations/20261023020000_phase6_security_hardening.sql` before deploying these server form endpoints. Review new policies/functions in Supabase after migration.

## Rate limits

Limits use a private database table and an atomic server-only RPC, so they work across serverless function instances. Current defaults:

- Contact form: 5 submissions per IP per hour.
- Custom order inquiry: 4 submissions per IP per hour.
- Newsletter signup: 8 per IP and 3 per email per hour.
- Public chatbot: 12 requests per IP per hour.
- Admin AI: 10 blog requests or 5 business-insight requests per admin per hour.
- Admin order emails: 30 per admin per hour; error-report endpoint: 20 per IP per hour.
- Newsletter campaigns: 3 sends per admin per 6 hours.

Rate-limit requests fail closed if the database or service-role configuration is unavailable. Review the limits against real usage before changing them.

## Error reporting

API failures are written as structured events to Vercel Function Logs; payment, email, form, and AI handlers return safe user-facing errors without returning provider credentials. Check Vercel logs using the route and time of the failed request, and check Supabase Logs for database/RPC errors. Do not include customer payment proofs, full addresses, or secrets in support screenshots. The project does not currently send errors to a separate monitoring vendor; configure one before relying on alerts.

## Backup and restore

1. Confirm the Supabase plan's automatic backup/PITR retention in the project dashboard. Free-plan projects should create manual logical exports on a regular schedule.
2. Create a dated backup outside this repository. Use an encrypted location with access restricted to the owner. Keep database dumps and customer uploads separate from public source control.
3. For a logical database export, install the Supabase CLI and PostgreSQL client tools, set `SUPABASE_DB_URL` securely in the shell, then run:

   ```powershell
   $backupDir = Join-Path $env:TEMP ("sereniquee-backup-" + (Get-Date -Format "yyyyMMdd-HHmm"))
   New-Item -ItemType Directory -Path $backupDir | Out-Null
   npx supabase db dump --db-url $env:SUPABASE_DB_URL -f (Join-Path $backupDir "roles.sql") --role-only
   npx supabase db dump --db-url $env:SUPABASE_DB_URL -f (Join-Path $backupDir "schema.sql")
   npx supabase db dump --db-url $env:SUPABASE_DB_URL -f (Join-Path $backupDir "data.sql") --use-copy --data-only -x storage.buckets_vectors -x storage.vector_indexes
   ```

4. Supabase database dumps contain Storage metadata, not the actual uploaded files. Separately export every required Storage bucket (including `upi-payment-proofs`) through the Storage S3-compatible endpoint using an approved client such as `rclone` or Cyberduck. Store the bucket files securely; they may contain customer payment evidence.
5. Test restoration at least quarterly in a separate Supabase project. Restore roles/schema/data following Supabase's backup/restore guidance, apply/verify migrations, recreate required Auth/Storage configuration, restore bucket objects, and check that product images and order proof references resolve. Never test by resetting production.
6. Record the backup date, project, migration revision, bucket list, and restore-test result in a private operations log.

Supabase's database backup documentation explains plan-based retention and that Storage objects are not included in database backups: [Database Backups](https://supabase.com/docs/guides/platform/backups). CLI export and restore details: [Backup and Restore using the CLI](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore).

## Release checklist

- [ ] Review migrations and apply pending migrations to the intended Supabase project.
- [ ] Verify Vercel production settings: `VITE_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, and `GEMINI_API_KEY`; ensure no private key uses a `VITE_` prefix.
- [ ] Confirm `.env` is ignored and not included in the commit; rotate any key previously exposed in browser builds or Git history.
- [ ] Run `npm run build` and inspect deployment logs for API type/runtime errors.
- [ ] Smoke-test guest checkout with COD and UPI, UTR/proof submission, admin verification, quote email, and dispatch guard in a controlled test order.
- [ ] Smoke-test contact, custom inquiry, newsletter signup, admin AI, and chatbot; verify rate-limit errors are graceful.
- [ ] Confirm Vercel logs capture test failures and a recent backup exists before production changes.
