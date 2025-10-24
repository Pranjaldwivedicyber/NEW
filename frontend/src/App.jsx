import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Collection from "./pages/Collection";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import PlaceOrder from "./pages/PlaceOrder";
import Orders from "./pages/Orders";
import Verify from "./pages/Verify";
import MiniStore from "./pages/MiniStore"; // ✅ NEW

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SearchBar from "./components/SearchBar";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FeaturedMiniStores from "./components/FeaturedMiniStores";

const App = () => {
  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]">
      <ToastContainer />
      <Navbar />
      <SearchBar />

      <Routes>
        {/* ---- Static routes first ---- */}
        <Route path="/" element={<Home />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/product/:productId" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/place-order" element={<PlaceOrder />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/verify" element={<Verify />} />

        {/* ---- Mini-store dynamic route (KEEP NEAR THE END) ---- */}
        {/* Example: /gopalji, /khushi */}
        <Route path="/:slug" element={<MiniStore />} />


        {/* (Optional) 404
        <Route path="*" element={<div className="py-10">Page not found</div>} />
        */}
      </Routes>

      <Footer />
    </div>
  );
};

export default App;