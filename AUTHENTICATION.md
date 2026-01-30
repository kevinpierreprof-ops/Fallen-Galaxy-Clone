## ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â Authentication Security Guide

## Overview

The Space Strategy Game implements a comprehensive, enterprise-grade authentication system with multiple layers of security.

---

## Security Features

### 1. **Password Security**

#### Password Requirements
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (@$!%*?&)

#### Password Hashing
- Uses **bcrypt** with 10 salt rounds
- Industry-standard one-way hashing
- Passwords never stored in plaintext
- Configurable salt rounds via `BCRYPT_SALT_ROUNDS` env variable

```typescript
// Example: Password is hashed before storage
const hashedPassword = await bcrypt.hash(password, 10);
```

### 2. **JWT Token Authentication**

#### Token Types

**Access Token:**
- Short-lived (7 days default)
- Used for API authentication
- Contains user ID and email
- Configurable expiration via `JWT_EXPIRES_IN`

**Refresh Token:**
- Long-lived (30 days)
- Used to obtain new access tokens
- Separate token type validation

```json
{
  "userId": "user_123",
  "email": "user@example.com",
  "type": "access",
  "iat": 1705320000,
  "exp": 1705925000
}
```

#### Token Storage
- Client should store in secure storage (httpOnly cookies or localStorage)
- Never expose tokens in URLs or console logs
- Always use HTTPS in production

### 3. **Token Blacklisting**

Implements logout functionality by blacklisting revoked tokens:
- Tokens added to blacklist on logout
- Blacklisted tokens rejected by middleware
- Auto-cleanup after token expiration
- In production, use Redis or database table

### 4. **Rate Limiting**

#### Authentication Rate Limits
- 5 failed login attempts per 15 minutes per IP/email
- Prevents brute force attacks
- Automatic reset after time window
- Returns remaining attempts in response

```typescript
const authRateLimiter = new AuthRateLimiter(5, 15 * 60 * 1000);

if (authRateLimiter.isRateLimited(email)) {
  // Reject request
}
```

### 5. **Input Validation**

Uses **Joi** for comprehensive validation:
- Email format validation
- Password strength validation
- Username format validation
- Custom error messages
- Field-level error reporting

### 6. **Account Security**

- Email uniqueness enforced
- Username uniqueness enforced
- Account status tracking (active/inactive)
- Admin flag for elevated permissions
- Last login timestamp tracking

---

## Authentication Flow

### Registration Flow

```
1. Client submits registration form
   ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“
2. Server validates input (Joi)
   ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“
3. Check email/username uniqueness
   ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“
4. Hash password with bcrypt
   ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“
5. Create user in database
   ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“
6. Generate access + refresh tokens
   ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“
7. Return tokens to client
```

### Login Flow

```
1. Client submits credentials
   ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“
2. Server validates input
   ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“
3. Find user by email
   ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“
4. Verify password with bcrypt
   ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“
5. Check account is active
   ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“
6. Update last login timestamp
   ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“
7. Generate access + refresh tokens
   ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“
8. Return tokens to client
```

### Token Refresh Flow

```
1. Client sends refresh token
   ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“
2. Verify refresh token
   ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“
3. Check token not blacklisted
   ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“
4. Validate token type = 'refresh'
   ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“
5. Generate new access token
   ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“
6. Return new access token
```

### Protected Request Flow

```
1. Client sends request with token
   ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“
2. Extract token from Authorization header
   ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“
3. Check token not blacklisted
   ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“
4. Verify JWT signature
   ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“
5. Check token not expired
   ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“
6. Attach user data to request
   ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“
7. Process request
```

---

## API Endpoints

### Public Endpoints (No Authentication)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token

### Protected Endpoints (Requires Authentication)
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get user profile
- `GET /api/auth/verify` - Verify token
- `POST /api/auth/change-password` - Change password
- `DELETE /api/auth/account` - Delete account

---

## Client Integration

### JavaScript/TypeScript Example

```typescript
import axios from 'axios';

// Set up axios instance with interceptors
const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

// Store tokens
let accessToken: string | null = null;
let refreshToken: string | null = null;

// Register user
async function register(username: string, email: string, password: string) {
  const response = await api.post('/auth/register', {
    username,
    email,
    password
  });
  
  accessToken = response.data.accessToken;
  refreshToken = response.data.refreshToken;
  
  // Store tokens securely
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  
  return response.data.user;
}

// Login user
async function login(email: string, password: string) {
  const response = await api.post('/auth/login', {
    email,
    password
  });
  
  accessToken = response.data.accessToken;
  refreshToken = response.data.refreshToken;
  
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  
  return response.data.user;
}

// Add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const response = await api.post('/auth/refresh', {
          refreshToken: localStorage.getItem('refreshToken')
        });
        
        const newAccessToken = response.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken);
        
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Make authenticated request
async function getUserProfile() {
  const response = await api.get('/auth/me');
  return response.data.user;
}

// Logout
async function logout() {
  try {
    await api.post('/auth/logout');
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }
}
```

---

## Security Best Practices

### For Developers

1. **Never Log Passwords**
   ```typescript
   // ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ Bad
   logger.info('User login:', { email, password });
   
   // ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Good
   logger.info('User login attempt:', { email });
   ```

2. **Always Use HTTPS in Production**
   ```typescript
   // Enforce HTTPS
   if (process.env.NODE_ENV === 'production' && !req.secure) {
     return res.redirect('https://' + req.headers.host + req.url);
   }
   ```

3. **Set Secure Environment Variables**
   ```env
   # Generate strong secret
   JWT_SECRET=$(openssl rand -base64 32)
   ```

4. **Validate All Input**
   ```typescript
   // Always validate before processing
   const { error, value } = schema.validate(req.body);
   if (error) {
     return res.status(400).json({ error: error.message });
   }
   ```

5. **Rate Limit Authentication Endpoints**
   ```typescript
   // Already implemented in rateLimiter middleware
   app.use('/api/auth', rateLimiter);
   ```

### For Clients

1. **Store Tokens Securely**
   - Use httpOnly cookies when possible
   - Encrypt localStorage if using it
   - Never expose in URLs

2. **Handle Token Expiration**
   - Implement automatic refresh
   - Gracefully handle auth failures
   - Clear tokens on logout

3. **Use HTTPS**
   - Always use HTTPS in production
   - Never send tokens over HTTP

4. **Implement CSRF Protection**
   - Use CSRF tokens for state-changing requests
   - Validate origin headers

---

## Common Errors

### Authentication Errors

| Error Code | Message | Solution |
|------------|---------|----------|
| `401` | Access token is required | Include Authorization header |
| `401` | Token has expired | Refresh token or re-authenticate |
| `401` | Token has been revoked | Re-authenticate (user logged out) |
| `403` | Invalid token | Token is malformed or tampered |
| `409` | Email already exists | Use different email |
| `409` | Username already taken | Use different username |
| `429` | Too many requests | Wait and retry (rate limited) |

### Password Errors

| Error | Solution |
|-------|----------|
| Password too short | Use at least 8 characters |
| Missing uppercase | Include at least one A-Z |
| Missing lowercase | Include at least one a-z |
| Missing number | Include at least one 0-9 |
| Missing special char | Include @$!%*?& |

---

## Testing Authentication

### Manual Testing

```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test@1234"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234"
  }'

# Get profile (replace TOKEN)
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer TOKEN"

# Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer TOKEN"
```

### Automated Testing

```bash
# Run authentication tests
cd backend
npm test -- authRoutes
```

---

## Migration from Old System

If migrating from an existing authentication system:

1. **Export User Data**
   ```sql
   SELECT id, username, email, created_at FROM old_users;
   ```

2. **Hash Existing Passwords**
   ```typescript
   // Users must reset passwords or
   // migrate with temporary passwords
   const tempPassword = generateSecureToken();
   await userModel.create({ ...userData, password: tempPassword });
   await sendPasswordResetEmail(user.email, tempPassword);
   ```

3. **Update Client Code**
   - Replace old auth calls
   - Implement token refresh
   - Handle new error codes

---

## Troubleshooting

### Token Issues

**Problem:** Token always returns 401
- Check JWT_SECRET is set and consistent
- Verify token format: `Bearer <token>`
- Check token not expired
- Verify token not blacklisted

**Problem:** Token refresh fails
- Ensure using refresh token, not access token
- Check refresh token not expired (30 days)
- Verify JWT_SECRET matches

### Password Issues

**Problem:** Password validation fails
- Check meets all requirements
- Verify no whitespace at start/end
- Ensure correct character encoding

**Problem:** Login fails with correct password
- Check account is active
- Verify email case (case-insensitive)
- Check rate limiting not triggered

---

## Production Deployment

### Environment Variables

```env
# Required
JWT_SECRET=<strong-random-secret>
BCRYPT_SALT_ROUNDS=10

# Optional
JWT_EXPIRES_IN=7d
NODE_ENV=production
DATABASE_PATH=/var/lib/space-strategy/database.db
```

### Security Checklist

- [ ] Use strong JWT_SECRET (32+ random characters)
- [ ] Enable HTTPS
- [ ] Set secure cookie flags
- [ ] Implement CSRF protection
- [ ] Enable rate limiting
- [ ] Use Redis for token blacklist
- [ ] Monitor failed login attempts
- [ ] Implement account lockout
- [ ] Add 2FA support (optional)
- [ ] Regular security audits

---

## Support

For authentication issues:
1. Check logs: `backend/logs/combined.log`
2. Verify environment variables
3. Test with curl commands
4. Review API documentation: `API.md`
5. Check database: `npm run db:stats`

---

**Remember:** Security is an ongoing process. Regularly update dependencies, monitor for vulnerabilities, and follow security best practices.
