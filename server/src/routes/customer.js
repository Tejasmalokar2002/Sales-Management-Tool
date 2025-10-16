const express = require('express');
const { body, validationResult } = require('express-validator');
const Customer = require('../models/Customer');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// list
router.get('/', authenticate, async (req, res) => {
  const customers = await Customer.find().sort('-createdAt');
  res.json(customers);
});

// create (Admin + Supervisor)
// In the create route, add createdBy:
router.post('/', authenticate, authorize(['admin','supervisor']),
  [ body('name').notEmpty(), body('phone').notEmpty() ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    try {
      const customerData = {
        ...req.body,
        createdBy: req.user._id
      };
      const c = new Customer(customerData);
      await c.save();
      res.status(201).json(c);
    } catch (err) {
      if (err.code === 11000) return res.status(400).json({ message: 'Phone must be unique' });
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// update (Admin & Supervisor)
router.put('/:id', authenticate, authorize(['admin','supervisor']), async (req, res) => {
  try {
    const c = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!c) return res.status(404).json({ message: 'Not found' });
    res.json(c);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// delete (Admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
