import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Home, Phone, Mail, Calendar, CreditCard, Shield, PiggyBank } from 'lucide-react';
import { useEffect } from 'react';
import Breadcrumb from '@/components/Breadcrumb';

export default function ApplicationSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const applicationData = location.state;

  useEffect(() => {
    // Redirect to home if no application data
    if (!applicationData) {
      navigate('/');
    }
  }, [applicationData, navigate]);

  if (!applicationData) {
    return null;
  }

  const { serviceName, message, fullName, serviceType } = applicationData;

  // Generate breadcrumb items based on service type
  const getBreadcrumbItems = () => {
    const baseItems = [
      { label: 'Services', disabled: true }
    ];

    if (serviceType?.includes('card')) {
      return [
        ...baseItems,
        { label: 'Credit Cards', disabled: true, icon: CreditCard },
        { label: 'CIBIL Check', disabled: true, icon: Shield },
        { label: 'Application', disabled: true, icon: CreditCard },
        { label: 'Success', icon: CheckCircle }
      ];
    } else if (serviceType?.includes('loan')) {
      return [
        ...baseItems,
        { label: 'Loans', disabled: true, icon: PiggyBank },
        { label: 'Application', disabled: true, icon: PiggyBank },
        { label: 'Success', icon: CheckCircle }
      ];
    } else if (serviceType?.includes('insurance')) {
      return [
        ...baseItems,
        { label: 'Insurance', disabled: true, icon: Shield },
        { label: 'Application', disabled: true, icon: Shield },
        { label: 'Success', icon: CheckCircle }
      ];
    }

    return [
      ...baseItems,
      { label: 'Application', disabled: true },
      { label: 'Success', icon: CheckCircle }
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Breadcrumb */}
      <Breadcrumb items={getBreadcrumbItems()} />
      

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
            <CheckCircle size={48} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Application Submitted Successfully!
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Thank you, {fullName}! Your {serviceName} application has been received.
          </p>
        </div>

        {/* Application Details */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">What Happens Next?</h2>
            <p className="text-slate-600 text-lg">
              {message}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-blue-50 rounded-2xl">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">1</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Document Verification</h3>
              <p className="text-slate-600 text-sm">Our team will verify your submitted documents within 24 hours.</p>
            </div>

            <div className="text-center p-6 bg-green-50 rounded-2xl">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">2</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Application Review</h3>
              <p className="text-slate-600 text-sm">Your application will be reviewed by our specialists.</p>
            </div>

            <div className="text-center p-6 bg-purple-50 rounded-2xl">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">3</span>
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Final Approval</h3>
              <p className="text-slate-600 text-sm">You'll receive approval notification within 48 hours.</p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-slate-50 rounded-2xl p-6">
            <h3 className="font-semibold text-slate-800 mb-4 text-center">Need Help? Contact Us</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="flex items-center justify-center gap-2 text-slate-600">
                <Phone size={16} />
                <span>1800-123-4567</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-slate-600">
                <Mail size={16} />
                <span>support@finloans.com</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-slate-600">
                <Calendar size={16} />
                <span>Mon-Sat 9AM-6PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-[#1e7a8c] to-[#0f4c59] text-white font-semibold py-3 px-8 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Home size={20} />
            Back to Home
          </button>
          <button
            onClick={() => navigate('/services')}
            className="bg-white text-[#1e7a8c] border-2 border-[#1e7a8c] font-semibold py-3 px-8 rounded-xl hover:bg-[#1e7a8c] hover:text-white transition-all"
          >
            Explore More Services
          </button>
        </div>

        {/* Application Reference */}
        <div className="mt-8 text-center">
          <div className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl p-4 inline-block">
            <p className="text-slate-600 text-sm mb-1">Application Reference ID</p>
            <p className="font-mono font-bold text-slate-800 text-lg">
              FL{serviceType?.toUpperCase().replace('-', '')}{Date.now().toString().slice(-6)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}