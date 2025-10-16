const express = require('express');
const { body, validationResult } = require('express-validator');
const ProductType = require('../models/productType');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// public list
router.get('/', authenticate, async (req, res) => {
  const types = await ProductType.find().sort('name');
  res.json(types);
});

// create (Admin)
router.post('/', authenticate, authorize('admin'),
  [ body('name').notEmpty() ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    try {
      const pt = new ProductType({ name: req.body.name, description: req.body.description });
      await pt.save();
      res.status(201).json(pt);
    } catch (err) {
      if (err.code === 11000) return res.status(400).json({ message: 'Product Type already exists' });
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// update (Admin)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const pt = await ProductType.findByIdAndUpdate(req.params.id, { name: req.body.name, description: req.body.description }, { new: true });
    if (!pt) return res.status(404).json({ message: 'Not found' });
    res.json(pt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// delete (Admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await ProductType.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
