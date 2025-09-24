import React from 'react';
import { Link } from 'react-router-dom';

const Homepage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/images/leaf-1.png" alt="Baobab" className="h-8 w-8" />
              <span className="ml-2 text-xl font-bold text-gray-900">Baobab</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-green-600">HOME</a>
              <a href="#" className="text-gray-700 hover:text-green-600">ABOUT</a>
              <a href="#" className="text-gray-700 hover:text-green-600">PRODUCT</a>
              <a href="#" className="text-gray-700 hover:text-green-600">CONTACT</a>
              <a href="#" className="text-gray-700 hover:text-green-600">BLOG</a>
            </nav>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">ENG</span>
              <Link to="/login" className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700">
                Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-50 to-green-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                PURE. POWERFUL. PROVEN.
              </h1>
              <p className="text-xl text-gray-600 mb-4">
                Baobab Products for Optimal Health & Vitality
              </p>
              <p className="text-gray-600 mb-8">
                Discover the ancient wisdom of the Baobab tree, packed with essential nutrients and antioxidants to support your wellness journey. Our premium products are sustainably sourced and scientifically formulated for maximum potency.
              </p>
              <div className="flex space-x-4 mb-8">
                <button className="bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700">
                  Shop Now
                </button>
                <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-md font-medium hover:bg-gray-50">
                  Learn More
                </button>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex -space-x-2">
                  <img className="w-8 h-8 rounded-full border-2 border-white" src="/images/IMG_4996 2.png" alt="Customer" />
                  <img className="w-8 h-8 rounded-full border-2 border-white" src="/images/IMG_4996 2.png" alt="Customer" />
                  <img className="w-8 h-8 rounded-full border-2 border-white" src="/images/IMG_4996 2.png" alt="Customer" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trusted by 10,000+ customers</p>
                  <div className="flex text-yellow-400">
                    ★★★★★
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img src="/images/IMG_4996 2.png" alt="Baobab Products" className="w-full h-auto rounded-lg" />
              <div className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg">
                <span className="text-green-600 font-bold">100% Natural</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <div className="flex justify-center space-x-8 bg-white py-4 shadow-sm">
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <img src="/images/leaf-1.png" alt="Moringa Juice" className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium">Moringa Berries Juice</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <img src="/images/leaf-1.png" alt="Ginkgo Tea" className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium">Ginkgo Tea</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <img src="/images/leaf-1.png" alt="Baobab Powder" className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium">Baobab Powder</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Baobab Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Get to Know About Baobab
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Celebrated as Africa's "Tree of Life," the Baobab tree has nourished communities for thousands of years with its nutrient-dense fruit and leaves.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Baobab: The Superfruit of Vitality
              </h3>
              <p className="text-gray-600 mb-6">
                The magnificent tree baobab tree, known as the "Tree of Life," has nourished African communities for thousands of years. Rich in vitamin C, antioxidants, and essential minerals, baobab fruit provides natural energy and supports immune function. Our sustainably harvested baobab products bring this ancient superfruit's benefits to your modern lifestyle.
              </p>
              <p className="text-gray-600 mb-6">
                Every piece of our baobab powder transforms your daily routine into a wellness ritual. From smoothies to baked goods, discover the versatility of this remarkable superfruit.
              </p>
              <p className="text-gray-600 mb-8">
                Want to see our products? <a href="#" className="text-green-600 underline">Browse our collection</a>
              </p>
              <button className="bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700">
                Discover Products
              </button>
            </div>
            <div className="relative">
              <img src="/images/Intersect.png" alt="Baobab Tree" className="w-full h-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Baobab Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why should you choose Baobab
            </h2>
            <p className="text-gray-600">
              Extraordinary benefits in every serving
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img src="/images/6241b2d41327941b39683db0_Peach%20Gradient%20Image%20(1)-p-800.png.png" alt="Baobab Benefits" className="w-full h-auto rounded-lg" />
            </div>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Digestive Health Support</h4>
                  <p className="text-gray-600">Rich in prebiotic fiber that promotes healthy gut bacteria and digestive wellness.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">😊</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">High in Vitamin C, B6, B6 and more</h4>
                  <p className="text-gray-600">Contains 6x more vitamin C than oranges, supporting immune function and collagen production.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">🌿</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Rich in Antioxidants</h4>
                  <p className="text-gray-600">Powerful antioxidants help protect cells from oxidative stress and support healthy aging.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">⚡</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Natural Energy Boost</h4>
                  <p className="text-gray-600">Natural sugars and nutrients provide sustained energy without the crash.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-green-600 font-medium mb-2">Our Products</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Products</h2>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Pure, Sustainable, and Packed with Goodness
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From nutrient-dense baobab powder to refreshing moringa juice, each product is carefully crafted to deliver maximum nutritional benefits while supporting sustainable farming practices.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img src="/images/6241b2d41327941b39683db0_Peach%20Gradient%20Image%20(1)-p-800.png (1).png" alt="Baobab Products" className="w-full h-auto rounded-lg" />
            </div>
            <div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Premium Quality Assurance</h4>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Sustainably Sourced</h4>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Third-Party Tested</h4>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <button className="bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700">
                  Shop Products
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-green-600 font-medium mb-2">Testimonials</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-gray-600">
              Real results, Real feedback.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <img src="/images/IMG_4996 2.png" alt="Customer" className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <h4 className="font-semibold text-gray-900">Sarah M.</h4>
                  <div className="flex text-yellow-400">
                    ★★★★★
                  </div>
                </div>
              </div>
              <p className="text-gray-600">
                "I've been adding baobab powder to my morning smoothies for 3 months now, and I feel more energized throughout the day. The taste is amazing, and I love knowing I'm getting so many nutrients!"
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <img src="/images/IMG_4996 2.png" alt="Customer" className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <h4 className="font-semibold text-gray-900">Michael R.</h4>
                  <div className="flex text-yellow-400">
                    ★★★★★
                  </div>
                </div>
              </div>
              <p className="text-gray-600">
                "The moringa juice has become a staple in my wellness routine. Great quality and fast shipping. Highly recommend!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why You Should Join & Invest in the Baobab Community Vision
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Become a Baobab Investing in Opportunity
            </p>
            <p className="text-gray-600 max-w-3xl mx-auto mt-4">
              When you join the Baobab Community, you're not just purchasing wellness products. You become part of a sustainable business model that rewards your investment in health and community growth. Together, we're building a global wellness network.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">🌱</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Sustainable Growth</h4>
              <p className="text-sm text-gray-600">Building a sustainable future together</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">🤝</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Community Support</h4>
              <p className="text-sm text-gray-600">Join a supportive wellness community</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">💰</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Financial Rewards</h4>
              <p className="text-sm text-gray-600">Earn while promoting wellness</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">🎯</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Personal Growth</h4>
              <p className="text-sm text-gray-600">Develop leadership and business skills</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">🌍</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Global Impact</h4>
              <p className="text-sm text-gray-600">Make a positive impact worldwide</p>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-green-600 font-medium mb-2">Blogs</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Get Latest Updates from Our News
            </h2>
            <p className="text-gray-600">
              Stay informed with the latest wellness tips, product updates, and community stories from the Baobab family.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <img src="/images/leaf-3.png" alt="Blog post" className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  The Science of Antioxidants: How Baobab
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Discover the powerful antioxidant properties of baobab fruit and how they support your body's natural defense systems.
                </p>
                <a href="#" className="text-green-600 text-sm font-medium hover:underline">
                  Read More →
                </a>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <img src="/images/6241b2d41327941b39683db0_Peach%20Gradient%20Image%20(1)-p-800.png.png" alt="Blog post" className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  5 Ways to Use Superfruit Baobab in
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Creative and delicious ways to incorporate baobab powder into your daily meals and snacks.
                </p>
                <a href="#" className="text-green-600 text-sm font-medium hover:underline">
                  Read More →
                </a>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <img src="/images/6241b2d41327941b39683db0_Peach%20Gradient%20Image%20(1)-p-800.png (1).png" alt="Blog post" className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Baobab for Digestive Health: What's
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Learn how baobab's prebiotic fiber supports digestive health and overall wellness.
                </p>
                <a href="#" className="text-green-600 text-sm font-medium hover:underline">
                  Read More →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img src="/images/leaf-1.png" alt="Baobab" className="h-8 w-8" />
                <span className="ml-2 text-xl font-bold">Baobab</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Bringing you the finest baobab products for optimal health and vitality. Sustainably sourced, scientifically formulated.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">📘</a>
                <a href="#" className="text-gray-400 hover:text-white">📷</a>
                <a href="#" className="text-gray-400 hover:text-white">🐦</a>
                <a href="#" className="text-gray-400 hover:text-white">💼</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Our Story</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Press</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Shipping Info</a></li>
                <li><a href="#" className="hover:text-white">Returns</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Stay up to date</h4>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-l-md text-sm"
                />
                <button className="bg-green-600 text-white px-4 py-2 rounded-r-md text-sm hover:bg-green-700">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Baobab. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;