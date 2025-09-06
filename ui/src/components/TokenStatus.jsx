import React, { useState, useEffect } from 'react';
import useAuthStore from '@/store/authStore';
import { getTokenStatus, getTimeUntilExpiration, formatTokenExpiration } from '@/services/tokenService';

const TokenStatus = ({ showDetails = false, className = '' }) => {
  const { user, isAuthenticated } = useAuthStore();
  const [tokenInfo, setTokenInfo] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.exp) {
      setTokenInfo(null);
      return;
    }

    const updateTokenInfo = () => {
      const status = getTokenStatus(user.exp);
      const timeInfo = getTimeUntilExpiration(user.exp);
      const formattedExpiration = formatTokenExpiration(user.exp);

      setTokenInfo({
        ...status,
        ...timeInfo,
        formattedExpiration
      });
    };

    // Update immediately
    updateTokenInfo();

    // Update every second for live countdown
    const interval = setInterval(updateTokenInfo, 1000);

    return () => clearInterval(interval);
  }, [user?.exp, isAuthenticated]);

  if (!isAuthenticated || !tokenInfo) {
    return null;
  }

  const getStatusIcon = () => {
    switch (tokenInfo.status) {
      case 'valid':
        return <i className="fas fa-check-circle text-green-500"></i>;
      case 'warning':
        return <i className="fas fa-exclamation-triangle text-yellow-500"></i>;
      case 'expiring':
        return <i className="fas fa-clock text-orange-500"></i>;
      case 'expired':
        return <i className="fas fa-times-circle text-red-500"></i>;
      default:
        return <i className="fas fa-question-circle text-gray-500"></i>;
    }
  };

  const getStatusColor = () => {
    switch (tokenInfo.status) {
      case 'valid':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'expiring':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'expired':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!showDetails) {
    // Simple status indicator with live countdown
    const isExpiring = tokenInfo.status === 'expiring' || tokenInfo.status === 'expired';
    const isWarning = tokenInfo.status === 'warning';
    
    return (
      <div className={`flex items-center gap-2 ${className}`} title={tokenInfo.formattedExpiration}>
        {getStatusIcon()}
        <span className={`text-sm font-mono font-medium ${
          isExpiring ? 'animate-pulse text-red-600' : 
          isWarning ? 'text-yellow-600' : 
          'text-green-600'
        }`}>
          {tokenInfo.expired ? 'Expired' : tokenInfo.countdown}
        </span>
      </div>
    );
  }

  // Detailed status card
  return (
    <div className={`border rounded-lg p-3 ${getStatusColor()} ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        {getStatusIcon()}
        <span className="font-medium">Session Status</span>
      </div>
      
      <div className="text-sm space-y-1">
        <div><strong>Status:</strong> {tokenInfo.message}</div>
        <div className="flex items-center gap-2">
          <strong>Time Remaining:</strong> 
          <span className={`font-mono font-bold text-lg ${
            tokenInfo.status === 'expiring' || tokenInfo.status === 'expired' ? 'animate-pulse text-red-600' :
            tokenInfo.status === 'warning' ? 'text-yellow-600' :
            'text-green-600'
          }`}>
            {tokenInfo.expired ? 'Expired' : tokenInfo.countdown}
          </span>
        </div>
        <div><strong>Readable:</strong> {tokenInfo.humanReadable}</div>
        <div><strong>Expires:</strong> {tokenInfo.formattedExpiration}</div>
      </div>

      {(tokenInfo.status === 'expiring' || tokenInfo.status === 'warning') && (
        <div className="mt-2 text-xs">
          <i className="fas fa-info-circle mr-1"></i>
          Please save your work and consider refreshing your session.
        </div>
      )}
    </div>
  );
};

export default TokenStatus;