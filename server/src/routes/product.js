const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const ProductType = require('../models/productType');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// list (allow filtering by type via query ?type=typeId)
router.get('/', authenticate, async (req, res) => {
  const filter = {};
  if (req.query.type) filter.type = req.query.type;
  const products = await Product.find(filter).populate('type');
  res.json(products);
});

// get one
router.get('/:id', authenticate, async (req, res) => {
  const p = await Product.findById(req.params.id).populate('type');
  if (!p) return res.status(404).json({ message: 'Not found' });
  res.json(p);
});

// create (Admin)
// In the create route, add createdBy:
router.post('/', authenticate, authorize('admin'),
  [
    body('name').notEmpty(),
    body('price').isNumeric(),
    body('unit').notEmpty(),
    body('type').notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    try {
      const existsType = await ProductType.findById(req.body.type);
      if (!existsType) return res.status(400).json({ message: 'Invalid product type' });
      
      const productData = {
        ...req.body,
        createdBy: req.user._id
      };
      const prod = new Product(productData);
      await prod.save();
      res.status(201).json(prod);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// update (Admin)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const prod = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!prod) return res.status(404).json({ message: 'Not found' });
    res.json(prod);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// delete (Admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
