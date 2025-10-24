import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

const addProduct = async (req, res) => {
  try {
    let { name, description, price, category, subCategory, sizes, bestseller } = req.body;

    const bestsellerBool = String(bestseller).toLowerCase() === "true";

    // sizes can be sizes[], "S,M", or '["S","M"]'
    let sizesArr = [];
    if (Array.isArray(sizes)) {
      sizesArr = sizes;
    } else if (typeof sizes === "string") {
      try {
        const parsed = JSON.parse(sizes);
        sizesArr = Array.isArray(parsed) ? parsed : String(sizes).split(",");
      } catch {
        sizesArr = String(sizes).split(",");
      }
    }
    sizesArr = (sizesArr || []).map((s) => String(s).trim()).filter(Boolean);
    if (String(category).toLowerCase() === "jewellery" && sizesArr.length === 0) {
      sizesArr = ["nosize"];
    }

    const image1 = req.files?.image1?.[0];
    const image2 = req.files?.image2?.[0];
    const image3 = req.files?.image3?.[0];
    const image4 = req.files?.image4?.[0];
    const images = [image1, image2, image3, image4].filter(Boolean);

    const streamUpload = (fileBuffer) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "image" },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(fileBuffer);
      });

    const imagesUrl = await Promise.all(
      images.map(async (file) => {
        const out = await streamUpload(file.buffer);
        return out.secure_url;
      })
    );

    const product = new productModel({
      name: String(name || "").trim(),
      description: String(description || "").trim(),
      category,
      subCategory,
      price: Number(price) || 0,
      bestseller: bestsellerBool,
      sizes: sizesArr,
      images: imagesUrl,
      date: Date.now(),
    });

    await product.save();
    return res.json({ success: true, message: "Product Added" });
  } catch (error) {
    console.error("addProduct error:", error);
    return res.status(500).json({ success: false, message: error.message || "Add product failed" });
  }
};

const listProducts = async (_req, res) => {
  try {
    const products = await productModel.find({});
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Product Removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await productModel.findById(productId);
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { listProducts, addProduct, removeProduct, singleProduct };
