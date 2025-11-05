# Quick Netlify Deployment

## One-Click Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/transcript-request-service)

## Manual Deployment Steps

### 1. Connect Repository
1. Go to [Netlify](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your Git provider and select this repository
4. Build settings will be auto-detected from `netlify.toml`

### 2. Configure Environment Variables
Add these in Netlify dashboard → Site settings → Environment variables:

```env
DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-turso-token
PARCHMENT_SFTP_HOST=sftp.parchment.com
PARCHMENT_SFTP_USERNAME=your-username
PARCHMENT_SFTP_PASSWORD=your-password
PARCHMENT_SFTP_PATH=/incoming
NEXT_PUBLIC_APP_URL=https://your-site.netlify.app
ENCRYPTION_SECRET=your-32-character-secret
```

### 3. Deploy
Click "Deploy site" - build will start automatically.

### 4. Test
- Visit your site URL
- Check `/api/health` endpoint
- Submit a test request

## Domain Setup (Optional)
- Add custom domain in Netlify dashboard
- SSL certificate automatically provided
- Update `NEXT_PUBLIC_APP_URL` to your custom domain

## Build Configuration
Build settings are pre-configured in `netlify.toml`:
- Build command: `npm run build`
- Publish directory: `.next`
- Node version: 20
- Functions bundler: esbuild

## Support
If deployment fails:
1. Check build logs in Netlify dashboard
2. Verify all environment variables are set
3. Ensure repository includes all necessary files
4. Test health endpoint: `/api/health`