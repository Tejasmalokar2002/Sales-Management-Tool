require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const productTypeRoutes = require('./routes/productType');
const productRoutes = require('./routes/product');
const customerRoutes = require('./routes/customer');
const invoiceRoutes = require('./routes/invoice');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
app.use(cors());
app.use(express.json());

// connect DB
connectDB();

app.get('/', (req, res) => res.send('Sales Management Tool API'));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/product-types', productTypeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
