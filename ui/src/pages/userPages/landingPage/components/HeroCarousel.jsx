import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

function HeroCarousel() {
  const slides = [
    {
      title: "Loans made simple and fast 🚀",
      subtitle: "Quick approvals and flexible repayment options.",
      bg: "https://images.unsplash.com/photo-1563013544-824ae1b704d3",
    },
    {
      title: "Check your CIBIL score instantly 📊",
      subtitle: "Stay informed about your credit health anytime.",
      bg: "https://images.unsplash.com/photo-1605902711622-cfb43c4437b5",
    },
    {
      title: "Insurance solutions for your future 🛡️",
      subtitle: "Protect what matters most with smart coverage.",
      bg: "https://images.unsplash.com/photo-1521791136064-7986c2920216",
    },
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000); // auto-slide every 5 sec
    return () => clearInterval(timer);
  }, [slides.length]);

  const prevSlide = () => setIndex((index - 1 + slides.length) % slides.length);
  const nextSlide = () => setIndex((index + 1) % slides.length);

  return (
    <div className="relative w-full h-[50vh] overflow-hidden">
      <AnimatePresence>
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={slides[index].bg}
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center px-6">
            <motion.h1
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold text-white"
            >
              {slides[index].title}
            </motion.h1>
            <motion.p
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mt-4 text-lg md:text-2xl text-gray-200 max-w-2xl"
            >
              {slides[index].subtitle}
            </motion.p>

            <div className="mt-8 flex gap-4">
              <Link
                  to="#services"
                className="bg-white text-[#1e7a8c] px-6 py-3 rounded-lg shadow-lg hover:shadow-xl font-semibold"
              >
                Explore Services
              </Link>
              <Link
                to="/cibil-score"
                className="border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-[#1e7a8c] font-semibold"
              >
                Check CIBIL
              </Link>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black/70"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black/70"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 w-full flex justify-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full ${
              i === index ? "bg-white" : "bg-gray-400"
            }`}
          ></button>
        ))}
      </div>
    </div>
  );
}

export default HeroCarousel;
