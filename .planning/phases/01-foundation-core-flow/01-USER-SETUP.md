# User Setup Required: OpenAI API Key

**Plan**: 01-05 (Vision API Integration)
**Required for**: Vision API to identify warning lights and guess vehicle from photos

## What You Need to Do

The Vision API integration requires an OpenAI API key to call GPT-4o Vision.

### Step 1: Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create account
3. Navigate to: **Dashboard → API Keys**
4. Click: **"Create new secret key"**
5. Copy the key (starts with `sk-proj-...` or `sk-...`)

**Important**: Copy the key immediately - you won't be able to see it again!

### Step 2: Add to Environment File

1. Create `.env.local` in project root (if not exists):
   ```bash
   touch .env.local
   ```

2. Add your API key:
   ```bash
   VITE_OPENAI_API_KEY=sk-proj-your-actual-key-here
   ```

3. Verify `.env.local` is in `.gitignore` (already configured)

### Step 3: Restart Dev Server

If dev server is running, restart it to load new environment variable:

```bash
# Stop server (Ctrl+C)
pnpm dev
```

## Verification

Check that the environment variable is loaded:

```typescript
// In browser console or component:
console.log(import.meta.env.VITE_OPENAI_API_KEY);
// Should show your key (starts with sk-...)
```

Or test the Vision API directly:

```typescript
import { analyzeWarningLight } from '@/lib/api/openai';

// Will throw clear error if key missing/invalid
const result = await analyzeWarningLight(imageDataUrl);
```

## Expected Errors

### "OpenAI API key not configured"
- **Cause**: `VITE_OPENAI_API_KEY` missing from `.env.local`
- **Fix**: Follow Step 2 above

### "Invalid OpenAI API key"
- **Cause**: API key is incorrect or revoked
- **Fix**: Generate new key in OpenAI dashboard

### "OpenAI API rate limit exceeded"
- **Cause**: Too many requests (free tier limit: 3 RPM)
- **Fix**: Wait 60 seconds, or upgrade to paid tier

## Costs

**GPT-4o Vision Pricing** (as of Feb 2025):
- Input: $2.50 / 1M tokens
- Output: $10.00 / 1M tokens

**Estimated cost per analysis**:
- Image: ~1000 tokens ($0.0025)
- Response: ~200 tokens ($0.002)
- **Total per scan: ~$0.005 (half a cent)**

**Example usage**:
- 100 scans = $0.50
- 1,000 scans = $5.00

**Recommendation**: Start with $10 credit (2,000 scans) for testing.

## Security Notes

- `.env.local` is gitignored - never commit your API key
- VITE_ prefix exposes key to browser (acceptable for demo/testing)
- Production app should use backend proxy to hide key
- Monitor usage at: [OpenAI Platform → Usage](https://platform.openai.com/usage)

## Troubleshooting

**Key not loading after restart?**
- Check `.env.local` is in project root (not `src/`)
- Verify no typos in variable name (`VITE_OPENAI_API_KEY`)
- Hard refresh browser (Ctrl+Shift+R)

**Still seeing errors?**
- Check OpenAI account has credits: [Platform → Billing](https://platform.openai.com/account/billing)
- Verify API key hasn't been revoked: [Platform → API Keys](https://platform.openai.com/api-keys)

---

**Setup complete?** You can now test Vision API integration with dashboard photos!
