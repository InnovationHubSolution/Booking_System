# Login Instructions

## Issue Resolved
The login issue was caused by the **frontend development server not running**. The backend was working correctly.

## Current Status
✅ **Backend Server**: Running on http://localhost:5000
✅ **Frontend Server**: Running on http://localhost:3001
✅ **MongoDB**: Running on localhost:27017
✅ **Database**: Connected with 5 test users

## How to Login

1. **Open your browser** and navigate to: http://localhost:3001
2. **Click on Login** or go to: http://localhost:3001/login
3. **Use one of the test credentials below**

## Test User Credentials

### Admin Account
- **Email**: admin@vanuatu.com
- **Password**: password123
- **Role**: Admin

### Host Accounts
- **Email**: host1@vanuatu.com
- **Password**: password123
- **Role**: Host (Property Owner)

- **Email**: host2@vanuatu.com
- **Password**: password123
- **Role**: Host (Property Owner)

### Customer Accounts
- **Email**: customer1@example.com
- **Password**: password123
- **Role**: Customer

- **Email**: customer2@example.com
- **Password**: password123
- **Role**: Customer

## Troubleshooting

### If login still fails:

1. **Check if servers are running**:
   ```powershell
   # Check backend (should show port 5000)
   netstat -ano | findstr :5000
   
   # Check frontend (should show port 3001)
   netstat -ano | findstr :3001
   
   # Check MongoDB (should show port 27017)
   netstat -ano | findstr :27017
   ```

2. **Restart Backend** (if needed):
   ```powershell
   cd c:\Users\jyaruel\booking-system\backend
   npm run dev
   ```

3. **Restart Frontend** (if needed):
   ```powershell
   cd c:\Users\jyaruel\booking-system\frontend
   npm run dev
   ```

4. **Check browser console** (F12) for any error messages

5. **Clear browser cache and cookies** for localhost

## API Endpoint Test
You can test the login API directly:
```powershell
$body = @{ email = "admin@vanuatu.com"; password = "password123" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

## What Was Fixed
- Started the frontend development server (Vite) on port 3001
- Verified backend is running correctly on port 5000
- Confirmed MongoDB is connected with user data
- Tested login endpoint successfully

## Next Steps
After logging in, you will be redirected to the properties page where you can browse available accommodations in Vanuatu.
