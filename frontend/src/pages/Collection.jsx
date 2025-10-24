import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);

  // UI state
  const [showFilter, setShowFilter] = useState(false); // mobile toggle
  const [filterProducts, setFilterProducts] = useState([]);

  // filters
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);

  // sorting
  const [sortType, setSortType] = useState('relavent'); // keep value as before

  // toggle helper for checkbox groups
  const toggleValue = (value, setter) => {
    setter(prev => (prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]));
  };

  // apply all filters
  const applyFilter = () => {
    let list = products.slice();

    // search
    if (showSearch && search) {
      const q = search.toLowerCase();
      list = list.filter(item => item.name.toLowerCase().includes(q));
    }

    // category
    if (category.length > 0) {
      list = list.filter(item => category.includes(item.category));
    }

    // subcategory
    if (subCategory.length > 0) {
      list = list.filter(item => subCategory.includes(item.subCategory));
    }

    setFilterProducts(list);
  };

  // sort current filtered products
  const sortProducts = () => {
    let list = filterProducts.slice();
    switch (sortType) {
      case 'low-high':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'high-low':
        list.sort((a, b) => b.price - a.price);
        break;
      default:
        // 'relavent' → original order
        break;
    }
    setFilterProducts(list);
  };

  // re-filter when inputs change
  useEffect(() => {
    applyFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, subCategory, search, showSearch, products]);

  // re-sort when sort type changes
  useEffect(() => {
    sortProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortType]);

  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t min-h-screen px-4">
      {/* LEFT: Sidebar Filters (desktop fixed, mobile toggle) */}
      <div className="min-w-60">
        <p
          onClick={() => setShowFilter(!showFilter)}
          className="my-2 text-xl flex items-center cursor-pointer gap-2"
        >
          FILTERS
          <img
            className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`}
            src={assets.dropdown_icon}
            alt=""
          />
        </p>

        {/* Categories */}
        <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className="mb-3 text-sm font-medium">CATEGORIES</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            {['Men', 'Women', 'Kids', 'Jewellery'].map(c => (
              <label key={c} className="flex gap-2 items-center">
                <input
                  className="w-3"
                  type="checkbox"
                  value={c}
                  checked={category.includes(c)}
                  onChange={e => toggleValue(e.target.value, setCategory)}
                />
                {c}
              </label>
            ))}
          </div>
        </div>

        {/* Types */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className="mb-3 text-sm font-medium">TYPE</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            {['Topwear', 'Bottomwear', 'Winterwear', 'Girlish'].map(sc => (
              <label key={sc} className="flex gap-2 items-center">
                <input
                  className="w-3"
                  type="checkbox"
                  value={sc}
                  checked={subCategory.includes(sc)}
                  onChange={e => toggleValue(e.target.value, setSubCategory)}
                />
                {sc}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: Heading + Sort + Products */}
      <div className="flex-1">
        <div className="flex justify-between text-base sm:text-2xl mb-4">
          <Title text1={'ALL'} text2={'COLLECTIONS'} />
          <select
            onChange={e => setSortType(e.target.value)}
            className="border-2 border-gray-300 text-sm px-2"
          >
            <option value="relavent">Sort by: Relevant</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
          {filterProducts.map((item, index) => (
            <ProductItem
              key={index}
              id={item._id}
              name={item.name}
              price={item.price}
              image={item.images}  // backend se images array aa raha hai
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Collection;
