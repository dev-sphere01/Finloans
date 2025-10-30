import { CreditCard, Shield, PiggyBank, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom"; // ✅ import Link

const services = [
    {
        title: "Loans",
        description:
            "Flexible loan options with competitive interest rates to help you achieve your goals.",
        icon: <PiggyBank className="w-8 h-8 text-white" />,
        gradient: "from-[#2D9DB2] to-[#1e7a8c]",
        route: "loans",
    },
    {
        title: "Credit Cards",
        description:
            "Choose from a wide range of credit cards with rewards, cashback, and exclusive benefits.",
        icon: <CreditCard className="w-8 h-8 text-white" />,
        gradient: "from-pink-500 to-rose-600",
        route: "credit-cards",
    },
    {
        title: "Insurance",
        description:
            "Secure your future with reliable health, life, and general insurance plans.",
        icon: <Shield className="w-8 h-8 text-white" />,
        gradient: "from-green-500 to-emerald-600",
        route: "insurance",
    },
    {
        title: "Work With Us",
        description:
            "Partner with us to bring financial growth opportunities and career advancements.",
        icon: <Briefcase className="w-8 h-8 text-white" />,
        gradient: "from-indigo-500 to-purple-600",
        route: "work-with-us",
    },
];

const Services = () => {
    return (
        <section
            id="services"
            className="py-20 px-6 lg:px-20 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden"
        >
            {/* Background Accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#2D9DB2]/10 rounded-full blur-3xl -z-10"></div>

            {/* Heading */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-14"
            >
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-800">
                    Our <span className="text-[#2D9DB2]">Financial Services</span>
                </h2>
                <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
                    Explore our trusted financial solutions designed to make your journey
                    secure, convenient, and rewarding.
                </p>
            </motion.div>

            {/* Service Cards */}
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
                {services.map((service, index) => (
                    <motion.div
                        key={service.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.2 }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.01, y: -8 }}
                        className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-center border border-slate-100 group overflow-hidden"
                    >
                        {/* Icon Circle */}
                        <div
                            className={`mx-auto mb-6 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${service.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                        >
                            {service.icon}
                        </div>

                        <h3 className="text-xl font-semibold text-slate-800 mb-3">
                            {service.title}
                        </h3>
                        <p className="text-slate-600 leading-relaxed">{service.description}</p>

                        {/* CTA Button as dynamic Link */}
                        <Link
                            to={`/services/${service.route}`}
                            className="mt-6 inline-block px-5 py-2 rounded-lg bg-[#2D9DB2] hover:bg-[#1e7a8c] text-white text-sm font-medium transition-colors duration-300 shadow-md hover:shadow-lg cursor-pointer"
                        >
                            Apply Now
                        </Link>

                        {/* Animated Border Glow */}
                        <motion.div
                            className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#2D9DB2]/60 pointer-events-none"
                            initial={false}
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{
                                repeat: Infinity,
                                duration: 3,
                                ease: "easeInOut",
                            }}
                        />
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Services;
