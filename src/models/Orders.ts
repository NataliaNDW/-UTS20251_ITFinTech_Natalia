import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  qty: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['PENDING', 'PAID', 'FAILED', 'CANCELLED', 'COMPLETED'],
    default: 'PENDING'
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual untuk mendapatkan data payment terkait
orderSchema.virtual('payment', {
  ref: 'Payment',
  localField: 'paymentId',
  foreignField: '_id',
  justOne: true
});

// Method untuk menghitung total
orderSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((total: number, item: any) => total + (item.price * item.qty), 0);
  this.tax = Math.round(this.subtotal * 0.1); // 10% tax
  this.total = this.subtotal + this.tax;
};

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;