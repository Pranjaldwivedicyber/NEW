import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(ShopContext);

  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');

  // Handle both `images` (array) and `image` (string/array)
  const getImages = (prod) => {
    if (!prod) return [];
    if (Array.isArray(prod.images)) return prod.images;
    if (Array.isArray(prod.image)) return prod.image;
    if (prod.images) return [prod.images];
    if (prod.image) return [prod.image];
    return [];
  };

  useEffect(() => {
    const item = products.find((p) => p._id === productId);
    if (!item) return;
    setProductData(item);
    const imgs = getImages(item);
    setImage(imgs[0] || '');
    setSize('');
  }, [productId, products]);

  if (!productData) return <div className="p-8">Loading...</div>;

  const categoryName = String(productData.category || '').trim().toLowerCase();
  const isJewellery = ['jewellery', 'jewelry', 'jewelery'].includes(categoryName);

  const handleAddToCart = () => {
    if (!isJewellery && !size) {
      alert('Please select a size before adding to cart');
      return;
    }
    const sizeToSend = isJewellery ? undefined : size;
    addToCart(productData._id, sizeToSend, productData.category);
  };

  const images = getImages(productData);

  return (
    <div className="border-t-2 pt-10">
      {/* Desktop: 2 columns; Mobile: stacked */}
      <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-12">

        {/* LEFT: Thumbnails (fixed 1/5 width on desktop) */}
        <div className="w-full sm:basis-1/5 sm:shrink-0">
          {/* Mobile: horizontal scroll; Desktop: vertical list */}
          <div className="flex gap-3 overflow-x-auto sm:flex-col sm:overflow-y-auto sm:max-h-[520px] pr-1">
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                onClick={() => setImage(img)}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-20 w-20 sm:h-24 sm:w-24 object-cover rounded cursor-pointer flex-none border"
              />
            ))}
          </div>
        </div>

        {/* RIGHT: Main image + info (fixed 4/5 width on desktop) */}
        <div className="w-full sm:basis-4/5">
          {image && (
            <img
              src={image}
              alt=""
              loading="eager"
              decoding="async"
              className="w-[300px] sm:w-[70%] h-auto object-cover rounded mx-auto mb-6"
            />
          )}

          {/* Info */}
          <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>
          <p className="mt-5 text-3xl font-medium">
            {currency}
            {productData.price}
          </p>
          <p className="mt-5 text-gray-500 md:w-4/5">{productData.description}</p>

          {/* Sizes (hidden for jewellery) */}
          {!isJewellery && Array.isArray(productData.sizes) && productData.sizes.length > 0 && (
            <div className="flex flex-col gap-4 my-8">
              <p>Select Size</p>
              <div className="flex gap-2">
                {productData.sizes.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setSize(s)}
                    className={`border py-2 px-4 bg-gray-100 ${s === size ? 'border-orange-500' : ''}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700"
          >
            ADD TO CART
          </button>

          <hr className="mt-8 sm:w-4/5" />
          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>100% Original product.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Product;
