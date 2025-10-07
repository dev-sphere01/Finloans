import { motion } from 'framer-motion';
import { 
  Shield, 
  Users, 
  Award, 
  TrendingUp, 
  CheckCircle, 
  Heart,
  Target,
  Globe
} from 'lucide-react';

export default function AboutPage() {
  const stats = [
    { icon: Users, label: 'Happy Customers', value: '50,000+' },
    { icon: Award, label: 'Years of Experience', value: '15+' },
    { icon: TrendingUp, label: 'Success Rate', value: '95%' },
    { icon: Shield, label: 'Trusted Partners', value: '100+' }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Customer First',
      description: 'We prioritize our customers\' financial well-being and provide personalized solutions for their unique needs.'
    },
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'Your financial information is secure with us. We maintain the highest standards of data protection and privacy.'
    },
    {
      icon: Target,
      title: 'Goal-Oriented',
      description: 'We help you achieve your financial goals through strategic planning and the right financial products.'
    },
    {
      icon: Globe,
      title: 'Innovation',
      description: 'We leverage technology to provide seamless, efficient, and modern financial services.'
    }
  ];

  const team = [
    {
      name: 'Rajesh Kumar',
      role: 'CEO & Founder',
      experience: '20+ years in Banking',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face'
    },
    {
      name: 'Priya Sharma',
      role: 'Head of Operations',
      experience: '15+ years in Finance',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face'
    },
    {
      name: 'Amit Patel',
      role: 'Technology Head',
      experience: '12+ years in FinTech',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold text-slate-800 mb-6"
          >
            About <span className="text-[#2D9DB2]">Finloans</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-slate-600 max-w-3xl mx-auto mb-12"
          >
            Your trusted partner in financial services, helping individuals and businesses 
            achieve their financial goals through innovative solutions and personalized service.
          </motion.p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-[#2D9DB2] to-[#1e7a8c] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon size={32} className="text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-800 mb-2">{stat.value}</h3>
                  <p className="text-slate-600">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
                Our Story
              </h2>
              <p className="text-slate-600 mb-6">
                Founded in 2008, Finloans began with a simple mission: to make financial services 
                accessible, transparent, and customer-centric. What started as a small team of 
                financial experts has grown into a trusted platform serving thousands of customers 
                across India.
              </p>
              <p className="text-slate-600 mb-6">
                We understand that every financial journey is unique. That's why we've built our 
                services around personalized solutions, cutting-edge technology, and unwavering 
                commitment to our customers' success.
              </p>
              <div className="flex items-center gap-4">
                <CheckCircle className="text-green-500" size={24} />
                <span className="text-slate-700 font-medium">RBI Registered & Compliant</span>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop"
                alt="Our Office"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#2D9DB2] to-[#1e7a8c] rounded-full flex items-center justify-center">
                    <Award className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">ISO Certified</p>
                    <p className="text-sm text-slate-600">Quality Assured</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-20 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Our Values
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              The principles that guide everything we do and shape our commitment to excellence.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-[#2D9DB2] to-[#1e7a8c] rounded-lg flex items-center justify-center mb-4">
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">{value.title}</h3>
                  <p className="text-slate-600 text-sm">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Meet Our Team
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Experienced professionals dedicated to your financial success.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-bold text-slate-800 mb-1">{member.name}</h3>
                <p className="text-[#2D9DB2] font-medium mb-2">{member.role}</p>
                <p className="text-slate-600 text-sm">{member.experience}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#2D9DB2] to-[#1e7a8c]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Our Mission
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              To democratize financial services by providing transparent, accessible, and 
              innovative solutions that empower individuals and businesses to achieve their 
              financial aspirations.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <p className="text-white font-semibold">Transparency</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <p className="text-white font-semibold">Innovation</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <p className="text-white font-semibold">Excellence</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}