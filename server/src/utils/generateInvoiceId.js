const Invoice = require('../models/Invoice');

async function generateInvoiceId() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const dateStr = `${y}${m}${d}`;

  // count invoices for today
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  const count = await Invoice.countDocuments({ createdAt: { $gte: start, $lt: end } });

  const seq = String(count + 1).padStart(3, '0');
  return `INV-${dateStr}-${seq}`;
}

module.exports = generateInvoiceId;
