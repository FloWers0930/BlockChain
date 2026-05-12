# Statio Nexus - Production Deployment Guide

## 🚀 Quick Deployment Checklist

### ✅ Pre-Deployment Setup
1. **Environment Variables**
   ```bash
   # Backend
   cp backend/.env.production backend/.env
   # Update with your production values
   
   # Frontend
   cp frontend/.env.production frontend/.env
   # Update with your production URLs
   ```

2. **Security Updates**
   - Change all default passwords in `.env`
   - Generate new JWT secrets (minimum 64 characters)
   - Generate new VAPID keys for push notifications
   - Update MongoDB connection string to production database

3. **Domain Configuration**
   - Update `ALLOWED_ORIGINS` with your production frontend URL
   - Update `FRONTEND_URL` with your production domain
   - Update `VITE_API_URL` and `VITE_SOCKET_URL` in frontend

### 🐳 Docker Deployment
```bash
# Start Redis services
docker-compose up -d

# Verify Redis is running
docker-compose ps
```

### 🏗️ Build & Deploy
```bash
# Backend
cd backend
npm install --production
npm run build  # if available
npm start

# Frontend
cd frontend
npm install
npm run build
# Deploy the dist/ folder to your web server
```

## 🔧 Production Configuration

### Backend Environment Variables (Required)
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://.../statio-nexus-prod
JWT_SECRET=your_64_character_secret
ALLOWED_ORIGINS=https://yourdomain.com
REDIS_URL=redis://:password@host:6379
EMAIL_FROM=noreply@yourdomain.com
VAPID_PUBLIC_KEY=production_key
VAPID_PRIVATE_KEY=production_key
```

### Frontend Environment Variables (Required)
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_SOCKET_URL=https://api.yourdomain.com
```

## 🔒 Security Features Enabled

- ✅ API Rate Limiting (100 requests/15min, 5 auth attempts/15min)
- ✅ CORS Protection
- ✅ JWT Authentication with refresh tokens
- ✅ Password strength validation
- ✅ Graceful shutdown handlers
- ✅ Request logging and audit trails

## 📊 Monitoring

The application includes:
- Winston logging with file rotation
- Health check endpoint: `/api/health`
- Rate limiting with logging
- Audit trail for all user actions

## 🚨 Health Checks

Monitor these endpoints:
- `GET /api/health` - Application health
- Redis connection status in logs
- MongoDB connection status in logs
- Socket.IO connection status

## 🔄 Zero-Downtime Deployment

The application supports graceful shutdown:
- Stops accepting new connections
- Closes existing connections gracefully
- Saves all pending data
- 30-second timeout for force shutdown

## 📝 Post-Deployment

1. **Test Authentication**
   - Login with admin/owner accounts
   - Test password change functionality
   - Verify role-based access control

2. **Test Real-time Features**
   - Check Socket.IO connection
   - Test notifications
   - Verify audit trail updates

3. **Test Email**
   - Send test support ticket
   - Verify email notifications
   - Check email deliverability

4. **Database**
   - Verify data seeding worked correctly
   - Check all indexes are created
   - Test backup procedures

## 🆘 Troubleshooting

### Common Issues
- **Redis Connection**: Check docker-compose status
- **MongoDB**: Verify connection string and credentials
- **CORS**: Ensure frontend URL is in ALLOWED_ORIGINS
- **Socket.IO**: Check VITE_SOCKET_URL matches backend

### Log Locations
- Backend logs: `backend/logs/`
- Docker logs: `docker-compose logs redis`
- Application status: Check console output

## 📞 Support

For deployment issues:
1. Check application logs
2. Verify environment variables
3. Test all endpoints manually
4. Monitor database connections

---

**Your Statio Nexus application is now production-ready!** 🎉
