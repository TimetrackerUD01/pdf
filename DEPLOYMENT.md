# 🚀 Deployment Guide - PDF Converter Web

## 📋 Pre-Deployment Checklist

- ✅ Node.js backend with Express.js
- ✅ Frontend HTML/CSS/JS files
- ✅ Package.json configured
- ✅ Environment variables set
- ✅ Git repository ready

## 🌐 Deployment Options

### 1. 🔥 Vercel (Recommended)

**Pros:** Free tier, automatic deployments, serverless functions
**Best for:** Node.js apps with frontend

#### Steps:
1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel
```

4. **Set Environment Variables** (if needed)
```bash
vercel env add NODE_ENV production
vercel env add PORT 3000
```

### 2. 🟣 Heroku

**Pros:** Easy deployment, free tier available
**Best for:** Full-stack applications

#### Steps:
1. **Install Heroku CLI**
2. **Login**
```bash
heroku login
```

3. **Create app**
```bash
heroku create your-app-name
```

4. **Deploy**
```bash
git push heroku main
```

5. **Set environment variables**
```bash
heroku config:set NODE_ENV=production
```

### 3. 🚄 Railway

**Pros:** Modern platform, automatic deployments
**Best for:** Node.js applications

#### Steps:
1. Go to [Railway.app](https://railway.app)
2. Connect GitHub repository
3. Deploy automatically
4. Set environment variables in dashboard

### 4. 🌊 Netlify (Frontend + Serverless Functions)

**Pros:** Great for static sites with functions
**Best for:** JAMstack applications

#### Steps:
1. Connect GitHub repository
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist` or `public`
3. Add Netlify Functions for backend

### 5. ☁️ Google Cloud Platform

**Pros:** Scalable, reliable
**Best for:** Production applications

#### Steps:
1. **Install gcloud CLI**
2. **Create app.yaml**
```yaml
runtime: nodejs16
service: default
```

3. **Deploy**
```bash
gcloud app deploy
```

### 6. 🔵 Azure App Service

**Pros:** Microsoft ecosystem
**Best for:** Enterprise applications

#### Steps:
1. Create App Service
2. Connect GitHub repository
3. Configure build settings
4. Deploy

## 🔧 Environment Configuration

### Required Environment Variables

```env
NODE_ENV=production
PORT=3000
MAX_FILE_SIZE=10485760
CLEANUP_INTERVAL=1800000
```

### Vercel Configuration (vercel.json)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}
```

### Heroku Configuration (Procfile)
```
web: node server.js
```

## 📁 File Structure for Deployment

```
pdf-converter-web/
├── 📄 index.html          # Main frontend
├── 🎨 style.css           # Styles  
├── ⚡ script.js           # Frontend JS
├── 🔧 server.js           # Backend
├── 📦 package.json        # Dependencies
├── 🌐 vercel.json         # Vercel config
├── 📋 Procfile            # Heroku config
├── 🚫 .gitignore          # Git ignore
├── 🏷️ LICENSE             # License
├── 📖 README.md           # Documentation
├── 📂 uploads/.gitkeep    # Upload directory
└── 📂 output/.gitkeep     # Output directory
```

## 🔒 Production Security

### 1. Environment Variables
- Never commit secrets to Git
- Use platform-specific environment variable management
- Set NODE_ENV=production

### 2. File Upload Security
- File type validation
- File size limits
- Automatic cleanup
- Secure file storage

### 3. API Security
- CORS configuration
- Input validation
- Error handling
- Rate limiting (optional)

## ⚡ Performance Optimization

### 1. Caching
```javascript
// Add to server.js
app.use(express.static(__dirname, {
  maxAge: '1d',
  etag: false
}));
```

### 2. Compression
```bash
npm install compression
```

```javascript
const compression = require('compression');
app.use(compression());
```

### 3. CDN (Optional)
- Use CDN for static assets
- Implement asset versioning
- Optimize images

## 🧪 Testing Deployment

### 1. Local Testing
```bash
NODE_ENV=production npm start
```

### 2. API Testing
- Test all endpoints
- Verify file upload/download
- Check error handling

### 3. Load Testing (Optional)
```bash
npm install -g artillery
artillery quick --count 10 --num 2 http://localhost:3000
```

## 📊 Monitoring & Analytics

### 1. Basic Monitoring
- Server uptime monitoring
- Error tracking
- Performance metrics

### 2. Logging
```javascript
// Add to server.js
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
```

### 3. Analytics (Optional)
- Google Analytics
- Application performance monitoring
- User behavior tracking

## 🚨 Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Node.js version
   - Verify package.json
   - Install dependencies

2. **File Upload Not Working**
   - Check file size limits
   - Verify upload directory permissions
   - Test file type validation

3. **Static Files Not Served**
   - Check static file configuration
   - Verify file paths
   - Test CORS settings

### Debug Commands
```bash
# Check logs
vercel logs
heroku logs --tail

# Test locally
NODE_ENV=production npm start
curl -X POST http://localhost:3000/api/convert/word-to-pdf
```

## 🎯 Quick Deploy Commands

### Vercel (Fastest)
```bash
npx vercel --prod
```

### Heroku
```bash
git add .
git commit -m "Deploy to production"
git push heroku main
```

### Railway
```bash
# Just push to GitHub, Railway will auto-deploy
git push origin main
```

---

**🎉 Your PDF Converter is ready for the world!**

Choose your preferred platform and deploy in minutes!
