import { User, CreditCard, Shield, Briefcase, PiggyBank } from "lucide-react";

export default function HomePage() {
  const products = [
    {
      id: "loans",
      title: "Loans",
      description:
        "Personal, Home, Car & Business loans with competitive rates",
      icon: PiggyBank,
      gradient: "from-[#1e7a8c] to-[#0f4c59]",
      href: "/products/loans",
    },
    {
      id: "credit-cards",
      title: "Credit Cards",
      description: "Premium credit cards with rewards and cashback",
      icon: CreditCard,
      gradient: "from-[#1e7a8c] to-[#2a8ca0]",
      href: "/products/credit-cards",
    },
    {
      id: "insurance",
      title: "Insurance",
      description: "Life, Health, Vehicle & Property insurance plans",
      icon: Shield,
      gradient: "from-[#1e7a8c] to-[#166b7a]",
      href: "/products/insurance",
    },
    {
      id: "careers",
      title: "Work with us",
      description: "Join our team and grow your career in finance",
      icon: Briefcase,
      gradient: "from-black to-gray-700",
      href: "/careers",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-[#1e7a8c] to-[#0f4c59] rounded-lg flex items-center justify-center">
                  <div className="w-5 h-5 bg-white rounded-sm"></div>
                </div>
                <span className="text-xl font-bold text-black">FinLoans</span>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a
                  href="/"
                  className="text-[#1e7a8c] font-medium px-3 py-2 text-sm"
                >
                  Home
                </a>
                <a
                  href="/products"
                  className="text-gray-600 hover:text-[#1e7a8c] font-medium px-3 py-2 text-sm transition-colors"
                >
                  Products
                </a>
                <a
                  href="/about"
                  className="text-gray-600 hover:text-[#1e7a8c] font-medium px-3 py-2 text-sm transition-colors"
                >
                  About
                </a>
                <a
                  href="/contact"
                  className="text-gray-600 hover:text-[#1e7a8c] font-medium px-3 py-2 text-sm transition-colors"
                >
                  Contact
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <User size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#1e7a8c] to-[#0f4c59] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your Financial Journey
              <span className="block text-gray-200">Starts Here</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Discover tailored financial solutions for loans, credit cards,
              insurance, and career opportunities
            </p>
            <button className="bg-white text-[#1e7a8c] font-semibold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors text-lg">
              Get Started Today
            </button>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Our Products & Services
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from our comprehensive range of financial products designed
            to meet your unique needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => {
            const Icon = product.icon;
            return (
              <a
                key={product.id}
                href={product.href}
                className="group cursor-pointer"
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${product.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3">
                    {product.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {product.description}
                  </p>
                  <div className="mt-6 flex items-center text-[#1e7a8c] font-medium text-sm group-hover:text-[#0f4c59] transition-colors">
                    Learn More
                    <svg
                      className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-[#1e7a8c] to-[#0f4c59] rounded-lg flex items-center justify-center">
                  <div className="w-5 h-5 bg-white rounded-sm"></div>
                </div>
                <span className="text-xl font-bold">FinLoans</span>
              </div>
              <p className="text-gray-400">
                Your trusted partner for all financial needs.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="/products/loans"
                    className="hover:text-white transition-colors"
                  >
                    Loans
                  </a>
                </li>
                <li>
                  <a
                    href="/products/credit-cards"
                    className="hover:text-white transition-colors"
                  >
                    Credit Cards
                  </a>
                </li>
                <li>
                  <a
                    href="/products/insurance"
                    className="hover:text-white transition-colors"
                  >
                    Insurance
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="/about"
                    className="hover:text-white transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="/careers"
                    className="hover:text-white transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="/help"
                    className="hover:text-white transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy"
                    className="hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/terms"
                    className="hover:text-white transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 FinLoans. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}



