# Deployment Guide

**Version**: 1.0  
**Last Updated**: January 2025  
**Status**: ✅ Ready for Production

## 🚀 Overview

This guide covers the deployment process for the Claude Workshop website, including environment setup, build optimization, and production deployment strategies.

## 🎯 Deployment Options

### Vercel (Recommended)

**Status**: ✅ Production Ready

#### Advantages

- **Zero Configuration**: Automatic Next.js optimization
- **Global CDN**: Fast content delivery worldwide
- **Automatic Deployments**: Deploy on every push to main
- **Preview Deployments**: Test changes before production
- **Analytics**: Built-in performance monitoring

#### Setup Process

1. **Connect Repository**

   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Login to Vercel
   vercel login

   # Deploy from project directory
   vercel
   ```

2. **Configure Environment**

   ```bash
   # Set environment variables
   vercel env add NEXT_PUBLIC_SITE_URL
   vercel env add NODE_ENV
   ```

3. **Custom Domain Setup**
   ```bash
   # Add custom domain
   vercel domains add claudeworkshop.com
   ```

#### Build Configuration

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

### AWS Amplify

**Status**: ✅ Tested

#### Setup Process

1. **Connect Repository**
   - Connect GitHub repository to Amplify
   - Configure build settings

2. **Build Settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install -g pnpm
           - pnpm install
       build:
         commands:
           - pnpm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
   ```

### Netlify

**Status**: ✅ Compatible

#### Setup Process

1. **Connect Repository**
   - Connect Git repository to Netlify
   - Configure build settings

2. **Build Settings**

   ```toml
   [build]
     command = "pnpm build"
     publish = ".next"

   [build.environment]
     NODE_VERSION = "20"
   ```

## 🔧 Environment Configuration

### Required Environment Variables

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://claudeworkshop.com
NODE_ENV=production

# Optional Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

### Build Environment

```bash
# Node.js Version
NODE_VERSION=20.0.0

# Package Manager
PNPM_VERSION=10.14.0

# Build Optimization
ANALYZE=false
NEXT_TELEMETRY_DISABLED=1
```

## 📦 Build Process

### Pre-build Scripts

```json
{
  "scripts": {
    "predev": "node scripts/copy-event-images.js",
    "prebuild": "node scripts/copy-event-images.js"
  }
}
```

### Build Optimization

```javascript
// next.config.js
const nextConfig = {
  output: 'standalone',
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizeCss: true,
  },
};
```

### Bundle Analysis

```bash
# Analyze bundle size
ANALYZE=true pnpm build
```

## 🔒 Security Configuration

### Security Headers

```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
];
```

### Content Security Policy

```javascript
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  block-all-mixed-content;
  upgrade-insecure-requests;
`;
```

## 📊 Performance Optimization

### Core Web Vitals Targets

```javascript
// Performance targets
const performanceTargets = {
  LCP: 2500, // 2.5 seconds
  FID: 100, // 100 milliseconds
  CLS: 0.1, // 0.1
};
```

### Image Optimization

```javascript
// next.config.js
const nextConfig = {
  images: {
    domains: ['claudeworkshop.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
};
```

### Caching Strategy

```javascript
// Cache headers
const cacheHeaders = [
  {
    source: '/images/(.*)',
    headers: [
      {
        key: 'Cache-Control',
        value: 'public, max-age=31536000, immutable',
      },
    ],
  },
  {
    source: '/(.*)',
    headers: [
      {
        key: 'Cache-Control',
        value: 'public, max-age=3600, must-revalidate',
      },
    ],
  },
];
```

## 🔍 Monitoring & Analytics

### Performance Monitoring

```javascript
// Core Web Vitals monitoring
export function reportWebVitals(metric) {
  if (metric.label === 'web-vital') {
    console.log(metric);
    // Send to analytics service
  }
}
```

### Error Tracking

```javascript
// Error boundary with reporting
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Log error to monitoring service
    console.error('Error caught by boundary:', error, errorInfo);
  }
}
```

## 🚀 Deployment Checklist

### Pre-deployment

- [x] All tests passing
- [x] Build successful locally
- [x] Environment variables configured
- [x] Security headers implemented
- [x] Performance optimization applied
- [x] SEO metadata configured
- [x] Accessibility compliance verified

### Deployment

- [x] Repository connected to deployment platform
- [x] Build settings configured
- [x] Environment variables set
- [x] Custom domain configured
- [x] SSL certificate enabled
- [x] CDN configuration optimized

### Post-deployment

- [x] Site loads correctly
- [x] All pages accessible
- [x] Images loading properly
- [x] Performance metrics acceptable
- [x] SEO validation passed
- [x] Mobile responsiveness verified

## 🔄 Continuous Deployment

### GitHub Actions (Optional)

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm build
      - run: pnpm test
```

### Automated Testing

```bash
# Pre-deployment tests
pnpm lint
pnpm type-check
pnpm test
pnpm build
```

## 🛠️ Troubleshooting

### Common Issues

#### Build Failures

```bash
# Clear cache and rebuild
rm -rf .next node_modules
pnpm install
pnpm build
```

#### Image Optimization Issues

```bash
# Verify image paths
pnpm run verify-images

# Copy images manually
node scripts/copy-event-images.js
```

#### Performance Issues

```bash
# Analyze bundle
ANALYZE=true pnpm build

# Check Core Web Vitals
# Use Lighthouse or PageSpeed Insights
```

### Debug Commands

```bash
# Development server
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint

# Type check
pnpm type-check

# Run tests
pnpm test
```

## 📈 Post-deployment Monitoring

### Health Checks

- **Uptime Monitoring**: 99.9% target
- **Performance Monitoring**: Core Web Vitals
- **Error Tracking**: JavaScript errors
- **SEO Monitoring**: Search performance

### Analytics Setup

```javascript
// Google Analytics
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// Google Tag Manager
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
```

## 🔮 Future Enhancements

### Planned Improvements

- **Edge Functions**: Serverless functions for dynamic content
- **ISR (Incremental Static Regeneration)**: Dynamic content updates
- **Advanced Caching**: Redis-based caching
- **CDN Optimization**: Multi-region content delivery
- **Real-time Features**: WebSocket integration
- **Advanced Analytics**: Custom event tracking

### Scaling Considerations

- **Traffic Spikes**: Auto-scaling configuration
- **Global Distribution**: Multi-region deployment
- **Database Integration**: Content management system
- **API Integration**: External service connections
