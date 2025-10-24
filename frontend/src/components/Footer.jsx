import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div>
        <div className='flex flex-col sm:grid  sm:grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-small'>
        <div>
             {/* Light mode logo */}
    <img
      src={assets.logoLight} 
      className="mb-5 w-32 dark:hidden"
      alt="Logo Light"
    />

    {/* Dark mode logo */}
    <img
      src={assets.logoDark}  
      className="mb-5 w-32 hidden dark:block"
      alt="Logo Dark"
    />
            <p className='w-full md:w-2/3 text-gray-600'>
              Tinymillion is your go-to fashion destination, delivering unique style essentials with quality and confidence. Discover more, shop smart.
            </p>
        </div>
        <div>
            <p className='text-xl font-medium mb-5'>COMPANY</p>
            <ul className='flex flex-col gap-1 text-gray-600'>
            <li>Home</li>
            <li>About us</li>
            <li>Delivery</li>
            <li>Privacy policy</li>
            <li>Terms & Conditions</li>
            <li>Return & Refund</li>
            <li>FAQs</li>
            </ul>
        </div>
        <div>
            <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
           <ul className="flex flex-col gap-3 text-gray-600">
  <li className="flex items-center gap-2">
    <img className="w-4 h-4" src={assets.whatsapp_logo} alt="whatsapp" />
    <a href="https://wa.me/919258808835" target="_blank" rel="noopener noreferrer">
      ‪+91-925-8808-835‬
    </a>
  </li>
  <li className="flex items-center gap-2">
    <span>✉</span>
    <a href="mailto:help.tinymillion@gmail.com" className="hover:underline">
      help.tinymillion@gmail.com
    </a>
  </li>
  <li className="flex items-center gap-2">
  <img className="w-4 h-4" src={assets.ins_logo} alt="Instagram" />
  <a href="https://www.instagram.com/_axyan1?igsh=MTQ4dTIzemtvYXZuNg==" target="_blank" rel="noopener noreferrer">
    Instagram
  </a>
</li>
<li className="flex items-center gap-2">
  <img className="w-4 h-4" src={assets.facebook_logo} alt="Facebook" />
  <a href="https://www.facebook.com/share/1AkLc942gd/" target="_blank" rel="noopener noreferrer">
    Facebook
  </a>
</li>
<li className="flex items-center gap-2">
  <img className="w-4 h-4" src={assets.pinterest_logo} alt="pinterest" />
  <a href="https://pin.it/2FUh69ciP" target="_blank" rel="noopener noreferrer">
    Pinterest
  </a>
</li>
</ul>

        </div>
           </div>
            <div>
            <hr />
           <p className='py-5 text-sm text-center text-gray-500'>
            © 2025 Tinymillion. All rights reserved. | Designed with ❤️ for everyone.
          </p>
        </div>
    </div>
  )
}

export default Footer