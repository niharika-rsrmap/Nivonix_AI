# Google OAuth Configuration Fix

## Problem
You're getting these errors:
1. `The given origin is not allowed for the given client ID` - Frontend can't initialize Google login
2. `401 Unauthorized` from backend - Token verification failing

## Solution

### Step 1: Access Google Cloud Console
1. Go to https://console.cloud.google.com/
2. Make sure you're in the correct project
3. Navigate to **APIs & Services → Credentials**

### Step 2: Update OAuth Consent Screen
1. Click on the **OAuth consent screen** tab
2. Click **Edit App**
3. Scroll to **Authorized domains**
4. Add these domains (if not already present):
   - `localhost`
   - `127.0.0.1`

### Step 3: Update OAuth Client ID Configuration
1. In the **Credentials** tab, find your OAuth 2.0 Client ID:
   - **Client ID**: `340273851214-te11ivt82uuosp8eg4pghchhg8sua45d.apps.googleusercontent.com`

2. Click on it to edit

3. Add these **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   http://localhost:3000
   http://127.0.0.1:5173
   http://127.0.0.1:3000
   ```

4. Add these **Authorized redirect URIs**:
   ```
   http://localhost:5173
   http://localhost:8080/api/auth/google
   http://127.0.0.1:5173
   http://127.0.0.1:8080/api/auth/google
   ```

5. **Save** the changes

### Step 4: Verify Backend Configuration
Your backend is now properly configured:
- ✅ Server running on `http://localhost:8080`
- ✅ Google auth route: `/api/auth/google`
- ✅ Client ID matches frontend

### Step 5: Test Again
1. Clear browser cache/cookies
2. Restart the frontend dev server (if running)
3. Try Google login again

## Backend Setup Summary
The backend has been fixed with:
- ✅ Proper `server.js` entry point
- ✅ CORS enabled for localhost:5173 and 8080
- ✅ All required dependencies installed
- ✅ Enhanced error logging for debugging

## Running the Servers

### Backend
```bash
cd backend
node server.js
# Server will run on http://localhost:8080
```

### Frontend
```bash
cd Frontend
npm run dev
# Server will run on http://localhost:5173
```

## If Token Verification Still Fails
Check the backend console logs for the actual error. Common issues:
1. Token is expired
2. Wrong Client ID (frontend vs backend mismatch)
3. CORS headers missing
4. MongoDB connection issue (if saving user)

The backend now logs detailed error messages to help debug.
