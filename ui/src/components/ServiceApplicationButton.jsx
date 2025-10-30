import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * Reusable button component for navigating to the unified application form
 * @param {Object} props
 * @param {string} props.serviceType - Type of service (credit-card, insurance, loan)
 * @param {string} props.subType - Subtype of service (health, personal, etc.)
 * @param {Object} props.data - Data to pass to the form
 * @param {string} props.label - Button label
 * @param {string} props.className - Additional CSS classes
 */
export default function ServiceApplicationButton({ 
  serviceType, 
  subType, 
  data = {}, 
  label = 'Apply Now',
  className = ''
}) {
  const navigate = useNavigate();

  const handleApply = () => {
    const route = subType ? `/apply/${serviceType}/${subType}` : `/apply/${serviceType}`;
    navigate(route, { state: data });
  };

  return (
    <button
      onClick={handleApply}
      className={`bg-gradient-to-r from-[#2D9DB2] to-[#1e7a8c] text-white font-semibold py-2 px-4 rounded-lg hover:shadow-md transition-all flex items-center justify-center gap-2 ${className}`}
    >
      {label} <ArrowRight size={16} />
    </button>
  );
}

// Usage Examples:

// Credit Card Application
// <ServiceApplicationButton 
//   serviceType="credit-card" 
//   subType="hdfc-infinia"
//   data={{
//     fullName: 'John Doe',
//     preApproved: true,
//     creditScore: 780,
//     selectedCard: cardData
//   }}
//   label="Apply for HDFC Infinia"
// />

// Insurance Application
// <ServiceApplicationButton 
//   serviceType="insurance" 
//   subType="health"
//   data={{
//     fullName: 'John Doe',
//     serviceType: 'Health Insurance'
//   }}
//   label="Apply for Health Insurance"
// />

// Loan Application
// <ServiceApplicationButton 
//   serviceType="loan" 
//   subType="personal"
//   data={{
//     fullName: 'John Doe',
//     serviceType: 'Personal Loan'
//   }}
//   label="Apply for Personal Loan"
// />