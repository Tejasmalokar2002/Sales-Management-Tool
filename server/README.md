# 💼 SalesPro - Complete Sales Management System

A **full-stack sales management application** built with **React.js (frontend)** and **Node.js/Express (backend)** using **MongoDB** as the database.

---

## 🚀 Features

### 🖥️ Frontend Features
- **Dashboard Analytics**: Interactive charts and performance metrics  
- **Customer Management**: Complete CRM functionality  
- **Product Catalog**: Manage products and categories  
- **Invoice Generation**: Create and manage sales invoices  
- **User Authentication**: Secure login with role-based access  
- **Responsive Design**: Optimized for desktop and mobile  

### ⚙️ Backend Features
- **RESTful API**: Full CRUD operations  
- **JWT Authentication**: Secure token-based login  
- **Role-based Authorization**: Admin and Supervisor roles  
- **MongoDB Integration**: Flexible NoSQL data model  
- **Data Validation**: Input sanitization and error handling  
- **Dashboard Analytics**: Aggregated sales reports  

---

## 📁 Project Structure

### 🧩 Frontend
src/
├── api/
│   └── axios.js              # API configuration and interceptors
├── components/
│   ├── Charts/
│   │   └── index.js          # Chart components (Bar, Line, Pie)
│   └── Layout.js             # Main layout with sidebar and header
├── context/
│   └── AuthContext.js        # Authentication context provider
├── pages/
│   ├── Dashboard.js          # Main dashboard
│   ├── Customers.js          # Manage customers
│   ├── Products.js           # Manage products
│   ├── ProductTypes.js       # Manage product categories
│   ├── Invoices.js           # Manage invoices
│   ├── Profile.js            # User settings
│   └── LoginPage.js          # Authentication page
└── AppRoutes.js              # Application routing

### 🧠 Backend
backend/
├── config/
│   └── db.js                 # MongoDB connection
├── middleware/
│   └── auth.js               # Authentication middleware
├── models/
│   ├── User.js
│   ├── Customer.js
│   ├── Product.js
│   ├── ProductType.js
│   └── Invoice.js
├── routes/
│   ├── auth.js
│   ├── customers.js
│   ├── products.js
│   ├── productType.js
│   ├── invoices.js
│   └── dashboard.js
├── utils/
│   └── generateInvoiceId.js
└── server.js

---

## 🛠️ Technologies Used

### 🎨 Frontend
- React 18
- React Router DOM
- Axios
- Chart.js + react-chartjs-2
- Tailwind CSS
- React Context API
- Heroicons (SVG)

### 🔧 Backend
- Node.js + Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- express-validator for validation
- CORS for cross-origin requests

---

## 🔧 Installation & Setup

### ✅ Prerequisites
- Node.js (v14 or higher)  
- npm or yarn  
- MongoDB Atlas account or local MongoDB installation  

---

### 🖥️ Backend Setup
cd backend
npm install

Create a .env file in the backend directory:

PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
BCRYPT_SALT_ROUNDS=10

Start backend server:
npm start
# or
npm run dev

Backend runs on: http://localhost:5000

---

### 💻 Frontend Setup
cd frontend
npm install(npm install react-router-dom, npm install chart.js, npm install react-chartjs-2, npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p,)
npm run dev


Access at: http://localhost:3000

---

## 📋 API Endpoints

### 🔐 Authentication
POST /api/auth/register  
POST /api/auth/login  
PUT /api/auth/profile  
GET /api/auth/user-stats  
GET /api/auth/active-users  

### 👥 Customers
GET /api/customers  
POST /api/customers  
PUT /api/customers/:id  
DELETE /api/customers/:id  

### 📦 Products
GET /api/products  
POST /api/products  
PUT /api/products/:id  
DELETE /api/products/:id  

### 🏷️ Product Types
GET /api/product-types  
POST /api/product-types  
PUT /api/product-types/:id  
DELETE /api/product-types/:id  

### 🧾 Invoices
GET /api/invoices  
POST /api/invoices  

### 📊 Dashboard
GET /api/dashboard/summary  

---

## 🔐 Authentication & Roles

### 👤 Roles
Admin: Full access  
Supervisor: Limited access

### 🛡️ Security
- JWT-based authentication  
- bcrypt password hashing  
- Role-based route protection  
- Input validation  

---

## 📊 Data Models
(User, Customer, Product, Invoice structures same as provided)

---

## 🎨 UI/UX
- Responsive design  
- Interactive charts  
- Modal forms  
- Search & filter  
- Toast notifications  

---

## 📈 Dashboard Analytics
- Monthly Sales (Bar)
- Revenue Trend (Line)
- Product Distribution (Pie)

---

## 🧪 Development Scripts
Backend: npm start / npm run dev  
Frontend: npm run dev/ npm run build / npm test

---



---

## 🆘 Troubleshooting
- Check MongoDB connection string  
- Verify CORS setup  
- Ensure JWT secret & expiry correct  
- Reinstall dependencies if build fails  

---

## 🌟 Author
SalesPro — Developed by Shreya Shende
