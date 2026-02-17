# 🚀 Cloudflare R2 Quick Setup Guide

## Prerequisites
- Cloudflare account (free tier works!)
- Domain managed by Cloudflare (for custom domain)

---

## Step 1: Create R2 Bucket (5 minutes)

1. **Login to Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com/
   - Navigate to **R2** from left sidebar

2. **Create Bucket**
   - Click **"Create bucket"**
   - Bucket name: `hk-akademi-media` (or your choice)
   - Location: **Automatic** (Cloudflare handles global distribution)
   - Click **"Create bucket"**

3. **Verify Creation**
   - You should see your new bucket in the list
   - Note the bucket name for later

---

## Step 2: Generate API Credentials (3 minutes)

1. **Navigate to R2 API Tokens**
   - From R2 dashboard, click **"Manage R2 API Tokens"**
   - Or go to: Account Home → R2 → Manage R2 API Tokens

2. **Create API Token**
   - Click **"Create API Token"**
   - Token name: `hk-akademi-upload` (descriptive name)
   - Permissions: Select **"Object Read & Write"**
   - Apply to specific buckets: Choose your bucket (`hk-akademi-media`)
   - TTL: Leave blank (no expiration) or set to 1 year

3. **Save Credentials** ⚠️ **IMPORTANT - Only shown once!**
   ```
   Access Key ID: abc123...
   Secret Access Key: xyz789...
   ```
   - Copy both values immediately
   - Store securely (password manager recommended)

4. **Get Account ID**
   - Go back to R2 bucket list
   - Look at the URL: `https://dash.cloudflare.com/{ACCOUNT_ID}/r2/default/buckets`
   - Copy the alphanumeric Account ID

---

## Step 3: Configure Environment Variables (2 minutes)

Add to your `.env` file:

```env
# ── Storage Configuration ──
STORAGE_TYPE=r2

# ── Cloudflare R2 ──
R2_ACCOUNT_ID=your-account-id-from-step-2
R2_ACCESS_KEY_ID=abc123-from-step-2
R2_SECRET_ACCESS_KEY=xyz789-from-step-2
R2_BUCKET_NAME=hk-akademi-media
R2_PUBLIC_URL=https://pub-[bucket-id].r2.dev  # Temporary URL, we'll update in Step 4
```

**Get temporary R2_PUBLIC_URL:**
1. Go to your bucket → **Settings**
2. Under **Bucket Public URL**, you'll see: `https://pub-[random-id].r2.dev`
3. Copy and paste into `R2_PUBLIC_URL`

---

## Step 4: Configure Custom Domain (Optional - 10 minutes)

### Why Custom Domain?
- ✅ Branding: `media.hkakademi.com` vs `pub-abc123.r2.dev`
- ✅ **Zero egress fees** (normally $0.09/GB on S3!)
- ✅ Better CDN performance
- ✅ SSL/TLS included

### Setup Steps

1. **Add Custom Domain to Bucket**
   - Go to your bucket → **Settings** → **Public Access**
   - Click **"Add custom domain"**
   - Enter: `media.hkakademi.com` (or your subdomain)
   - Click **"Add domain"**

2. **Cloudflare Shows DNS Instructions**
   - It will show: `Add CNAME record pointing to [bucket].r2.cloudflarestorage.com`
   - Keep this tab open!

3. **Add DNS Record**
   - Go to **Cloudflare Dashboard** → **DNS** (for your main domain)
   - Click **"Add record"**
   - Type: **CNAME**
   - Name: `media` (for media.hkakademi.com)
   - Target: `hk-akademi-media.r2.cloudflarestorage.com` (shown in step 2)
   - Proxy status: **Proxied** (orange cloud) ☑️
   - TTL: Auto
   - Click **"Save"**

4. **Enable Public Access** ⚠️
   - Go back to R2 bucket → **Settings** → **Public Access**
   - Toggle **"Allow public access"** to ON
   - Confirm the warning

5. **Wait for DNS Propagation** (2-5 minutes)
   - DNS changes usually propagate in 2-5 minutes
   - Check status: `nslookup media.hkakademi.com`
   - Wait for CNAME to appear

6. **Update Environment Variable**
   ```env
   R2_PUBLIC_URL=https://media.hkakademi.com
   ```

7. **Test Access**
   - Upload a test file via Cloudflare dashboard
   - Try accessing: `https://media.hkakademi.com/test.txt`
   - Should return the file ✅

---

## Step 5: Configure CORS (If Needed)

**Only required if:**
- Direct browser → R2 uploads
- Client-side fetch to R2
- Embedding media cross-origin

### Setup CORS

1. **Go to Bucket Settings** → **CORS Policy**

2. **Add CORS Rule**
   ```json
   [
     {
       "AllowedOrigins": [
         "https://hkakademi.com",
         "https://www.hkakademi.com",
         "http://localhost:3000"
       ],
       "AllowedMethods": ["GET", "HEAD", "PUT", "POST"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

3. **Save CORS Configuration**

---

## Step 6: Test Upload (5 minutes)

1. **Restart Your App**
   ```bash
   # If using Docker
   docker compose restart
   
   # If using npm
   npm run dev
   ```

2. **Upload Test Image**
   - Go to admin panel: `/admin/trainings`
   - Edit any training
   - Upload an image using MediaManager
   - Check for errors in console

3. **Verify in R2 Dashboard**
   - Go to Cloudflare R2 → Your bucket
   - Click **"Browse files"**
   - You should see: `trainings/123/[random-id]_large.webp`
   - And other variants (medium, thumbnail)

4. **Test Public Access**
   - Copy a file URL from database (check media table)
   - Open in new browser tab
   - Should display image ✅

---

## Troubleshooting

### Error: "CredentialsProviderError"

**Cause:** Invalid R2 credentials

**Fix:**
1. Double-check `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY`
2. Ensure no extra spaces or quotes
3. Verify token has **Object Read & Write** permissions
4. Generate new API token if needed

### Error: "NoSuchBucket"

**Cause:** Bucket name mismatch

**Fix:**
1. Check `R2_BUCKET_NAME` matches exact bucket name
2. Bucket names are case-sensitive
3. Verify bucket exists in R2 dashboard

### Error: "Invalid account ID"

**Cause:** Wrong `R2_ACCOUNT_ID`

**Fix:**
1. Get account ID from R2 dashboard URL
2. Format: 32-character alphanumeric string
3. No dashes or special characters

### Custom Domain Not Working

**Cause:** DNS not propagated yet

**Fix:**
1. Wait 5-10 minutes for DNS
2. Check DNS: `dig media.hkakademi.com`
3. Verify CNAME points to: `[bucket].r2.cloudflarestorage.com`
4. Ensure **"Allow public access"** is enabled
5. Try incognito browser (clear DNS cache)

### 403 Forbidden on Public Access

**Cause:** Public access not enabled

**Fix:**
1. R2 Bucket → Settings → Public Access
2. Toggle **"Allow public access"** to ON
3. Confirm warning dialog
4. Test again after 1 minute

---

## Cost Estimate

### Free Tier
- **10 GB** storage free per month
- **Class A operations** (writes): 1 million/month free
- **Class B operations** (reads): 10 million/month free
- **Egress:** UNLIMITED FREE (via R2.dev or custom domain) 🎉

### Paid Tier (after free tier)
- **Storage:** $0.015/GB/month (~$1.50 for 100GB)
- **Class A ops:** $4.50 per million
- **Class B ops:** $0.36 per million

### Real-World Example

**App with:**
- 50 GB media
- 100k uploads/month
- 500k views/month

**Monthly Cost:**
- Storage: 40GB paid × $0.015 = **$0.60**
- Writes: Free (under 1M limit)
- Reads: Free (under 10M limit)
- Egress: **$0** (R2 killer feature!)

**Total: ~$0.60/month** 🎉

Compare to AWS S3:
- Storage: $0.92
- Writes: $0.50
- Reads: $0.18
- **Egress: $45** (500k views × 2MB avg × $0.09/GB)

**AWS Total: ~$46.60/month** 😱

**R2 saves you $46/month ($552/year)!**

---

## Next Steps

1. ✅ R2 configured and tested
2. Set `STORAGE_TYPE=r2` in production `.env`
3. Deploy app with new environment variables
4. Monitor R2 dashboard for usage metrics
5. Consider background job queue for large videos

---

## Production Checklist

- [ ] R2 bucket created
- [ ] API credentials generated and stored securely
- [ ] Custom domain configured (optional but recommended)
- [ ] CORS configured (if needed)
- [ ] Test upload succeeds
- [ ] Public access verified
- [ ] Environment variables set in production
- [ ] App restarted with new config
- [ ] Old local uploads migrated (if needed)

---

## Resources

- **R2 Documentation:** https://developers.cloudflare.com/r2/
- **Pricing Calculator:** https://developers.cloudflare.com/r2/platform/pricing/
- **API Reference:** https://developers.cloudflare.com/r2/api/s3/
- **Community Forum:** https://community.cloudflare.com/c/developers/r2-object-storage/

---

**Pro Tip:** Use Cloudflare Images (separate product) for even more advanced features like automatic resizing, format conversion, and variant caching. But R2 + Sharp (current setup) is more flexible and cost-effective for most use cases!
