import { FaEnvelope, FaPhone, FaExternalLinkAlt } from 'react-icons/fa';

// Email Link Component
export const EmailLink = ({ email, className = "", showIcon = true, children }) => {
  if (!email) return null;

  return (
    <a
      href={`mailto:${email}`}
      className={`inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline transition-colors ${className}`}
      title={`Send email to ${email}`}
    >
      {showIcon && <FaEnvelope className="h-3 w-3 mr-1" />}
      {children || email}
    </a>
  );
};

// Phone Link Component
export const PhoneLink = ({ phone, className = "", showIcon = true, children }) => {
  if (!phone) return null;

  // Clean phone number for tel: link
  const cleanPhone = phone.replace(/\D/g, '');
  const formattedPhone = phone;

  return (
    <a
      href={`tel:+91${cleanPhone}`}
      className={`inline-flex items-center text-green-600 hover:text-green-800 hover:underline transition-colors ${className}`}
      title={`Call ${formattedPhone}`}
    >
      {showIcon && <FaPhone className="h-3 w-3 mr-1" />}
      {children || formattedPhone}
    </a>
  );
};

// Website Link Component
export const WebsiteLink = ({ url, className = "", showIcon = true, children }) => {
  if (!url) return null;

  // Ensure URL has protocol
  const fullUrl = url.startsWith('http') ? url : `https://${url}`;

  return (
    <a
      href={fullUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline transition-colors ${className}`}
      title={`Visit ${url}`}
    >
      {children || url}
      {showIcon && <FaExternalLinkAlt className="h-3 w-3 ml-1" />}
    </a>
  );
};

// Combined Contact Info Component
export const ContactInfo = ({ email, phone, className = "" }) => {
  if (!email && !phone) return null;

  return (
    <div className={`space-y-1 ${className}`}>
      {email && (
        <div>
          <EmailLink email={email} />
        </div>
      )}
      {phone && (
        <div>
          <PhoneLink phone={phone} />
        </div>
      )}
    </div>
  );
};

export default { EmailLink, PhoneLink, WebsiteLink, ContactInfo };