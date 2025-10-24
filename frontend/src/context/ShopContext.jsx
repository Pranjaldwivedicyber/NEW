import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Context for sharing shop data (products, cart, search, etc.).
// This version adds more robust token handling and persists
// guest cart items between page reloads.
export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "₹";
  const delivery_fee = 10;

  // Resolve backend URL from environment variables or default to Render
  const backendUrl = (
    import.meta.env.VITE_API_BASE ||
    import.meta.env.VITE_BACKEND_URL ||
    "https://tinymillion.onrender.com"
  ).replace(/\/$/, "");

  // Axios instance with default base URL and cookies enabled
  const api = axios.create({ baseURL: backendUrl, withCredentials: true });

  // Persist guest cart in localStorage under a dedicated key
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("guest_cart");
      return saved ? JSON.parse(saved) : {};
    } catch (err) {
      return {};
    }
  });
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  // Utility to determine if a product belongs to a jewellery category
  const isJewelleryCategory = (cat) => {
    if (!cat) return false;
    const c = String(cat).trim().toLowerCase();
    return c === "jewellery" || c === "jewelry" || c === "jewelery";
  };

  // Adds an item to the local cart and, if authenticated, to the backend cart
  const addToCart = async (itemId, size, categoryOptional) => {
    let category = categoryOptional;
    if (!category) {
      const found = products.find((p) => p._id === itemId);
      if (found) category = found.category;
    }
    const isJewellery = isJewelleryCategory(category);
    if (!isJewellery && !size) {
      toast.error("Select Product Size");
      return;
    }
    const sizeKey = isJewellery ? "nosize" : size;
    const cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId][sizeKey] = (cartData[itemId][sizeKey] || 0) + 1;
    } else {
      cartData[itemId] = { [sizeKey]: 1 };
    }
    setCartItems(cartData);

    // Send to server if logged in
    if (token) {
      try {
        await api.post(
          "/api/cart/add",
          { itemId, size: sizeKey },
          { headers: { token, Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.log(error);
        toast.error(error?.response?.data?.message || error.message);
      }
    }
  };

  // Update quantity of an item/size in the cart
  const updateQuantity = async (itemId, size, quantity) => {
    const cartData = structuredClone(cartItems);
    if (!cartData[itemId]) cartData[itemId] = {};
    cartData[itemId][size] = quantity;
    setCartItems(cartData);

    if (token) {
      try {
        await api.post(
          "/api/cart/update",
          { itemId, size, quantity },
          { headers: { token, Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.log(error);
        toast.error(error?.response?.data?.message || error.message);
      }
    }
  };

  // Compute total count of items in the cart (all sizes)
  const getCartCount = () => {
    let totalCount = 0;
    for (const pid in cartItems) {
      for (const sz in cartItems[pid]) {
        const qty = cartItems[pid][sz] || 0;
        if (qty > 0) totalCount += qty;
      }
    }
    return totalCount;
  };

  // Compute the total cart amount based on product prices
  const getCartAmount = () => {
    let totalAmount = 0;
    for (const pid in cartItems) {
      const itemInfo = products.find((p) => p._id === pid);
      for (const sz in cartItems[pid]) {
        const qty = cartItems[pid][sz] || 0;
        if (qty > 0) totalAmount += (itemInfo?.price || 0) * qty;
      }
    }
    return totalAmount;
  };

  // Fetch products from API
  const getProductsData = async () => {
    try {
      const { data } = await api.get("/api/product/list");
      if (data.success) {
        setProducts((data.products || []).reverse());
      } else {
        toast.error(data.message || "Failed to load products");
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  // Retrieve cart from backend for authenticated user
  const getUserCart = async (tok) => {
    if (!tok) return;
    try {
      const { data } = await api.post(
        "/api/cart/get",
        {},
        { headers: { token: tok, Authorization: `Bearer ${tok}` } }
      );
      if (data.success) {
        setCartItems(data.cartData || {});
      }
    } catch (error) {
      console.log(error);
      // If the token is invalid/expired, remove it and reset cart
      const status = error?.response?.status;
      if (status === 401) {
        localStorage.removeItem("token");
        setToken("");
        setCartItems({});
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(error?.response?.data?.message || error.message);
      }
    }
  };

  // Load products on mount
  useEffect(() => {
    getProductsData();
  }, []);

  // On component mount and whenever token changes, sync cart
  useEffect(() => {
    // On first render, hydrate token from localStorage
    if (!token && localStorage.getItem("token")) {
      const t = localStorage.getItem("token");
      setToken(t);
      // Also load cart from backend
      getUserCart(t);
    } else if (token) {
      // Save token to localStorage and fetch cart
      localStorage.setItem("token", token);
      getUserCart(token);
    }
  }, [token]);

  // Persist guest cart (when not logged in) to localStorage
  useEffect(() => {
    if (!token) {
      try {
        localStorage.setItem("guest_cart", JSON.stringify(cartItems));
      } catch (err) {
        console.error("Failed to persist guest cart", err);
      }
    }
  }, [cartItems, token]);

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    setCartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
    backendUrl,
    api,
    token,
    setToken,
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;