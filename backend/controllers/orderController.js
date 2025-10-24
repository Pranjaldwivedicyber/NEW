import Razorpay from "razorpay";
import crypto from "crypto";
import Stripe from "stripe";
import orderModel from "../models/orderModel.js"; // apna order schema lagana

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const rz = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Place Order - COD / simple case
 */
export const placeOrder = async (req, res) => {
  try {
    const { cartItems, totalAmount, address, paymentMethod } = req.body;

    const newOrder = new orderModel({
      user: req.user.id,
      cartItems,
      totalAmount,
      address,
      paymentMethod,
      status: "Pending",
    });

    await newOrder.save();
    return res.json({ success: true, order: newOrder });
  } catch (err) {
    console.error("placeOrder error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Stripe Order
 */
export const placeOrderStripe = async (req, res) => {
  try {
    const { cartItems, totalAmount, address } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: cartItems.map((item) => ({
        price_data: {
          currency: "inr",
          product_data: { name: item.name },
          unit_amount: item.price * 100, // paise
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${process.env.BASE_URL}/order-success`,
      cancel_url: `${process.env.BASE_URL}/cart`,
      metadata: { userId: req.user.id },
    });

    const newOrder = new orderModel({
      user: req.user.id,
      cartItems,
      totalAmount,
      address,
      paymentMethod: "Stripe",
      status: "Initiated",
      stripeSessionId: session.id,
    });

    await newOrder.save();

    return res.json({ success: true, url: session.url });
  } catch (err) {
    console.error("placeOrderStripe error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Razorpay Order
 */
export const placeOrderRazorpay = async (req, res) => {
  try {
    const { cartItems, totalAmount, address } = req.body;

    const order = await rz.orders.create({
      amount: totalAmount * 100, // paise
      currency: "INR",
      receipt: "rcpt_" + Date.now(),
    });

    const newOrder = new orderModel({
      user: req.user.id,
      cartItems,
      totalAmount,
      address,
      paymentMethod: "Razorpay",
      status: "Initiated",
      razorpayOrderId: order.id,
    });

    await newOrder.save();

    return res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("placeOrderRazorpay error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Verify Stripe
 */
export const verifyStripe = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      await orderModel.findOneAndUpdate(
        { stripeSessionId: sessionId },
        { status: "Paid" }
      );
      return res.json({ success: true, message: "Payment verified" });
    }

    return res.status(400).json({ success: false, message: "Payment not completed" });
  } catch (err) {
    console.error("verifyStripe error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Verify Razorpay
 */
export const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const hmac = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (hmac !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    await orderModel.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { status: "Paid" }
    );

    return res.json({ success: true, message: "Payment verified" });
  } catch (err) {
    console.error("verifyRazorpay error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Admin - All Orders
 */
export const allOrders = async (_req, res) => {
  try {
    const orders = await orderModel.find().populate("user", "email");
    return res.json({ success: true, orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * User Orders
 */
export const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ user: req.user.id });
    return res.json({ success: true, orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Update Status (Admin)
 */
export const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { status });
    return res.json({ success: true, message: "Order status updated" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
