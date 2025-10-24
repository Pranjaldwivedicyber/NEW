import React, { useState } from "react";
import { backendUrl } from "../App";
import api from "../lib/api";

function loadScript(src) {
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function Checkout() {
  const [loading, setLoading] = useState(false);

  const createOrder = async () => {
    // Must return: { success, orderId, amount, currency, key, name, prefill, notes }
    const { data } = await api.post(`/api/order/create`, { notes: "web_checkout" });
    if (!data?.success) throw new Error(data?.message || "Create order failed");
    return data;
  };

  const verifyPayment = async (payload) => {
    const { data } = await api.post(`/api/order/verify`, payload);
    if (!data?.success) throw new Error(data?.message || "Verification failed");
    return data;
  };

  const payNow = async () => {
    setLoading(true);
    try {
      const ok = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!ok) throw new Error("Razorpay SDK failed to load");

      const order = await createOrder();
      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: order.name || "TinyMillion",
        description: "Order Payment",
        order_id: order.orderId,
        prefill: order.prefill || {},
        notes: order.notes || {},
        handler: async function (resp) {
          try {
            await verifyPayment(resp);
            alert("Payment successful!");
          } catch (e) {
            alert(e.message || "Payment verification failed");
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      alert(e.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Checkout</h2>
      <p>Review your order and pay securely.</p>
      <button disabled={loading} onClick={payNow}>
        {loading ? "Please wait…" : "Pay Now"}
      </button>
    </div>
  );
}
