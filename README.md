# DevBrand AI - Backend API Documentation

Welcome to the DevBrand AI Backend repository. This documentation is tailored for the Frontend Team (React Native) to understand how to consume the currently implemented authentication endpoints.

## Base URL
Assuming the backend is running locally on port 5000 (standard for local dev):
**`http://YOUR_LOCAL_IP:5000/api/v1`**

> **Note for React Native Emulators:**
> If you are using an Android emulator, `localhost` points to the emulator itself. You should use `10.0.2.2` instead of `localhost` or your machine's actual IP address on the network (e.g., `192.168.1.x`).
> For iOS simulators, `localhost` usually works fine, but using your machine's IP address is safer.

---

## Important: Authentication Mechanism
The API primarily uses **JSON Web Tokens (JWT)** for session management. When you register or log in, you will receive a `token` in the response body.

For **Mobile (React Native)**:
1. Store this token securely (e.g., using `expo-secure-store` or `AsyncStorage`).
2. Include it in the `Authorization` header of subsequent requests:
   ```javascript
   headers: {
     'Authorization': `Bearer ${token}`
   }
   ```

The API also supports **HTTP-only Cookies** for web-based flows, but for mobile development, the Bearer token in the header is the preferred method.

---

## 1. Local Authentication (Email & Password)
This is the first step of the onboarding flow.

### Register a User
- **Endpoint**: `POST /auth/register`
- **Description**: Creates a new user with an email and password. Automatically logs the user in and attaches an HTTP-only cookie.
- **Request Body**:
  ```json
  {
    "email": "developer@example.com",
    "password": "strongPassword123"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "_id": "60d0fe4f5311236168a109ca",
    "email": "developer@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR..."
  }
  ```

### Login a User
- **Endpoint**: `POST /auth/login`
- **Description**: Authenticates a user and sets an HTTP-only cookie in the response.
- **Request Body**:
  ```json
  {
    "email": "developer@example.com",
    "password": "strongPassword123"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "_id": "60d0fe4f5311236168a109ca",
    "email": "developer@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR...",
    "githubConnected": false,
    "linkedinConnected": false
  }
  ```

### Logout a User
- **Endpoint**: `POST /auth/logout`
- **Description**: Clears the authentication HTTP-only cookie from the client.
- **Request Body**: None
- **Success Response (200 OK)**:
  ```json
  {
    "message": "User logged out"
  }
  ```

### Get User Profile (Protected Route)
- **Endpoint**: `GET /auth/profile`
- **Description**: Fetches the currently authenticated user's profile details. This route is useful to verify if the user is logged in, and to see if they completed the OAuth steps.
- **Success Response (200 OK)**:
  ```json
  {
    "_id": "60d0fe4f5311236168a109ca",
    "email": "developer@example.com",
    "githubConnected": true,
    "linkedinConnected": false
  }
  ```
- **Failure Response (401 Unauthorized)**: Happens if the cookie is expired, missing, or invalid.
  ```json
  {
    "message": "Not authorized, no token"
  }
  ```

---

## 2. OAuth Integrations (GitHub & LinkedIn)
There are two ways to handle OAuth: the **Web Flow** (Browser-based) and the **Mobile Flow** (Code Exchange).

### A. Mobile Flow (Recommended for React Native)
This flow uses `expo-auth-session` or similar to get an authorization code on the device, which is then "exchanged" for a token on our backend.

#### Connect GitHub (Mobile)
- **Endpoint**: `POST /auth/github`
- **Request Body**:
  ```json
  {
    "code": "AUTH_CODE_FROM_EXPO",
    "redirect_uri": "YOUR_EXPO_REDIRECT_URI"
  }
  ```
- **Success Response**: Returns user data and a fresh session `token`.

#### Connect LinkedIn (Mobile)
- **Endpoint**: `POST /auth/linkedin`
- **Request Body**:
  ```json
  {
    "code": "AUTH_CODE_FROM_EXPO",
    "redirect_uri": "YOUR_EXPO_REDIRECT_URI"
  }
  ```
- **Success Response**: Returns user data and a fresh session `token`.

---

### B. Web Flow (Legacy/Browser-based)
These routes are used if you want to open an in-app browser and let the backend handle the entire redirect cycle.

- **Connect GitHub**: `GET /auth/github?token=YOUR_JWT_TOKEN`
- **Connect LinkedIn**: `GET /auth/linkedin?token=YOUR_JWT_TOKEN`

The backend will handle the callback and redirect the user back to the `FRONTEND_URL` specified in the server environment variables.
