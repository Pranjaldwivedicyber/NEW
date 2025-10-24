import React from 'react'
import Hero from '../components/Hero'
import LatestCollection from '../components/LatestCollection'
import BestSeller from '../components/BestSeller'
import FeaturedMiniStores from "../components/FeaturedMiniStores";
import OurPolicy from '../components/OurPolicy'
import NewsletterBox from '../components/NewsletterBox'

const Home = () => {
  return (
    <div>
      <Hero />
      <LatestCollection/>
      <BestSeller/>
      <FeaturedMiniStores/>
      <OurPolicy/>
      <NewsletterBox/>
    </div>
  )
}

export default Home
