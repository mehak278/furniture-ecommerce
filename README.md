# FurniMart - Multi-Vendor Furniture E-Commerce Platform

A premium, modern MERN (MongoDB, Express.js, React.js, Node.js) stack multi-vendor furniture e-commerce application designed with rich aesthetics, smooth micro-animations, and verified vendor flows.

---

## 🚀 Features

### 1. Customer / User Side
- **Discovery**: Custom catalog browsing with dynamic filtering by Room type (Living Room, Bedroom, study etc.), Material, and Price range.
- **Product Details**: Image previews, variant swatches, weight/dimension diagrams, and reviews.
- **Delivery Eligibility**: On-page pin-code availability check with estimated delivery days and delivery charges.
- **Delivery Slots**: Checkout calendar picker with time slots (Morning, Afternoon, Evening) and optional Assembly service check.
- **Secure Checkout**: Multi-step wizard supporting saved addresses, promo coupons, and Stripe Credit/Debit card or Cash on Delivery.
- **Dashboard**: Track order history status, cancel pending orders, update avatar, and change password.

### 2. Vendor Side
- **Registration**: Register shops, descriptions, bank details, and business proof.
- **Moderation**: Products undergo admin reviews for verification checks before listing.
- **Order Management**: Vendors process order items separately (Processing -> Shipped -> Delivered) and track item statuses.
- **Earnings & Payout Ledger**: Dedicated earnings panels detailing deductions, commission rates, and direct payout requests.

### 3. Administrator Side
- **System Dashboard**: View overall sales, registered user/vendor statistics, and platform commission revenues.
- **Approvals Moderation**: Review pending shops and product approval queues.
- **Content management**: Banner slider configurations, custom discounts, and review approvals.

---

## 📂 Project Structure

```text
furniture-ecommerce/
├── client/                      # React Frontend (Vite)
│   ├── src/
│   │   ├── components/          # Reusable view components
│   │   ├── pages/               # Page layouts (public/auth/user)
│   │   ├── context/             # Auth and Cart states
│   │   ├── services/            # Axios API wrappers
│   │   └── styles/              # Global variables & typography CSS
├── server/                      # Node.js + Express Backend
│   ├── config/                  # MongoDB, Stripe, & Cloudinary configs
│   ├── models/                  # Mongoose Schemas (User, Product, Order, Payout, etc.)
│   ├── controllers/             # Action logics
│   └── routes/                  # API endpoints
└── package.json                 # Concurrently dev workspace launcher
```

---

## 🛠️ Installation & Getting Started

### 📋 Prerequisites
- **Node.js** (v16.0 or higher)
- **NPM**
- **MongoDB Compass / MongoDB Atlas Connection**

### 💻 Local Setup

1. **Clone/Open Workspace**:
   Open terminal inside `C:/Users/mehak/projects/furniture-ecommerce/`

2. **Initialize Workspace & Packages**:
   Install root, server, and client dependencies:
   ```bash
   npm install
   npm run install-all
   ```

3. **Configure Environment Variables**:
   Setup backend `.env` variables at `server/.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://mehak864:%40Apple864@cluster0.vzxs8g1.mongodb.net/furnitureDB?retryWrites=true&w=majority
   JWT_SECRET=furnimart_jwt_super_secret_key_2024
   JWT_REFRESH_SECRET=furnimart_refresh_secret_key_2024
   JWT_EXPIRE=7d
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   STRIPE_SECRET_KEY=sk_test_your_stripe_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   CLIENT_URL=http://localhost:3000
   DEFAULT_COMMISSION=10
   ```

   Setup frontend `.env` variables at `client/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   VITE_CLOUDINARY_URL=your_cloudinary_upload_url
   ```

4. **Launch Developer Workspace**:
   Run both backend API Server and frontend Dev client concurrently in one single command:
   ```bash
   npm run dev
   ```
   - Frontend runs on: `http://localhost:3000` (or the fallback local host)
   - Backend API runs on: `http://localhost:5000`

---

## 🔒 Security Practices Built-in
- **JWT Refresh Tokens**: Access tokens expire in 15 minutes, refresh tokens persist for 7 days inside httpOnly cookies.
- **Express Rate Limiter**: 100 requests limit per 15 mins to mitigate bruteforce attempts.
- **Mongoose Sanitization**: Parameterized models protect against MongoDB injections.
- **Helmet Headers**: Secured HTTP headers enabled.
