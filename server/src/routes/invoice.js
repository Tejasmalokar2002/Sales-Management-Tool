  const express = require('express');
  const { body, validationResult } = require('express-validator');
  const Invoice = require('../models/Invoice');
  const Product = require('../models/Product');
  const Customer = require('../models/Customer');
  const generateInvoiceId = require('../utils/generateInvoiceId');
  const { authenticate, authorize } = require('../middleware/auth');

  const router = express.Router();

  // create invoice (Admin + Supervisor)
  router.post('/', authenticate, authorize(['admin','supervisor']),
    [
      body('customer').notEmpty(),
      body('items').isArray({ min: 1 })
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

      const { customer, items, discount } = req.body;
      try {
        const customerDoc = await Customer.findById(customer);
        if (!customerDoc) return res.status(400).json({ message: 'Invalid customer' });

        // build items with product details
        let subtotal = 0;
        const builtItems = [];
        // In your invoice route - add stock validation
for (const it of items) {
  const prod = await Product.findById(it.product);
  if (!prod) return res.status(400).json({ message: `Invalid product ${it.product}` });

  // Check stock availability
  if (prod.stock !== undefined && prod.stock < it.quantity) {
    return res.status(400).json({ 
      message: `Insufficient stock for ${prod.name}. Available: ${prod.stock}, Requested: ${it.quantity}` 
    });
  }

  const qty = Number(it.quantity) || 1;
  const price = Number(it.price) || prod.price;
  const lineTotal = price * qty;
  subtotal += lineTotal;

  builtItems.push({
    product: prod._id,
    name: prod.name,
    price,
    quantity: qty,
    unit: prod.unit
  });
}

// After invoice creation, update product stocks
await Promise.all(builtItems.map(async (item) => {
  await Product.findByIdAndUpdate(
    item.product,
    { $inc: { stock: -item.quantity } }
  );
}));

        let discountAmount = 0;
        if (discount && discount.value) {
          if (discount.type === 'percentage') {
            discountAmount = (subtotal * (Number(discount.value) / 100));
          } else {
            discountAmount = Number(discount.value);
          }
        }

        const totalAmount = Math.max(0, subtotal - discountAmount);

        const invoiceId = await generateInvoiceId();

        const invoice = new Invoice({
          invoiceId,
          customer: customerDoc._id,
          items: builtItems,
          discount: discount || { type: 'fixed', value: 0 },
          subtotal,
          discountAmount,
          totalAmount,
          createdBy: req.user._id
        });

        await invoice.save();
        res.status(201).json(invoice);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
      }
    }
  );

  // basic list (Admin all, Supervisor only their own)
  router.get('/', authenticate, async (req, res) => {
    try {
      let filter = {};
      if (req.user.role === 'supervisor') {
        filter.createdBy = req.user._id;
      }
      const invoices = await Invoice.find(filter).populate('customer').populate('createdBy');
      res.json(invoices);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  module.exports = router;
