import React, { useContext, useState } from 'react';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { assets } from '../assets/assets';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

// Updated PlaceOrder page. This version ensures that the authentication token
// is sent in both the custom `token` header and the standard
// `Authorization: Bearer <token>` header when placing orders. Without this,
// the backend auth middleware may fail to find the token, resulting in
// 401 Unauthorized responses during payment (COD, Stripe, Razorpay). It also
// adds a small check to redirect to login if no token is present.

const PlaceOrder = () => {
  const [method, setMethod] = useState('cod');
  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
    products,
  } = useContext(ShopContext);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: '',
  });

  // If user is not logged in, redirect them to login page
  // This prevents attempts to place orders without a token
  if (!token) {
    // Optionally, you could show a message before redirecting
    navigate('/login');
  }

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Order Payment',
      description: 'Order Payment',
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        try {
          const { data } = await axios.post(
            backendUrl + '/api/order/verifyRazorpay',
            response,
            {
              headers: {
                token,
                Authorization: `Bearer ${token}`,
              },
            },
          );
          if (data.success) {
            navigate('/orders');
            setCartItems({});
          }
        } catch (error) {
          console.log(error);
          toast.error(error?.response?.data?.message || error.message);
        }
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      let orderItems = [];
      for (const pid in cartItems) {
        for (const size in cartItems[pid]) {
          const qty = cartItems[pid][size];
          if (qty > 0) {
            const itemInfo = structuredClone(products.find((product) => product._id === pid));
            if (itemInfo) {
              itemInfo.size = size;
              itemInfo.quantity = qty;
              orderItems.push(itemInfo);
            }
          }
        }
      }
      const orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
      };
      // Headers with both token formats
      const headers = { token, Authorization: `Bearer ${token}` };
      switch (method) {
        case 'cod': {
          const response = await axios.post(
            backendUrl + '/api/order/place',
            orderData,
            { headers },
          );
          if (response.data.success) {
            setCartItems({});
            navigate('/orders');
          } else {
            toast.error(response.data.message);
          }
          break;
        }
        case 'stripe': {
          const responseStripe = await axios.post(
            backendUrl + '/api/order/stripe',
            orderData,
            { headers },
          );
          if (responseStripe.data.success) {
            const { session_url } = responseStripe.data;
            window.location.replace(session_url);
          } else {
            toast.error(responseStripe.data.message);
          }
          break;
        }
        case 'razorpay': {
          const responseRazorpay = await axios.post(
            backendUrl + '/api/order/razorpay',
            orderData,
            { headers },
          );
          if (responseRazorpay.data.success) {
            initPay(responseRazorpay.data.order);
          } else {
            toast.error(responseRazorpay.data.message);
          }
          break;
        }
        default:
          break;
      }
    } catch (error) {
      console.log(error);
      // If unauthorized, clear token and redirect to login
      const status = error?.response?.status;
      if (status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  return (
    <form className='p-4 md:px-8' onSubmit={onSubmitHandler}>
      {/* ------------- Left Side ---------------- */}
      <Title title='Delivery Information' />
      <div className='grid gap-4 max-w-lg'>
        <div className='flex gap-3'>
          <input
            required
            onChange={onChangeHandler}
            name='firstName'
            value={formData.firstName}
            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
            type='text'
            placeholder='First name'
          />
          <input
            required
            onChange={onChangeHandler}
            name='lastName'
            value={formData.lastName}
            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
            type='text'
            placeholder='Last name'
          />
        </div>
        <input
          required
          onChange={onChangeHandler}
          name='email'
          value={formData.email}
          className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
          type='email'
          placeholder='Email address'
        />
        <input
          required
          onChange={onChangeHandler}
          name='street'
          value={formData.street}
          className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
          type='text'
          placeholder='Street'
        />
        <div className='flex gap-3'>
          <input
            required
            onChange={onChangeHandler}
            name='city'
            value={formData.city}
            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
            type='text'
            placeholder='City'
          />
          <input
            onChange={onChangeHandler}
            name='state'
            value={formData.state}
            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
            type='text'
            placeholder='State'
          />
        </div>
        <div className='flex gap-3'>
          <input
            required
            onChange={onChangeHandler}
            name='zipcode'
            value={formData.zipcode}
            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
            type='number'
            placeholder='Zipcode'
          />
          <input
            required
            onChange={onChangeHandler}
            name='country'
            value={formData.country}
            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
            type='text'
            placeholder='Country'
          />
        </div>
        <input
          required
          onChange={onChangeHandler}
          name='phone'
          value={formData.phone}
          className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
          type='number'
          placeholder='Phone'
        />
      </div>

      {/* ------------- Right Side ------------------ */}
      <div className='mt-8'>
        <div className='mt-8 min-w-80'>
          <CartTotal />
        </div>
        <div className='mt-12'>
          <Title title='Payment Method' />
          {/* --------------- Payment Method Selection ------------- */}
          <div className='flex gap-3 flex-col lg:flex-row'>
            <div
              onClick={() => setMethod('stripe')}
              className='flex items-center gap-3 border p-2 px-3 cursor-pointer'
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === 'stripe' ? 'bg-green-400' : ''
                }`}
              ></p>
              <img className='h-5 mx-4' src={assets.stripe_logo} alt='' />
            </div>
            <div
              onClick={() => setMethod('razorpay')}
              className='flex items-center gap-3 border p-2 px-3 cursor-pointer'
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === 'razorpay' ? 'bg-green-400' : ''
                }`}
              ></p>
              <img className='h-5 mx-4' src={assets.razorpay_logo} alt='' />
            </div>
            <div
              onClick={() => setMethod('cod')}
              className='flex items-center gap-3 border p-2 px-3 cursor-pointer'
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === 'cod' ? 'bg-green-400' : ''
                }`}
              ></p>
              <p className='text-gray-500 text-sm font-medium mx-4'>CASH ON DELIVERY</p>
            </div>
          </div>
          <div className='w-full text-end mt-8'>
            <button type='submit' className='bg-black text-white px-16 py-3 text-sm'>
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;