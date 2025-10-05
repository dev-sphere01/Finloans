import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Info, Star, ArrowRight } from 'lucide-react';

const ServiceCard = ({
    product,
    onApply,
    index = 0,
    serviceType = 'general',
    buttonText = 'Apply Now'
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const Icon = product.icon;

    // Get the appropriate pricing info based on service type
    const getPricingInfo = () => {
        switch (serviceType) {
            case 'loans':
                return {
                    label: 'Interest Rate',
                    value: product.rate,
                    secondLabel: 'Loan Amount',
                    secondValue: product.amount
                };
            case 'insurance':
                return {
                    label: 'Premium',
                    value: product.premium,
                    secondLabel: 'Coverage',
                    secondValue: product.coverage
                };
            case 'credit-cards':
                return {
                    label: 'Annual Fee',
                    value: product.annualFee,
                    secondLabel: 'Credit Limit',
                    secondValue: product.creditLimit
                };
            case 'work-with-us':
                return {
                    label: 'Earning Potential',
                    value: product.earning,
                    secondLabel: 'Support',
                    secondValue: product.support
                };
            default:
                return {
                    label: 'Rate',
                    value: product.rate || product.premium || product.annualFee || product.earning,
                    secondLabel: 'Amount',
                    secondValue: product.amount || product.coverage || product.creditLimit || product.support
                };
        }
    };

    const pricingInfo = getPricingInfo();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="group relative"
        >
            <motion.div
                whileHover={{ y: -8, scale: 1.01 }}
                className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/30 overflow-hidden h-full hover:bg-white"
            >
                {/* Card Header */}
                <div className="relative p-6 pb-4">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                        <div className={`w-full h-full bg-gradient-to-br ${product.color} rounded-full transform translate-x-8 -translate-y-8`}></div>
                    </div>

                    {/* Product Image (if available) */}
                    {product.image && (
                        <div className="mb-4">
                            <img
                                src={product.image}
                                alt={product.title}
                                className="w-full h-32 object-cover rounded-lg shadow-sm"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        </div>
                    )}

                    {/* Icon and Title */}
                    <div className="flex items-start gap-4 relative z-10">
                        {product.icon && (
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className={`w-14 h-14 bg-gradient-to-r ${product.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}
                            >
                                <Icon size={24} className="text-white" />
                            </motion.div>
                        )}

                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-1">
                                {product.title}
                            </h3>
                            <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                                {product.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Pricing Info */}
                <div className="px-6 pb-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 rounded-lg p-3 text-center">
                            <p className="text-xs text-slate-500 mb-1">{pricingInfo.label}</p>
                            <p className="font-bold text-slate-800 text-sm">{pricingInfo.value}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3 text-center">
                            <p className="text-xs text-slate-500 mb-1">{pricingInfo.secondLabel}</p>
                            <p className="font-bold text-slate-800 text-sm">{pricingInfo.secondValue}</p>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="px-6 pb-4">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center justify-between w-full text-left"
                    >
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Key Features
                        </span>
                        <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Info size={14} className="text-slate-400" />
                        </motion.div>
                    </button>

                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mt-3 space-y-2"
                            >
                                {product.features.slice(0, 4).map((feature, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex items-center gap-2"
                                    >
                                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                                        <span className="text-slate-600 text-xs">{feature}</span>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Action Button */}
                <div className="px-6 pb-6">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onApply(product.id)}
                        className={`w-full bg-gradient-to-r ${product.color} text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm`}
                    >
                        {buttonText}
                        <motion.div
                            animate={{ x: isHovered ? 4 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ArrowRight size={16} />
                        </motion.div>
                    </motion.button>
                </div>



                {/* Popular Badge (optional) */}
                {product.isPopular && (
                    <div className="absolute top-4 right-4">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                            <Star size={10} />
                            Popular
                        </div>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default ServiceCard;