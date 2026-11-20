# College Library Book Management API

A clean, exam-friendly RESTful API for a College Library Book Management System built with Node.js, Express.js, and MongoDB using Mongoose and dotenv.

---

## 1. Project Overview

This project provides a complete CRUD (Create, Read, Update, Delete) API to manage books in a college library. The implementation follows professional REST conventions, modular architecture, schema validation, centralized error handling, and request logging without unnecessary third-party dependencies.

### Key Highlights:
- **Modular Architecture**: Clean separation of concerns with `models/`, `routes/`, and `middleware/`.
- **Single-File Practical Demo (`A1.js`)**: All-in-one exam submission file for quick demonstration and viva explanation.
- **Robust Validation**: Enforces required fields, price minimum constraints, and valid MongoDB ObjectIDs.
- **Centralized Error Handling**: Standardized JSON error responses without leaking internal stack traces.
- **Environment Isolation**: Secure configuration management using `.env` and `.env.example`.

---

## 2. Technologies Used

- **Node.js** (JavaScript runtime environment)
- **Express.js** (Web application framework)
- **MongoDB** (NoSQL Document Database)
- **Mongoose** (Object Data Modeling / ODM for MongoDB)
- **dotenv** (Environment variable management)

---

## 3. Project Structure

```text
Task1_Library_API/
│
├── models/
│   └── Book.js               # Mongoose Book model & schema definition
│
├── routes/
│   └── bookRoutes.js         # REST API routes for CRUD operations
│
├── middleware/
│   ├── logger.js             # HTTP request method and URL logger
│   └── errorHandler.js       # Centralized error handler (no stack traces)
│
├── .env                      # Local environment configuration (git ignored)
├── .env.example              # Sample environment template for setup
├── .gitignore                # Git ignore rules (node_modules, .env)
├── package.json              # Project metadata, scripts, and dependencies
├── server.js                 # Primary application entry point (modular)
├── A1.js                     # Single-file self-contained exam version
└── README.md                 # Complete documentation and testing guide
```

---

## 4. Book Schema & Data Model

The Mongoose `Book` schema includes the following fields and validations:

| Field | Data Type | Validation Rules | Description |
|---|---|---|---|
| `title` | String | Required, trimmed | Title of the book |
| `author` | String | Required, trimmed | Author of the book |
| `price` | Number | Required, Minimum: 1 | Price in currency units |
| `category` | String | Optional, trimmed | Category/Genre (e.g., Computer Science, Fiction) |
| `isAvailable` | Boolean | Default: `true` | Availability status in library |

---

## 5. Setup & Installation

### Step 1: Navigate to Project Directory
```bash
cd Task1_Library_API
```

### Step 2: Install Dependencies
```bash
npm install
```
Installed packages:
- `express`
- `mongoose`
- `dotenv`

### Step 3: Configure Environment Variables
Create a `.env` file in the `Task1_Library_API` root folder (or copy from `.env.example`):
```bash
cp .env.example .env
```

Contents of `.env`:
```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/library_db
```

> **Note on MongoDB Configuration**:
> - If running MongoDB locally, make sure MongoDB Community Server service is started on port `27017`.
> - If using MongoDB Atlas, replace `MONGO_URI` with your connection string:
>   `MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/library_db?retryWrites=true&w=majority`
> - To inspect records visually, open **MongoDB Compass** and connect to the same URI.

---

## 6. How to Run the Server

### Starting the Modular Application (Primary Project):
```bash
npm start
```
*or directly:*
```bash
node server.js
```

### Starting the Single-File Demonstration (`A1.js`):
```bash
node A1.js
```

### Expected Startup Output in Terminal:
```text
Successfully connected to MongoDB
Server is running on port 3000
```
> The application will only start listening on port 3000 after confirming a successful connection to MongoDB. If MongoDB is not running, the application logs a connection error and exits safely.

---

## 7. API Endpoints Summary

| HTTP Method | Endpoint | Description | Success Code | Error Code(s) |
|---|---|---|---|---|
| `POST` | `/books` | Add a new book to the library | `201 Created` | `400 Bad Request` |
| `GET` | `/books` | Retrieve all books | `200 OK` | `500 Internal Error` |
| `GET` | `/books/:id` | Retrieve single book by MongoDB ID | `200 OK` | `400 Bad Request`, `404 Not Found` |
| `PUT` | `/books/:id` | Update an existing book by ID | `200 OK` | `400 Bad Request`, `404 Not Found` |
| `DELETE` | `/books/:id` | Delete a book by ID | `200 OK` | `400 Bad Request`, `404 Not Found` |

---

## 8. Detailed API Testing Instructions (Postman / Thunder Client)

Set header for all POST / PUT requests:
```text
Content-Type: application/json
```

---

### Test 1: Add a New Book
- **Method**: `POST`
- **URL**: `http://localhost:3000/books`
- **Request Body (JSON)**:
```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "price": 450,
  "category": "Computer Science",
  "isAvailable": true
}
```
- **Expected Status**: `201 Created`
- **Expected Response**:
```json
{
  "success": true,
  "message": "Book created successfully",
  "data": {
    "_id": "673f1a2b3c4d5e6f7a8b9c0d",
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "price": 450,
    "category": "Computer Science",
    "isAvailable": true,
    "__v": 0
  }
}
```
- **Terminal Logger Output**:
```text
POST /books
```

---

### Test 2: Retrieve All Books
- **Method**: `GET`
- **URL**: `http://localhost:3000/books`
- **Expected Status**: `200 OK`
- **Expected Response**:
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "673f1a2b3c4d5e6f7a8b9c0d",
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "price": 450,
      "category": "Computer Science",
      "isAvailable": true,
      "__v": 0
    }
  ]
}
```
- **Terminal Logger Output**:
```text
GET /books
```

---

### Test 3: Retrieve Single Book by ID
- **Method**: `GET`
- **URL**: `http://localhost:3000/books/673f1a2b3c4d5e6f7a8b9c0d` (Use actual `_id` from Test 1)
- **Expected Status**: `200 OK`
- **Expected Response**:
```json
{
  "success": true,
  "data": {
    "_id": "673f1a2b3c4d5e6f7a8b9c0d",
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "price": 450,
    "category": "Computer Science",
    "isAvailable": true,
    "__v": 0
  }
}
```
- **Terminal Logger Output**:
```text
GET /books/673f1a2b3c4d5e6f7a8b9c0d
```

---

### Test 4: Update a Book
- **Method**: `PUT`
- **URL**: `http://localhost:3000/books/673f1a2b3c4d5e6f7a8b9c0d`
- **Request Body (JSON)**:
```json
{
  "price": 520,
  "isAvailable": false
}
```
- **Expected Status**: `200 OK`
- **Expected Response**:
```json
{
  "success": true,
  "message": "Book updated successfully",
  "data": {
    "_id": "673f1a2b3c4d5e6f7a8b9c0d",
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "price": 520,
    "category": "Computer Science",
    "isAvailable": false,
    "__v": 0
  }
}
```
- **Terminal Logger Output**:
```text
PUT /books/673f1a2b3c4d5e6f7a8b9c0d
```

---

### Test 5: Delete a Book
- **Method**: `DELETE`
- **URL**: `http://localhost:3000/books/673f1a2b3c4d5e6f7a8b9c0d`
- **Expected Status**: `200 OK`
- **Expected Response**:
```json
{
  "success": true,
  "message": "Book deleted successfully",
  "data": {
    "_id": "673f1a2b3c4d5e6f7a8b9c0d",
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "price": 520,
    "category": "Computer Science",
    "isAvailable": false,
    "__v": 0
  }
}
```
- **Terminal Logger Output**:
```text
DELETE /books/673f1a2b3c4d5e6f7a8b9c0d
```

---

## 9. Error Cases & Validation Testing

### Case A: Missing Required Fields
- **Method**: `POST`
- **URL**: `http://localhost:3000/books`
- **Request Body (JSON)**:
```json
{
  "price": 250
}
```
- **Expected Status**: `400 Bad Request`
- **Expected Response**:
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    "Book title is required",
    "Author is required"
  ]
}
```

---

### Case B: Price Less Than 1
- **Method**: `POST` or `PUT`
- **URL**: `http://localhost:3000/books`
- **Request Body (JSON)**:
```json
{
  "title": "Operating Systems",
  "author": "Abraham Silberschatz",
  "price": 0
}
```
- **Expected Status**: `400 Bad Request`
- **Expected Response**:
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    "Price must be at least 1"
  ]
}
```

---

### Case C: Invalid MongoDB ID Format
- **Method**: `GET`, `PUT`, or `DELETE`
- **URL**: `http://localhost:3000/books/123invalidid`
- **Expected Status**: `400 Bad Request`
- **Expected Response**:
```json
{
  "success": false,
  "message": "Invalid MongoDB ID format"
}
```

---

### Case D: Book Not Found
- **Method**: `GET`, `PUT`, or `DELETE`
- **URL**: `http://localhost:3000/books/64b1f2e3d4c5b6a789012345` (Valid 24-character hex ID that does not exist)
- **Expected Status**: `404 Not Found`
- **Expected Response**:
```json
{
  "success": false,
  "message": "Book not found"
}
```

---

## 10. Viewing Data in MongoDB Compass

1. Launch **MongoDB Compass**.
2. Connect to: `mongodb://127.0.0.1:27017` (or your configured Atlas connection string).
3. In the left navigation pane, click on the database: **`library_db`**.
4. Click on the collection: **`books`** (or **`book_a1`** if testing `A1.js`).
5. You will see all documents created, updated, or deleted through the API.
