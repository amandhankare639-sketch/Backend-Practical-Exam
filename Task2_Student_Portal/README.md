# Student Portal with Login and Protected Routes (Task 2)

A production-ready, secure REST API for a College Student Portal built with Node.js, Express.js, and MongoDB. Features JWT authentication, role-based access control (RBAC), password hashing with bcryptjs, input validation with Joi, security hardening (Helmet, CORS, Rate Limiting), and centralized error handling.

---

## 1. Project Overview

This project implements Task 2 of the Backend Practical Exam. It provides secure user registration, authentication, and role-protected resources:
- **Authentication**: Stateless JSON Web Token (JWT) with exact 1-hour expiration.
- **Authorization**: Role-Based Access Control (RBAC) distinguishing `student` and `admin` roles.
- **Data Protection**: Passwords salted and hashed with `bcryptjs` (never exposed in API responses).
- **Validation**: Strict schema validation on input fields using `Joi`.
- **Security**: Hardened using `helmet` (secure HTTP headers), `cors` (cross-origin protection), and `express-rate-limit` (100 requests per 15-minute window).
- **Exam Demo (`A2.js`)**: Single-file self-contained demonstration for practical examination and viva.

---

## 2. Technologies Used

- **Node.js** (Runtime environment)
- **Express.js** (Web framework)
- **MongoDB** (NoSQL Database, database name: `student_portal`)
- **Mongoose** (ODM for schema modeling and validation)
- **bcryptjs** (Password hashing & verification)
- **jsonwebtoken** (JWT token issuance & verification)
- **Joi** (Request body schema validation)
- **dotenv** (Environment variable management)
- **helmet** (Security headers)
- **cors** (Cross-origin resource sharing)
- **express-rate-limit** (API rate limiting)

---

## 3. Project Structure

```text
Task2_Student_Portal/
│
├── models/
│   └── User.js               # Mongoose User schema & password exclusion hook
│
├── routes/
│   └── authRoutes.js         # Authentication & protected endpoints
│
├── middleware/
│   ├── authMiddleware.js     # JWT Bearer token authentication
│   ├── adminMiddleware.js    # Role-based admin authorization check
│   ├── logger.js             # HTTP request method & URL logger
│   └── errorHandler.js       # Centralized error handler (no stack traces)
│
├── outputs/                  # Actual test run screenshot evidence
│
├── .env                      # Local environment configuration (ignored by git)
├── .env.example              # Sample environment template
├── .gitignore                # Excludes node_modules and .env
├── package.json              # Project dependencies & scripts
├── server.js                 # Primary modular application entry point
├── A2.js                     # Single-file self-contained exam version
└── README.md                 # Complete documentation & testing guide
```

---

## 4. Environment Setup & MongoDB Configuration

Create a `.env` file in the root of `Task2_Student_Portal` (or copy from `.env.example`):

```bash
cp .env.example .env
```

### Environment Variables (`.env`):
```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/student_portal
JWT_SECRET=your_long_random_secret_super_secure_key_for_jwt_2026
```

> **Database Note**: The system connects to a dedicated database named **`student_portal`**.
> Passwords and `JWT_SECRET` are strictly kept in `.env` and never hardcoded.

---

## 5. Installation & Server Startup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Application

**Option A: Modular Architecture (Primary Project)**
```bash
npm start
# or: node server.js
```

**Option B: Single-File Demonstration (`A2.js`)**
```bash
node A2.js
```

### Expected Startup Output:
```text
Successfully connected to MongoDB (student_portal)
Server is running on port 3000
```
> The server listens on port 3000 **only after** verifying a successful connection to MongoDB.

---

## 6. API Endpoints Summary

| Method | Endpoint | Access Level | Description | Status Codes |
|---|---|---|---|---|
| `POST` | `/register` | Public | Register a student or admin | `201`, `400`, `409` |
| `POST` | `/login` | Public | Authenticate user & get 1-hour JWT | `200`, `400`, `401` |
| `GET` | `/profile` | Authenticated Users | View authenticated user profile | `200`, `401`, `404` |
| `GET` | `/students` | Admin Only | View list of registered students | `200`, `401`, `403` |

---

## 7. JWT Authorization Instructions

For protected endpoints (`/profile` and `/students`):
1. Send an HTTP request with the header:
   ```text
   Authorization: Bearer <YOUR_JWT_TOKEN>
   ```
2. In Postman:
   - Select the **Authorization** tab.
   - Choose **Type: Bearer Token**.
   - Paste the token received from the `/login` response.
3. The JWT payload contains `{ id, role }` and expires in **1 hour**.

---

## 8. Postman / Thunder Client Testing Guide

### 1. Register a Student (201 Created)
- **POST** `http://localhost:3000/register`
- **Body (JSON)**:
```json
{
  "name": "Aman",
  "email": "aman@example.com",
  "password": "password123",
  "role": "student"
}
```
- **Response**: `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "673f4001a1b2c3d4e5f60001",
    "name": "Aman",
    "email": "aman@example.com",
    "role": "student"
  }
}
```

---

### 2. Register an Admin (201 Created)
- **POST** `http://localhost:3000/register`
- **Body (JSON)**:
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "adminpassword123",
  "role": "admin"
}
```
- **Response**: `201 Created`

---

### 3. Login as Student (200 OK)
- **POST** `http://localhost:3000/login`
- **Body (JSON)**:
```json
{
  "email": "aman@example.com",
  "password": "password123"
}
```
- **Response**: `200 OK` (includes 1-hour JWT token)

---

### 4. Login as Admin (200 OK)
- **POST** `http://localhost:3000/login`
- **Body (JSON)**:
```json
{
  "email": "admin@example.com",
  "password": "adminpassword123"
}
```
- **Response**: `200 OK` (includes admin JWT token)

---

### 5. Access Profile Without Token (401 Unauthorized)
- **GET** `http://localhost:3000/profile`
- **Headers**: *(No Authorization header)*
- **Response**: `401 Unauthorized`
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

---

### 6. Access Profile With Student Token (200 OK)
- **GET** `http://localhost:3000/profile`
- **Headers**: `Authorization: Bearer <STUDENT_TOKEN>`
- **Response**: `200 OK`
```json
{
  "success": true,
  "user": {
    "id": "673f4001a1b2c3d4e5f60001",
    "name": "Aman",
    "email": "aman@example.com",
    "role": "student"
  }
}
```

---

### 7. Access Students List with Admin Token (200 OK)
- **GET** `http://localhost:3000/students`
- **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
- **Response**: `200 OK`
```json
{
  "success": true,
  "count": 1,
  "students": [
    {
      "id": "673f4001a1b2c3d4e5f60001",
      "name": "Aman",
      "email": "aman@example.com",
      "role": "student"
    }
  ]
}
```

---

### 8. Access Students List with Student Token (403 Forbidden)
- **GET** `http://localhost:3000/students`
- **Headers**: `Authorization: Bearer <STUDENT_TOKEN>`
- **Response**: `403 Forbidden`
```json
{
  "success": false,
  "message": "Access forbidden. Admin role required."
}
```

---

### 9. Login With Incorrect Password (401 Unauthorized)
- **POST** `http://localhost:3000/login`
- **Body (JSON)**:
```json
{
  "email": "aman@example.com",
  "password": "wrongpassword"
}
```
- **Response**: `401 Unauthorized`
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### 10. Register Duplicate Email (409 Conflict)
- **POST** `http://localhost:3000/register`
- **Body (JSON)**:
```json
{
  "name": "Aman Duplicate",
  "email": "aman@example.com",
  "password": "password123",
  "role": "student"
}
```
- **Response**: `409 Conflict`
```json
{
  "success": false,
  "message": "Email already registered"
}
```

---

### 11. Register Invalid Email or Short Password (400 Bad Request)
- **POST** `http://localhost:3000/register`
- **Body (JSON)**:
```json
{
  "name": "Invalid User",
  "email": "not-an-email",
  "password": "123"
}
```
- **Response**: `400 Bad Request`
```json
{
  "success": false,
  "message": "Invalid email format"
}
```
*(or `"Password must be at least 6 characters long"`)*
