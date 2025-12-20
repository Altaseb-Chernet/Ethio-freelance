# Authentication & CORS Documentation

This document provides a comprehensive overview of the authentication system, CORS configuration, and OTP handling in the **Ethio-freelance** project.

## 1. Authentication System Overview

The application uses **JWT (JSON Web Token)** based authentication.
- **Frontend**: Stores the token in `localStorage` and attaches it to every authorized request via an Axios interceptor.
- **Backend**: Verifies the token using a middleware (`auth.js`) before allowing access to protected routes.

### User Flow
1.  **Register**: User enters details -> System sends OTP to email.
2.  **Verify OTP**: User enters OTP -> System verifies OTP -> User account is created.
3.  **Login**: User enters credentials -> System returns JWT -> Token stored in client.

---

## 2. Client-Side Implementation

### Key Files
-   **`client/src/pages/Login.jsx`**: Handles user login UI and calls `login()` from context.
-   **`client/src/pages/Register.jsx`**: Handles registration UI. It has a multi-step process (Enter details -> Submit -> Enter OTP -> Submit).
-   **`client/src/context/AuthContext.jsx`**: Manages global auth state (`user`, `token`, `isAuthenticated`). It provides `login`, `logout`, and `register` functions to the rest of the app.
-   **`client/src/utils/api.js`**: The central Axios instance.
    -   **Request Interceptor**: Automatically adds `Authorization: Bearer <token>` to headers.
    -   **Response Interceptor**: Automatically handles 401 errors (unauthorized) by logging the user out.

### Proxy vs. Direct URL
In `client/vite.config.js`, a proxy is set up:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true
  }
}
```
-   **Development**: If you make requests to `/api/...`, the proxy forwards them to port 5000, avoiding CORS issues locally.
-   **Production / Direct URL**: `client/src/utils/api.js` currently uses `http://localhost:5000/api`. This is a **direct Cross-Origin request**, which is why the Backend CORS configuration is critical.

---

## 3. Server-Side Implementation

### CORS Configuration (`server/src/index.js`)
CORS (Cross-Origin Resource Sharing) is a security feature enforced by the browser. The server must explicitly allow the client to connect.

```javascript
const allowedOrigins = [
  "http://localhost:3000",             // Local development
  "https://ethio-freelance.vercel.app" // Production frontend
];

app.use(cors({
  origin: function (origin, callback) {
    // Allows requests from allowed origins OR non-browser requests (like Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true // Allows cookies/headers to be sent
}));
```

### Auth Routes (`server/src/routes/auth.js`)
-   `POST /register`: Validates input, generates OTP, sends email. **Does not create user yet.**
-   `POST /verify-otp`: Validates OTP. **Creates user here.**
-   `POST /login`: Checks credentials, returns JWT.

### Auth Controller Logic (`server/src/controllers/authController.js`)
1.  **`register`**:
    -   Checks if email exists.
    -   Generates 6-digit OTP.
    -   Stores `email`, `OTP`, and `userData` in a temporary in-memory object (`otpStore`).
    -   Sends email using `emailService.js`.
2.  **`verifyOTP`**:
    -   Looks up email in `otpStore`.
    -   Checks matching code and expiration.
    -   If valid, creates the `User` document in MongoDB.
    -   Clears the OTP record.

---

## 4. OTP Implementation & Improvements

### Current Implementation (In-Memory)
Currently, OTPs and temporary user data are stored in a JavaScript object variable (`otpStore` in `authController.js`).
-   **Pros**: Simple, fast, no external dependencies.
-   **Cons**:
    -   **Data Loss**: If the server restarts, all pending registrations/OTPs are lost.
    -   **Scalability**: Won't work if you have multiple server instances.
    -   **Memory Leak Risk**: If `delete otpStore[email]` fails or isn't called, data stays in memory (though a cleanup mechanism could be added).

### Recommended Implementation (Production)
For a robust system, avoid in-memory storage.

#### Option A: Redis (Best for Performance)
Store OTPs in a Redis cache with a TTL (Time To Live).
-   Key: `otp:${email}`, Value: `{ code, userData }`
-   Expires: 10 minutes (handled automatically by Redis).

#### Option B: Database (MongoDB)
Create a temporary collection/model called `PendingUser` or `OTP`.
1.  **Schema**:
    ```javascript
    const OTPSchema = new Schema({
      email: { type: String, required: true },
      otp: { type: String, required: true },
      userData: { type: Object, required: true }, // Store the registration form data here
      createdAt: { type: Date, expires: '10m', default: Date.now } // MongoDB auto-deletes after 10m
    });
    ```
2.  **Flow**:
    -   **Register**: Save doc to `OTP` collection.
    -   **Verify**: Find doc in `OTP` collection. If found, create real `User`, then delete `OTP` doc.

### Email Service (`server/src/services/emailService.js`)
Uses `nodemailer`. Ensure your `.env` has the correct `EMAIL_USER` and `EMAIL_PASSWORD` (App Password if using Gmail).

---

## 5. Quick Check for "401 Unauthorized"
If you see 401 errors:
1.  **Check Token**: Is the token present in `localStorage`?
2.  **Check Header**: Check the Network tab in DevTools. Is `Authorization: Bearer <token>` being sent?
3.  **Check Expiry**: Has the token expired? (The frontend handles this by redirecting to login).
