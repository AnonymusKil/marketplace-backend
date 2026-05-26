<div align="center">
  <h1>🚀 GoCart Backend API</h1>
  <p>
    A scalable multi-vendor e-commerce backend built with Node.js, GraphQL, Express, and MongoDB.
  </p>

  <p>
    <img src="https://img.shields.io/badge/Node.js-Backend-green?style=for-the-badge" />
    <img src="https://img.shields.io/badge/GraphQL-API-E10098?style=for-the-badge" />
    <img src="https://img.shields.io/badge/Express.js-Server-black?style=for-the-badge" />
    <img src="https://img.shields.io/badge/MongoDB-Database-4EA94B?style=for-the-badge" />
  </p>
</div>

---

## 📖 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [⚙️ Architecture](#️-architecture)
- [🚀 Getting Started](#-getting-started)
- [🔐 Environment Variables](#-environment-variables)
- [🔑 Authentication](#-authentication)
- [📦 GraphQL API Overview](#-graphql-api-overview)
- [☁️ Media Uploads](#️-media-uploads)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)

---

## ✨ Features

- 🛍️ **Multi-Vendor System:** Support for separate vendor accounts and product isolation.
- 👤 **JWT Authentication:** Secure user registration, login, and session management.
- 📊 **Role-Based Access Control:** Distinct permissions for Customers, Vendors, and Admins.
- 📦 **Product Management:** Full CRUD capabilities for products, categories, and inventory.
- 🖼️ **Cloudinary Image Uploads:** Seamless media pipeline for product images.
- 🧾 **Order System:** Track cart checkouts, order statuses, and transaction history.
- ⚡ **GraphQL API:** Single endpoint data fetching optimized to prevent over/under-fetching.
- 🔒 **Secure Backend:** Protected routes, request validation, and password hashing via `bcrypt`.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js (TypeScript)
- **Framework:** Express.js
- **API Layer:** GraphQL
- **Database:** MongoDB & Mongoose ODM
- **Security:** JSON Web Tokens (JWT) & bcrypt
- **File Handling:** Multer & Cloudinary SDK

---

## ⚙️ Architecture

txt
src/
 ├── graphql/
 │    ├── resolvers/
 │    └── schema/
 ├── models/
 ├── controllers/
 ├── middleware/
 ├── helpers/
 ├── config/
 ├── types/
 ├── uploads/
 ├── email/
 └── app.ts
🚀 Getting Started
Prerequisites
Make sure you have Node.js and MongoDB installed on your local machine.

Installation
Clone the repository:

Bash
git clone [https://github.com/AnonymusKil/marketplace-backend](https://github.com/AnonymusKil/marketplace-backend)
cd marketplace-backend
Install dependencies:

Bash
npm install
Run the development server:

Bash
npm run dev
Network Endpoints
Base Server URL: http://localhost:4000

GraphQL Endpoint: http://localhost:4000/graphql

🚀 Environment Variables
Create a .env file in the root directory of your project and add the following keys:

Code snippet
PORT=4000
MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
🔐 Authentication
This API utilizes JSON Web Tokens (JWT) to secure endpoints and manage sessions.

Flow:
User registers or logs into their account.

The server authenticates credentials and returns a signed JWT token.

The client stores the token and attaches it to the header of subsequent HTTP requests.

Example Header:
JSON
{
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
📦 GraphQL API Overview
Example Queries & Mutations
Login User Mutation
GraphQL
mutation {
  login(email: "user@example.com", password: "yoursecurepassword") {
    token
    user {
      id
      role
    }
  }
}
☁️ Media Uploads
Product media and asset pipelines are fully automated using a multi-stage approach.

Tech Stack Used:
Multer: Handles multipart/form-data processing on incoming server requests.

Cloudinary: Stores optimized images in cloud asset Buckets.

Asset Pipeline Flow:
Frontend Request ──> Backend Server (Multer) ──> Cloudinary Storage ──> URL saved in MongoDB


🤝 Contributing
We welcome and appreciate community contributions!

Fork the repository.

Create a new branch for your feature or bug fix (git checkout -b feature/amazing-feature).

Commit your changes (git commit -m 'Add some amazing feature').

Push to the branch (git push origin feature/amazing-feature).

Open a Pull Request.

