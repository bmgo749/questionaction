# 🌐 Hostinger DNS Configuration for Vercel

## Setup Architecture
```
queit.site (Hostinger Domain) → Vercel App → Your Application
```

## 📋 DNS Configuration Steps

### 1. Login to Hostinger Control Panel
- Go to: https://hpanel.hostinger.com
- Login with your Hostinger account

### 2. Navigate to DNS Zone Editor
- Click on your domain: **queit.site**
- Go to: **DNS / Name Servers**
- Click: **DNS Zone Editor**

### 3. DNS Records Configuration

#### Option A: CNAME Records (Recommended)
```dns
# Main domain
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: 14400

# WWW subdomain
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 14400
```

#### Option B: A Records (If CNAME doesn't work)
```dns
# Main domain
Type: A
Name: @
Value: 76.76.21.21
TTL: 14400

# WWW subdomain
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 14400
```

### 4. Remove Conflicting Records
Delete any existing A records for:
- `@` (root domain)
- `www`
- Any other subdomain pointing to old servers

## 🔧 Vercel Custom Domain Setup

### 1. Add Domain in Vercel
- Go to: **Vercel Dashboard** → **Settings** → **Domains**
- Click: **Add Domain**
- Enter: `queit.site`
- Click: **Add**

### 2. Add WWW Subdomain
- Click: **Add Domain** again
- Enter: `www.queit.site`
- Click: **Add**

### 3. Verify DNS Configuration
Vercel will show DNS configuration status:
- ✅ **Valid Configuration**: DNS is correct
- ❌ **Invalid Configuration**: DNS needs adjustment

## 📊 DNS Propagation Timeline

| Time | Status |
|------|--------|
| 0-5 min | Local changes |
| 5-30 min | Regional propagation |
| 30 min-2 hours | National propagation |
| 2-24 hours | Global propagation |
| 24-48 hours | Complete propagation |

## 🧪 Testing DNS Configuration

### Check DNS Propagation
```bash
# Check if DNS is working
nslookup queit.site
nslookup www.queit.site

# Alternative check
ping queit.site
ping www.queit.site
```

### Online DNS Checker
- https://www.whatsmydns.net
- Enter: `queit.site`
- Check: A, CNAME records globally

## 🔍 Troubleshooting

### Common Issues

#### 1. DNS Not Propagating
**Problem**: Domain still shows old server
**Solution**: 
- Wait 2-24 hours for propagation
- Clear DNS cache: `ipconfig /flushdns` (Windows)
- Use incognito/private browsing

#### 2. SSL Certificate Issues
**Problem**: "Not Secure" warning
**Solution**:
- Vercel automatically provides SSL
- Wait for certificate generation (5-10 minutes)
- Check Vercel dashboard for SSL status

#### 3. Redirect Loops
**Problem**: Infinite redirects
**Solution**:
- Remove duplicate A records
- Ensure only one CNAME per subdomain
- Check Vercel domain configuration

#### 4. 404 Errors
**Problem**: Page not found
**Solution**:
- Verify Vercel deployment is live
- Check routing configuration in vercel.json
- Ensure all files are deployed

## 📞 Support Resources

### Hostinger Support
- **Knowledge Base**: https://support.hostinger.com
- **Live Chat**: Available 24/7
- **Search**: "DNS Zone Editor" or "Custom Domain"

### Vercel Support
- **Documentation**: https://vercel.com/docs
- **Community**: https://github.com/vercel/vercel/discussions
- **Support**: https://vercel.com/support

## ✅ Verification Checklist

After DNS configuration:
- [ ] DNS records added in Hostinger
- [ ] Domain added in Vercel
- [ ] SSL certificate issued
- [ ] https://queit.site loads
- [ ] https://www.queit.site loads
- [ ] No redirect loops
- [ ] All pages accessible
- [ ] API endpoints working

## 🎯 Expected Results

Once configured correctly:
- ✅ `queit.site` → Your Vercel app
- ✅ `www.queit.site` → Your Vercel app
- ✅ Automatic HTTPS
- ✅ Global CDN delivery
- ✅ All application features working

The DNS configuration typically takes 2-24 hours to fully propagate worldwide, but often works within 30 minutes for most locations.