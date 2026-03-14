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
The API relies on **HTTP-only Cookies** to manage user sessions via JSON Web Tokens (JWT). This means the token is automatically stored and handled by the browser/client when responses are received.

To ensure cookies are passed correctly in React Native:
- If using **Axios**, you must configure it globally or per-request to include credentials:
  ```javascript
  import axios from 'axios';
  axios.defaults.withCredentials = true; // This is mandatory!
  ```
- If using **Fetch API**, carefully include the `credentials: 'include'` option in every request:
  ```javascript
  fetch('http://10.0.2.2:5000/api/v1/auth/profile', {
    credentials: 'include' // This is mandatory!
  })
  ```

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
    "email": "developer@example.com"
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
Because these are OAuth 2.0 flows, they cannot be handled solely via JSON API requests. They require opening a web browser (e.g., using `expo-web-browser` or `react-native-inappbrowser-reborn`) to allow the user to authenticate on the provider's official website.

### Concept for React Native:
1. Ensure the user is already logged in (via email/password). The backend relies on the HTTP-only cookie to link the incoming OAuth tokens to the correct user.
2. Open an in-app browser pointing to the integration initialization URLs.
3. The backend handles the callback and redirect back to your app using deep linking (e.g., `devbrandai://dashboard`).

### Connect GitHub
- **Endpoint**: `GET /auth/github`
- **Description**: Point your in-app browser to this URL. It redirects the user to the GitHub authorization page. Once the user approves, GitHub redirects them back to our backend `/api/v1/auth/github/callback`, which in turn will redirect back to the Frontend (set up via Env vars currently).

### Connect LinkedIn
- **Endpoint**: `GET /auth/linkedin`
- **Description**: Point your in-app browser to this URL. It redirects the user to the LinkedIn authorization page. Similar redirect flow applies upon completion.

### Handling Callbacks in Mobile
Right now, the callback URLs on the backend (`/api/v1/auth/github/callback`) redirect to a web address (e.g., `http://localhost:3000/connect-linkedin`). 
**For React Native, we will likely need to update the Environment Variables to point entirely to your App's deep link scheme:**
```
FRONTEND_URL="yourappscheme://"
```
So that once GitHub finishes linking, the user is seamlessly dropped back into your app flow.
