# Cloudflare R2 Setup Guide

## 1. Create an R2 Bucket

1. Log into the [Cloudflare dashboard](https://dash.cloudflare.com).
2. Navigate to **R2 Object Storage** in the left sidebar.
3. Click **Create bucket**.
4. Name it `brooky-tok-media` (or any name; update `R2_BUCKET_NAME` to match).
5. Choose a location hint close to your primary user base.

## 2. Enable Public Access

Media URLs must be publicly readable. Choose one of:

### Option A — r2.dev subdomain (development / quick start)

1. Open your bucket → **Settings** tab.
2. Under **Public access**, click **Allow Access**.
3. Copy the public URL. It looks like `https://pub-xxxx.r2.dev`.
4. Set `R2_PUBLIC_URL=https://pub-xxxx.r2.dev`.

> Note: r2.dev subdomains are rate-limited and not recommended for production traffic.

### Option B — Custom domain (recommended for production)

1. Open your bucket → **Settings** tab.
2. Under **Custom Domains**, click **Connect Domain**.
3. Enter a domain you control (e.g. `media.yourdomain.com`).
4. Cloudflare will add the required DNS records automatically if your domain's nameservers are on Cloudflare.
5. Set `R2_PUBLIC_URL=https://media.yourdomain.com`.

## 3. Create an API Token

Presigned upload URLs are signed by API credentials. The Next.js server needs write access.

1. In the R2 overview, click **Manage R2 API Tokens**.
2. Click **Create API Token**.
3. Permissions: **Object Read & Write** on the specific bucket.
4. Copy the **Access Key ID** and **Secret Access Key** — they are shown only once.
5. Set:
   ```
   R2_ACCESS_KEY_ID=<Access Key ID>
   R2_SECRET_ACCESS_KEY=<Secret Access Key>
   ```

## 4. Find Your Account ID

Your account ID is visible in:

- The Cloudflare dashboard URL: `https://dash.cloudflare.com/<account-id>/`
- The R2 overview page, under **Account details**

Set `R2_ACCOUNT_ID=733c30f447d8f47d5a78ca610dd5a358`.

## 5. CORS Configuration

For presigned PUT uploads from the browser, the R2 bucket needs a CORS policy that allows your app's origin.

In the Cloudflare dashboard, R2 CORS is configured per-bucket. As of mid-2024, Cloudflare supports CORS rules via the API or dashboard.

Minimal CORS policy:

```json
[
  {
    "AllowedOrigins": ["https://your-app.vercel.app", "http://localhost:3000"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["Content-Type", "Content-Length"],
    "MaxAgeSeconds": 3000
  }
]
```

To apply via Wrangler CLI:

```bash
wrangler r2 bucket cors put brooky-tok-media --file cors.json
```

## 6. Environment Variables Summary

| Variable               | Required | Description                         |
| ---------------------- | -------- | ----------------------------------- |
| `R2_ACCOUNT_ID`        | Yes      | Cloudflare account ID               |
| `R2_ACCESS_KEY_ID`     | Yes      | R2 API token access key             |
| `R2_SECRET_ACCESS_KEY` | Yes      | R2 API token secret                 |
| `R2_BUCKET_NAME`       | Yes      | Bucket name                         |
| `R2_PUBLIC_URL`        | Yes      | Public base URL (no trailing slash) |
