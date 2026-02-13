# Updating the ECC Bank Callback URL

The ECC (Raiffeisen/UPC) payment gateway posts transaction results to a fixed callback URL on our server. If the bank requires a different callback path, follow these steps.

## Current callback path

```
/wc-api/WC_ecc
```

Full URL: `https://<your-domain>/wc-api/WC_ecc`

## How to change it

1. **Rename the route folder** to match the new path:
   ```
   src/app/(app)/wc-api/WC_ecc/route.ts
   ```
   For example, if the new path is `/api/ecc-callback`, move the file to:
   ```
   src/app/(app)/api/ecc-callback/route.ts
   ```

2. **Update the bank portal** — log into the Raiffeisen/UPC merchant portal and set the new callback URL.

3. **Deploy** — the new route takes effect after deployment.

## Notes

- The callback path is determined by the file-system location under `src/app/(app)/`. Next.js maps the folder structure directly to URL paths.
- The route handler logic in `route.ts` does not need to change — only the folder location.
- Always test with the bank's sandbox/test environment before going live.
