# Setting Up Custom Domain for Firebase Hosting

## Method 1: Via Firebase Console (Recommended)

1. **Go to Firebase Console:**
   - https://console.firebase.google.com/
   - Select your project

2. **Open Hosting:**
   - Click "Hosting" in the left menu
   - Click "Add custom domain"

3. **Enter your domain:**
   - Enter your domain (e.g., `flickfix.com` or `www.flickfix.com`)
   - Click "Continue"

4. **Verify domain ownership:**
   - Firebase will show you DNS records to add
   - Add a TXT record to your domain's DNS settings
   - Wait for verification (can take a few minutes)

5. **Add DNS records:**
   - Firebase will provide A records or CNAME records
   - Add them to your domain's DNS settings:
     - For root domain: Add A records
     - For subdomain (www): Add CNAME record

6. **Wait for SSL certificate:**
   - Firebase automatically provisions SSL certificates
   - This can take a few hours

## Method 2: Via Firebase CLI

```bash
# Add custom domain
firebase hosting:sites:create YOUR_DOMAIN

# Or connect existing domain
firebase hosting:channel:deploy live --only hosting
```

## DNS Records Needed

### For Root Domain (flickfix.com):
```
Type: A
Name: @
Value: [IP addresses from Firebase]
```

### For Subdomain (www.flickfix.com):
```
Type: CNAME
Name: www
Value: [CNAME from Firebase]
```

## Quick Steps

1. **In Firebase Console:**
   - Hosting → Add custom domain
   - Enter domain name
   - Follow verification steps

2. **In Your Domain Registrar:**
   - Go to DNS settings
   - Add the records Firebase provides
   - Save changes

3. **Wait:**
   - DNS propagation: 5-30 minutes
   - SSL certificate: 1-24 hours

4. **Verify:**
   - Check domain in Firebase Console
   - Status should show "Connected" when ready

## Example DNS Records

Firebase will show you something like:

```
A Record:
@ → 151.101.1.195
@ → 151.101.65.195

CNAME Record:
www → your-project.web.app
```

## Troubleshooting

### "Domain verification failed"
- Make sure TXT record is added correctly
- Wait a few minutes for DNS propagation
- Check record with: `dig TXT yourdomain.com`

### "SSL certificate pending"
- This is normal, can take up to 24 hours
- Firebase will email you when ready

### "Domain not resolving"
- Check DNS records are correct
- Wait for DNS propagation (can take up to 48 hours)
- Use `dig` or `nslookup` to verify

## After Setup

Once your domain is connected:
- Your site will be available at your custom domain
- SSL certificate will be automatically provisioned
- Firebase handles all the routing

## Current Firebase URL

Your site is currently at:
- `https://fir-auth-326e8.web.app` (or similar)
- After custom domain: `https://yourdomain.com`



