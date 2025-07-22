# node-backend

### This is a simple Node.js + Express backend that serves dummy data 


## Getting Started

### 1. Install dependencies

```bash
npm install

Auth
POST /api/login – Login with username and password

Products
GET /api/products – List all products (with optional filters/pagination)

POST /api/products – Add product (admin only)

PUT /api/products/:id – Update product (admin only)

DELETE /api/products/:id – Delete product (admin only)
