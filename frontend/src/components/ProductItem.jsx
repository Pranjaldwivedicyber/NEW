// frontend/src/components/ProductItem.jsx
import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";

const ProductItem = ({ id, image, name, price }) => {
  const { currency } = useContext(ShopContext);

  // 🟢 image could be array of URLs or a single URL (string)
  const imgSrc = Array.isArray(image)
    ? image[0] || ""
    : image || "";

  return (
    <Link
      onClick={() => window.scrollTo(0, 0)}
      className="text-gray-700 cursor-pointer"
      to={`/product/${id}`}
    >
      <div className="overflow-hidden">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={name}
            className="hover:scale-110 transition ease-in-out w-full h-auto object-cover"
          />
        ) : (
          // agar image missing ho to placeholder div
          <div className="w-full h-56 bg-gray-100 flex items-center justify-center">
            No image
          </div>
        )}
      </div>
      <p className="pt-3 pb-1 text-sm">{name}</p>
      <p className="text-sm font-medium">
        {currency}
        {price}
      </p>
    </Link>
  );
};

export default ProductItem;
