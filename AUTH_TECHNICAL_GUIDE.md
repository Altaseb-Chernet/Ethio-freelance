# Authentication Technical Guide

This document provides a deep dive into the authentication system, explaining exactly how the frontend and backend interact, line by line.

## 1. System Architecture

The authentication flow relies on **JWT (JSON Web Tokens)**.

1.  **Frontend**: React (Vite)
    -   Collects user input.
    -   Calls Backend APIs.
    -   Stores the returned JWT in `localStorage`.
    -   Sends the JWT in the `Authorization` header for subsequent requests.
2.  **Backend**: Node.js (Express)
    -   Validates credentials.
    -   Generates JWTs.
    -   Verifies JWTs via middleware to protect routes.

---

## 2. Code Deep Dive: The Login Flow

### Step 1: Frontend - User Submits Login Form
**File:** `client/src/pages/Login.jsx`

```javascript
const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  // Calls the login function from AuthContext
  const result = await login(formData.email, formData.password)
  
  if (result.success) {
    navigate(from, { replace: true }) // Redirects to dashboard
  } else {
    setError(result.message) // Shows error message
  }
  setLoading(false)
}
```

### Step 2: Frontend - AuthContext Calls API
**File:** `client/src/context/AuthContext.jsx`

The `login` function wraps the API call and handles state updates.

```javascript
/* 
  This function:
  1. Calls the backend API.
  2. Extracts the token and user data from the response.
  3. Saves the token to localStorage (so it persists verify refresh).
  4. Updates the global React state (setUser, setToken).
*/
const login = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    const { token: newToken, user: userData } = response.data.data;

    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(userData);

    return { success: true };
  } catch (error) {
    // Returns a consistent error object for the UI to handle
    return {
      success: false,
      message: error.response?.data?.message || "Login failed",
    };
  }
};
```

### Step 3: Frontend - API Client (Axios)
**File:** `client/src/utils/api.js`

This file is critical. It acts as the bridge.

```javascript
/* 
  Configures the base URL. 
  In development, this usually hits http://localhost:5000/api 
*/
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: API_URL,
// ...
})

// INTERCEPTOR: Attaches the token to every request automatically!
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      // This is what the backend looks for!
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  // ...
)
```

### Step 4: Backend - Route Handler
**File:** `server/src/routes/auth.js`

The request hits `/api/auth/login`.

```javascript
// Maps the URL endpoint to the specific controller function
router.post('/login', authLimiter, login);
```

### Step 5: Backend - Controller Logic
**File:** `server/src/controllers/authController.js`

This involves looking up the user and checking the password.

```javascript
const login = [
  // ... Validations ...
  async (req, res) => {
    // 1. Find user by email
    const user = await User.findOne({ email });
    if (!user) { /* return 401 error */ }

    // 2. Verify password (using bcrypt compare)
    const isMatch = await user.comparePassword(password);
    if (!isMatch) { /* return 401 error */ }

    // 3. Generate Token
    const token = generateToken({ userId: user._id, role: user.role });

    // 4. Send response
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token, // <-- SENT TO FRONTEND
        user: { /* ... sent to frontend ... */ }
      }
    });
  }
];
```

---

## 3. Code Deep Dive: Protecting Routes (Middleware)

How does the backend know a user is logged in?

**File:** `server/src/middleware/auth.js`

This middleware is placed before any protected route (e.g., `router.get('/me', auth, getMe)`).

```javascript
const auth = async (req, res, next) => {
  try {
    // 1. Get token from header (sent by api.js interceptor)
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) { return res.status(401).json({ ... }); }

    // 2. Verify signature using the SECRET key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Find the user in the DB to ensure they still exist/aren't banned
    const user = await User.findById(decoded.userId).select('-password');
    
    // 4. Attach user to request object for the controller to use
    req.user = user;
    
    // 5. Proceed to the next function (the controller)
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
```

---

## 4. Google Login Interaction

1.  **Client (`AuthContext`)**: Uses Firebase SDK (`signInWithPopup`) to login user with Google -> Gets a Firebase Token.
2.  **Client**: Sends this Firebase Token (and email/uid) to Backend (`/api/auth/google`).
3.  **Backend (`googleLogin` in controller)**:
    -   Receives email/UID.
    -   Checks if user exists in DB.
    -   If no, creates a new user.
    -   **Crucial Step**: Generates a *system* JWT (our own token) and sends it back.
4.  **Client**: Receives the *system* JWT and treats it exactly like a normal login token (sets to localStorage).

---

## 5. Summary of Key Variables

| Variable | Location | Purpose |
| :--- | :--- | :--- |
| `token` (localStorage) | Browser Storage | Persists login across page reloads. |
| `Authorization` | HTTP Header | Transport mechanism to send token to server. |
| `process.env.JWT_SECRET` | `.env` (Server) | Secret key used to sign and verify tokens. **Must match!** |
| `req.user` | Server Request | Populated by `auth` middleware; contains current user info. |
