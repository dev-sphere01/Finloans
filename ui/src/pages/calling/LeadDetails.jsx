import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import useCallingStore from '@/store/callingStore';
import callingService from '@/services/callingService';
import { 
  FaPhone, 
  FaPhoneSlash, 
  FaUser, 
  FaEnvelope, 
  FaServicestack, 
  FaSave, 
  FaTimes,
  FaExternalLinkAlt,
  FaArrowLeft
} from 'react-icons/fa';

const LeadDetails = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shouldStartCall = searchParams.get('startCall') === 'true';

  const {
    currentLead,
    services,
    serviceProviders,
    isCallSessionActive,
    sessionData,
    setCurrentLead,
    setServices,
    setServiceProviders,
    startCallSession,
    updateSessionData,
    endCallSession
  } = useCallingStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [callPicked, setCallPicked] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [formData, setFormData] = useState({
    selectedService: '',
    serviceSubcategory: '',
    serviceProvider: '',
    status: '',
    remarks: '',
    callNotes: ''
  });

  useEffect(() => {
    loadLeadDetails();
    loadMasterData();
  }, [leadId]);

  useEffect(() => {
    if (shouldStartCall && currentLead && !isCallSessionActive) {
      handleStartCall();
    }
  }, [currentLead, shouldStartCall, isCallSessionActive]);

  useEffect(() => {
    if (isCallSessionActive && sessionData) {
      // Update form data with session data
      setFormData(prev => ({
        ...prev,
        ...sessionData.currentData
      }));
    }
  }, [isCallSessionActive, sessionData]);

  useEffect(() => {
    if (formData.selectedService) {
      loadSubcategories(formData.selectedService);
    }
  }, [formData.selectedService]);

  useEffect(() => {
    if (formData.selectedService) {
      loadServiceProviders(formData.selectedService);
    }
  }, [formData.selectedService]);

  const loadLeadDetails = async () => {
    try {
      setIsLoading(true);
      const lead = await callingService.getLeadById(leadId);
      setCurrentLead(lead);
      setFormData({
        selectedService: lead.selectedService || '',
        serviceSubcategory: lead.serviceSubcategory || '',
        serviceProvider: lead.serviceProvider || '',
        status: lead.status || '',
        remarks: lead.remarks || '',
        callNotes: lead.callNotes || ''
      });
    } catch (error) {
      console.error('Error loading lead details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMasterData = async () => {
    try {
      const [servicesData] = await Promise.all([
        callingService.getServices()
      ]);
      setServices(servicesData);
    } catch (error) {
      console.error('Error loading master data:', error);
    }
  };

  const loadSubcategories = async (serviceId) => {
    try {
      const data = await callingService.getServiceSubcategories(serviceId);
      setSubcategories(data);
    } catch (error) {
      console.error('Error loading subcategories:', error);
    }
  };

  const loadServiceProviders = async (serviceId) => {
    try {
      const data = await callingService.getServiceProviders(serviceId);
      setProviders(data);
    } catch (error) {
      console.error('Error loading service providers:', error);
    }
  };

  const handleStartCall = async () => {
    try {
      await callingService.startCall(leadId);
      startCallSession(leadId);
      setCallPicked(null);
    } catch (error) {
      console.error('Error starting call:', error);
    }
  };

  const handleEndCall = async (saveChanges = true) => {
    if (!isCallSessionActive) return;

    try {
      setIsSaving(true);
      
      if (saveChanges) {
        const callData = {
          ...formData,
          callPicked: callPicked,
          callEndTime: new Date().toISOString()
        };
        
        await callingService.endCall(leadId, callData);
        await callingService.updateLead(leadId, formData);
      }
      
      endCallSession(saveChanges);
      
      if (saveChanges) {
        await loadLeadDetails(); // Refresh lead data
      }
    } catch (error) {
      console.error('Error ending call:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormChange = (field, value) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    
    if (isCallSessionActive) {
      updateSessionData(updatedData);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      await callingService.updateLead(leadId, formData);
      
      if (isCallSessionActive) {
        updateSessionData(formData);
      }
      
      await loadLeadDetails();
    } catch (error) {
      console.error('Error saving changes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getSelectedProvider = () => {
    return providers.find(p => p.id === formData.serviceProvider);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!currentLead) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Lead not found</h2>
        <button
          onClick={() => navigate('/calling')}
          className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
        >
          Back to Calling Queue
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/calling')}
            className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
          >
            <FaArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lead Details</h1>
            <p className="text-gray-600 mt-1">Manage lead information and calling activities</p>
          </div>
        </div>

        <div className="flex gap-2">
          {!isCallSessionActive ? (
            <button
              onClick={handleStartCall}
              className="flex items-center px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-md transition-colors"
            >
              <FaPhone className="h-4 w-4 mr-2" />
              Start Call
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => handleEndCall(true)}
                disabled={isSaving}
                className="flex items-center px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
              >
                <FaSave className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save & End Call'}
              </button>
              <button
                onClick={() => handleEndCall(false)}
                className="flex items-center px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md transition-colors"
              >
                <FaTimes className="h-4 w-4 mr-2" />
                End Without Saving
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Session Alert */}
      {isCallSessionActive && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <FaPhone className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-800">
              Call session active - All changes are being saved automatically
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Lead Information</h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <FaUser className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <div className="text-sm font-medium text-gray-900">{currentLead.name}</div>
                <div className="text-sm text-gray-500">Full Name</div>
              </div>
            </div>

            <div className="flex items-center">
              <FaPhone className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <div className="text-sm font-medium text-gray-900">{currentLead.contactNo}</div>
                <div className="text-sm text-gray-500">Contact Number</div>
              </div>
            </div>

            {currentLead.email && (
              <div className="flex items-center">
                <FaEnvelope className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{currentLead.email}</div>
                  <div className="text-sm text-gray-500">Email Address</div>
                </div>
              </div>
            )}

            <div className="flex items-center">
              <FaServicestack className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <div className="text-sm font-medium text-gray-900">{currentLead.selectedService}</div>
                <div className="text-sm text-gray-500">Original Service Request</div>
              </div>
            </div>
          </div>
        </div>

        {/* Call Status */}
        {isCallSessionActive && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Call Status</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Did the customer pick up the call? *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="callPicked"
                      value="yes"
                      checked={callPicked === true}
                      onChange={() => setCallPicked(true)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="callPicked"
                      value="no"
                      checked={callPicked === false}
                      onChange={() => setCallPicked(false)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">No</span>
                  </label>
                </div>
              </div>

              {callPicked === false && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    This lead will remain in pending status. You can try calling again later.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Service Details - Only show if call was picked or not in active session */}
      {(callPicked === true || !isCallSessionActive) && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Service Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service *
              </label>
              <select
                value={formData.selectedService}
                onChange={(e) => handleFormChange('selectedService', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory Selection */}
            {subcategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategory
                </label>
                <select
                  value={formData.serviceSubcategory}
                  onChange={(e) => handleFormChange('serviceSubcategory', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select subcategory</option>
                  {subcategories.map((sub) => (
                    <option key={sub.id} value={sub.name}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Service Provider Selection */}
            {providers.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Provider
                </label>
                <select
                  value={formData.serviceProvider}
                  onChange={(e) => handleFormChange('serviceProvider', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select provider</option>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleFormChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Service Provider Link */}
          {getSelectedProvider()?.website && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Service Provider Website</h4>
                  <p className="text-sm text-blue-700">{getSelectedProvider().name}</p>
                </div>
                <a
                  href={getSelectedProvider().website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
                >
                  <FaExternalLinkAlt className="h-3 w-3 mr-2" />
                  Visit Website
                </a>
              </div>
            </div>
          )}

          {/* Remarks */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) => handleFormChange('remarks', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add any remarks or notes about this lead..."
            />
          </div>

          {/* Call Notes */}
          {isCallSessionActive && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Call Notes
              </label>
              <textarea
                value={formData.callNotes}
                onChange={(e) => handleFormChange('callNotes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Notes from this call session..."
              />
            </div>
          )}

          {/* Save Button - Only show if not in active call session */}
          {!isCallSessionActive && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="flex items-center px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
              >
                <FaSave className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeadDetails;