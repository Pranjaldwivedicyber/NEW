import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";   // 🔑 add this
import "dotenv/config";

import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";

// Routes
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";          
import orderRouter from "./routes/orderRoute.js";
import newsletterRoute from "./routes/newsletterRoute.js"; 
import seoRoutes from "./routes/seo.routes.js";            
import miniStoreRoutes from "./routes/miniStoreRoutes.js"; 

const app = express();
const port = process.env.PORT || 4000;

// DB + Cloudinary
connectDB();
connectCloudinary();

// Trust proxy (Render/NGINX)
app.set("trust proxy", 1);

// CORS
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://tinymillion.com",
    "https://www.tinymillion.com",
    "https://admin.tinymillion.com",
    "https://www.admin.tinymillion.com",
    "https://tinymillion.onrender.com"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "token", "x-seed-key"],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// 🔑 Enable cookies
app.use(cookieParser());

// Body parsers (larger limits for images/forms)
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// API routes
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/newsletter", newsletterRoute);
app.use("/api/ministores", miniStoreRoutes);

// SEO + health
app.use("/", seoRoutes);
app.get("/api/health", (req, res) => res.json({ ok: true, time: new Date().toISOString() }));
app.get("/", (_req, res) => res.send("✅ API Working Fine"));

// Start
app.listen(port, () => console.log(`🚀 Server started on PORT: ${port}`));
