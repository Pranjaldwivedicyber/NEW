import React, { useContext, useEffect, useState, useMemo } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];
      for (const pid in cartItems) {
        for (const size in cartItems[pid]) {
          const qty = cartItems[pid][size];
          if (qty > 0) tempData.push({ _id: pid, size, quantity: qty });
        }
      }
      setCartData(tempData);
    } else {
      setCartData([]);
    }
  }, [cartItems, products]);

  const isCartEmpty = useMemo(() => cartData.length === 0, [cartData]);

  return (
    <div className='p-4 md:px-8'>
      <Title title='Cart' />
      <div>
        {cartData.map((item, index) => {
          const productData = products.find((product) => product._id === item._id) || {};
          const imgSrc =
            (productData.images && productData.images[0]) ||
            (productData.image && productData.image[0]) ||
            '';
          return (
            <div
              key={`${item._id}-${item.size}-${index}`}
              className='py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'
            >
              <div className='flex items-start gap-6'>
                <img className='w-16 sm:w-20' src={imgSrc} alt='' />
                <div>
                  <p className='text-xs sm:text-lg font-medium'>{productData.name}</p>
                  <div className='flex items-center gap-5 mt-2'>
                    <p>{currency}{productData.price}</p>
                    <p className='px-2 sm:px-3 sm:py-1 border bg-slate-50'>{item.size}</p>
                  </div>
                </div>
              </div>

              <input
                onChange={(e) => {
                  if (e.target.value === '' || e.target.value === '0') return;
                  updateQuantity(item._id, item.size, Number(e.target.value));
                }}
                className='border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1'
                type='number'
                min={1}
                defaultValue={item.quantity}
              />

              <img
                onClick={() => updateQuantity(item._id, item.size, 0)}
                className='w-4 mr-4 sm:w-5 cursor-pointer'
                src={assets.bin_icon}
                alt='remove'
              />
            </div>
          );
        })}
      </div>

      <div className='flex justify-end my-20'>
        <div className='w-full sm:w-[450px]'>
          <CartTotal />
          <div className='w-full text-end'>
            <button
              onClick={() => navigate("/place-order")}  
              disabled={isCartEmpty}
              className={`bg-black text-white text-sm my-8 px-8 py-3 ${isCartEmpty ? 'opacity-60 cursor-not-allowed' : ''}`}
              title={isCartEmpty ? 'Your cart is empty' : 'Proceed to Checkout'}
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
