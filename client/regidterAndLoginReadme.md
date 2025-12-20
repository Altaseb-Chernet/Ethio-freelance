

# 🔐 FULL AUTH FLOW (Frontend ➜ Backend ➜ Frontend)

We’ll cover **two flows**:
1️⃣ **Register (with OTP)**
2️⃣ **Login (normal email/password)**

---

# 🟢 PART 1: REGISTER FLOW (NEW USER)

## 🧑 User action (Frontend)

User opens:

```
/register
```

📁 File:

```
client/src/pages/Register.jsx
```

---

## 1️⃣ User fills the form

Fields:

* firstName
* lastName
* email
* password
* role (freelancer / client)

State update happens here:

```js
const [formData, setFormData] = useState({...})
```

---

## 2️⃣ User clicks **Create account**

This function runs:

```js
const handleSubmit = async (e) => {
  const result = await register(formData)
}
```

---

## 3️⃣ `register()` comes from AuthContext

📁 File:

```
client/src/context/AuthContext.jsx
```

```js
const register = async (userData) => {
  return await api.post("/auth/register", userData)
}
```

---

## 4️⃣ Axios sends request

📁 File:

```
client/src/utils/api.js
```

Request:

```
POST /api/auth/register
Body: { email, password, role, firstName, lastName }
```

🧠 **Request Interceptor runs**

```js
api.interceptors.request.use(...)
```

➡️ No token yet → nothing added

---

## 5️⃣ Backend receives request

📁 Route:

```
POST /auth/register
```

📁 Controller:

```
server/src/controllers/authController.js
```

Function:

```js
register
```

---

## 6️⃣ Backend register logic

### ✔ Validate input

```js
registerValidation
```

### ✔ Check email exists

```js
User.findOne({ email })
```

### ✔ Generate OTP

```js
emailService.generateOTP()
```

### ✔ Store OTP temporarily

```js
otpStore[email] = { otp, otpExpires, userData }
```

### ✔ Send OTP email

```js
emailService.sendOTP(email, otp)
```

---

## 7️⃣ Backend response

```json
{
  "success": true,
  "message": "OTP sent to your email"
}
```

---

## 8️⃣ Frontend switches to OTP screen

📁 File:

```
client/src/components/OTPVerification.jsx
```

State change:

```js
setShowOTPVerification(true)
```

---

## 9️⃣ User enters OTP & submits

Frontend calls:

```js
verifyOTP(email, otp)
```

From:

```
AuthContext.jsx
```

---

## 🔁 OTP VERIFY FLOW

## 🔟 Axios sends OTP request

```
POST /api/auth/verify-otp
Body: { email, otp }
```

---

## 1️⃣1️⃣ Backend verifies OTP

📁 Controller:

```
verifyOTP
```

Steps:

* Check OTP exists
* Compare OTP
* Check expiry
* Create User in DB
* Generate JWT token
* Delete OTP record

---

## 1️⃣2️⃣ Backend response (SUCCESS)

```json
{
  "success": true,
  "data": {
    "token": "JWT_TOKEN",
    "user": { ... }
  }
}
```

---

## 1️⃣3️⃣ Frontend saves token

📁 File:

```
AuthContext.jsx
```

```js
localStorage.setItem("token", token)
setUser(user)
```

---

## 1️⃣4️⃣ User redirected

📁 File:

```
Register.jsx
```

```js
navigate('/dashboard')
```

---

# 🎉 REGISTER FLOW COMPLETE

User is now:

* Created
* Logged in
* Token stored

---

# 🔵 PART 2: LOGIN FLOW (EXISTING USER)

---

## 1️⃣ User opens Login page

```
/login
```

📁 File:

```
client/src/pages/Login.jsx
```

---

## 2️⃣ User submits email & password

Function runs:

```js
login(email, password)
```

---

## 3️⃣ login() in AuthContext

📁 File:

```
AuthContext.jsx
```

```js
api.post('/auth/login', { email, password })
```

---

## 4️⃣ Axios request interceptor

🧠 Still **no token yet**
➡️ Nothing added

---

## 5️⃣ Backend login controller

📁 File:

```
authController.js
```

Function:

```js
login
```

Steps:

* Find user
* Compare password
* Check isActive
* Generate token

---

## 6️⃣ Backend response

```json
{
  "success": true,
  "data": {
    "token": "JWT_TOKEN",
    "user": { ... }
  }
}
```

---

## 7️⃣ Frontend saves token

```js
localStorage.setItem("token", token)
setUser(user)
```

---

# 🔐 PART 3: ACCESS PROTECTED ROUTE

User visits:

```
/dashboard
```

Frontend calls:

```js
api.get('/auth/me')
```

---

## 1️⃣ Axios request interceptor

📁 File:

```
api.js
```

```js
Authorization: Bearer JWT_TOKEN
```

---

## 2️⃣ Backend auth middleware

📁 File:

```
server/src/middleware/auth.js
```

Steps:

* Read token
* Verify JWT
* Find user
* Attach `req.user`

---

## 3️⃣ Controller uses req.user

📁 File:

```
authController.js
```

```js
getMe
```

Returns user profile.

---

# 🔁 AUTO LOGIN ON REFRESH

When page reloads:

📁 File:

```
AuthContext.jsx
```

```js
useEffect(() => {
  if (token) fetchUser()
}, [])
```

➡️ Calls `/auth/me`
➡️ Restores user session

---

# 🧠 VISUAL FLOW (Simple)

```
Register.jsx
  ↓
AuthContext.register()
  ↓
api.post('/auth/register')
  ↓
authController.register
  ↓
OTP sent
  ↓
OTPVerification.jsx
  ↓
verifyOTP()
  ↓
authController.verifyOTP
  ↓
Token + User
  ↓
localStorage
  ↓
Dashboard
```

---

# ✅ ONE-LINE SUMMARY

> The frontend collects user data, sends it to the backend, the backend validates and authenticates the user, returns a JWT token, and every future request uses that token to prove identity.


