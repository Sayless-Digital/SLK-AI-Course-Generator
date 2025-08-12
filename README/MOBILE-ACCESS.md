# Mobile Access Configuration

## Overview
This document outlines the configuration changes made to enable mobile access to the AiCourse application.

## Issues Fixed

### 1. Hardcoded Localhost URLs
**Problem**: The application was using hardcoded `localhost` URLs which don't work on mobile devices or when accessing from different network IPs.

**Solution**: Updated `src/constants.tsx` to use dynamic URL detection:
```javascript
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
  }
  return 'http://localhost:8080';
};

const getServerURL = () => {
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:3001`;
  }
  return 'http://localhost:3001';
};
```

### 2. Server Network Access
**Problem**: The server was only listening on localhost, making it inaccessible from mobile devices.

**Solution**: Updated server configuration to listen on all interfaces:
```javascript
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT} with Prisma`);
    console.log(`Server accessible at: http://0.0.0.0:${PORT}`);
});
```

### 3. CORS Configuration
**Problem**: CORS was configured with default settings which might block mobile requests.

**Solution**: Enhanced CORS configuration:
```javascript
app.use(cors({
  origin: true, // Allow all origins
  credentials: true, // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## Testing Mobile Access

### 1. Network Configuration
- **Frontend**: Accessible at `http://192.168.100.224:8080`
- **Backend**: Accessible at `http://192.168.100.224:3001`

### 2. Test Endpoints
```bash
# Health check
curl -X GET http://192.168.100.224:3001/api/health

# Login test
curl -X POST http://192.168.100.224:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@myslk.online","password":"password"}'
```

### 3. Mobile Testing Steps
1. **Connect to the same network** as the development machine
2. **Open browser** on mobile device
3. **Navigate to** `http://192.168.100.224:8080`
4. **Test sign-in/sign-up** functionality
5. **Check browser console** for any errors

## Troubleshooting

### Common Issues

1. **Network Connectivity**
   - Ensure mobile device is on the same network
   - Check firewall settings on development machine
   - Verify IP address is correct

2. **CORS Errors**
   - Check browser console for CORS-related errors
   - Verify server CORS configuration
   - Ensure proper headers are being sent

3. **Authentication Issues**
   - Check if server URLs are resolving correctly
   - Verify API endpoints are accessible
   - Test with curl commands first

### Debug Steps

1. **Check Server Status**
   ```bash
   curl -X GET http://192.168.100.224:3001/api/health
   ```

2. **Test API Endpoints**
   ```bash
   curl -X POST http://192.168.100.224:3001/api/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password"}'
   ```

3. **Check Browser Console**
   - Open developer tools on mobile browser
   - Look for network errors or JavaScript errors
   - Verify API calls are being made to correct URLs

## Configuration Files Updated

- `src/constants.tsx` - Dynamic URL configuration
- `server/server-prisma.js` - Network listening and CORS
- `vite.config.ts` - Already configured for network access

## Security Considerations

- **Development Only**: This configuration is for development purposes
- **Production**: Use proper domain names and HTTPS in production
- **Firewall**: Ensure only necessary ports are open
- **Network**: Use secure network for development 