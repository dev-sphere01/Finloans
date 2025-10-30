import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useCallingStore from '@/store/callingStore';
import callingService from '@/services/callingService';
import { EmailLink, PhoneLink, WebsiteLink } from '@/components/common/ContactLinks';
import { ActionButton } from '@/components/permissions';
import {
  Phone,
  PhoneOff,
  User,
  Save,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Loader2,
  CreditCard,
  Building,
  Shield
} from 'lucide-react';

const LeadDetails = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const { currentLead, services, setCurrentLead, setServices } = useCallingStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callPicked, setCallPicked] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [callHistory, setCallHistory] = useState([]);
  const [showCallHistory, setShowCallHistory] = useState(false);
  const [expandedCalls, setExpandedCalls] = useState(new Set());
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    selectedService: '',
    serviceSubcategory: '',
    serviceProvider: '',
    status: 'pending',
    remarks: ''
  });

  useEffect(() => {
    loadData();
  }, [leadId]);

  useEffect(() => {
    if (formData.selectedService) {
      loadSubcategories(formData.selectedService);
      loadServiceProviders(formData.selectedService);
    }
  }, [formData.selectedService]);

  // Prevent tab close during active call
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isCallActive) {
        e.preventDefault();
        e.returnValue = 'You have an active call session. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    if (isCallActive) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [isCallActive]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load lead and services first
      const [lead, servicesData] = await Promise.all([
        callingService.getLeadById(leadId),
        callingService.getServices()
      ]);

      setCurrentLead(lead);
      setServices(servicesData);

      // Load call history separately with error handling
      try {
        const callHistoryData = await callingService.getLeadCallHistory(leadId);
        console.log('Call history data received:', callHistoryData);
        console.log('Call stats:', callHistoryData.callStats);
        console.log('Call history array:', callHistoryData.callStats?.callHistory);
        setCallHistory(callHistoryData.callStats || {});
      } catch (historyError) {
        console.error('Failed to load call history:', historyError);
        setCallHistory({});
      }

      setFormData({
        selectedService: lead.selectedService || '',
        serviceSubcategory: lead.serviceSubcategory || '',
        serviceProvider: (typeof lead.serviceProvider === 'object' && lead.serviceProvider?.id)
          ? lead.serviceProvider.id
          : lead.serviceProvider || '',
        status: lead.status || 'pending',
        remarks: lead.remarks || ''
      });
    } catch (error) {
      console.error('Failed to load data:', error);
      setErrors({ general: 'Failed to load data' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubcategories = async (serviceName) => {
    const service = services.find(s => s.name === serviceName);
    if (service) {
      try {
        const data = await callingService.getServiceSubcategories(service.id);
        setSubcategories(data);
      } catch (error) {
        console.error('Error loading subcategories:', error);
      }
    }
  };

  const loadServiceProviders = async (serviceName) => {
    const service = services.find(s => s.name === serviceName);
    if (service) {
      try {
        const data = await callingService.getServiceProviders(service.id);
        setProviders(data);
      } catch (error) {
        console.error('Error loading providers:', error);
      }
    }
  };

  const handleStartCall = async () => {
    try {
      // Call backend to start call and create call history entry
      console.log('Starting call for lead:', leadId);
      console.log('Calling callingService.startCall...');

      const response = await callingService.startCall(leadId);
      console.log('Start call response:', response);

      // Set UI state
      setIsCallActive(true);
      setCallPicked(null);
      setErrors({});

      console.log('Call started successfully, UI state updated');

      // Reload data to get updated call history
      setTimeout(() => {
        console.log('Reloading data to get call history...');
        loadData();
      }, 1000);

    } catch (error) {
      console.error('Error starting call:', error);
      console.error('Error details:', error.response?.data || error.message);
      setErrors({ general: 'Failed to start call. Please try again.' });
    }
  };

  const handleEndCall = async () => {
    if (!isCallActive) return;

    try {
      setIsSaving(true);
      setErrors({});

      // Save all form data to backend including call picked status
      const updateData = {
        status: formData.status,
        remarks: formData.remarks,
        selectedService: formData.selectedService,
        serviceSubcategory: formData.serviceSubcategory,
        serviceProvider: (typeof formData.serviceProvider === 'object' && formData.serviceProvider?.id)
          ? formData.serviceProvider.id
          : formData.serviceProvider,
        callPicked: callPicked // Include the picked status
      };

      console.log('Ending call and saving data:', updateData);

      // Use endCall endpoint which will save the data
      const response = await callingService.endCall(leadId, updateData);
      console.log('End call response:', response);

      setIsCallActive(false);

      // Reload data to reflect changes (including call history)
      await loadData();

      // Show success message
      setErrors({ success: 'Call ended and lead updated successfully!' });
      setTimeout(() => setErrors({}), 3000);

    } catch (error) {
      console.error('End call error:', error);
      setErrors({ general: 'Failed to end call and save changes. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setErrors({});

      const updateData = {
        status: formData.status,
        remarks: formData.remarks,
        selectedService: formData.selectedService,
        serviceSubcategory: formData.serviceSubcategory,
        serviceProvider: (typeof formData.serviceProvider === 'object' && formData.serviceProvider?.id)
          ? formData.serviceProvider.id
          : formData.serviceProvider
      };

      console.log('Saving lead data:', updateData);

      const response = await callingService.updateLead(leadId, updateData);
      console.log('Save response:', response);

      // Reload data to reflect changes
      await loadData();

      // Show success message briefly
      setErrors({ success: 'Lead updated successfully!' });
      setTimeout(() => setErrors({}), 3000);

    } catch (error) {
      console.error('Save error:', error);
      setErrors({ general: 'Failed to save changes. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-save after 2 seconds of no changes (debounced)
    if (!isCallActive) {
      clearTimeout(window.autoSaveTimeout);
      window.autoSaveTimeout = setTimeout(() => {
        handleAutoSave();
      }, 2000);
    }
  };

  const handleAutoSave = async () => {
    try {
      setIsAutoSaving(true);

      const updateData = {
        status: formData.status,
        remarks: formData.remarks,
        selectedService: formData.selectedService,
        serviceSubcategory: formData.serviceSubcategory,
        serviceProvider: (typeof formData.serviceProvider === 'object' && formData.serviceProvider?.id)
          ? formData.serviceProvider.id
          : formData.serviceProvider
      };

      await callingService.updateLead(leadId, updateData);
      console.log('Auto-saved lead data');

      // Show brief auto-save indicator
      setTimeout(() => setIsAutoSaving(false), 1000);
    } catch (error) {
      console.error('Auto-save error:', error);
      setIsAutoSaving(false);
    }
  };

  const getSelectedProvider = () => providers.find(p => p.id === formData.serviceProvider);

  const toggleCallExpansion = (callIndex) => {
    const newExpanded = new Set(expandedCalls);
    if (newExpanded.has(callIndex)) {
      newExpanded.delete(callIndex);
    } else {
      newExpanded.add(callIndex);
    }
    setExpandedCalls(newExpanded);
  };

  const getServiceIcon = (serviceName) => {
    if (serviceName?.toLowerCase().includes('credit')) return CreditCard;
    if (serviceName?.toLowerCase().includes('loan')) return Building;
    if (serviceName?.toLowerCase().includes('insurance')) return Shield;
    return Building;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-200"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-blue-500 absolute top-0"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading lead details...</p>
        </div>
      </div>
    );
  }

  if (!currentLead) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lead not found</h2>
          <p className="text-gray-600 mb-4">The requested lead could not be found.</p>
          <button
            onClick={() => navigate('/dashboard/my-calls')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Calling Queue
          </button>
        </div>
      </div>
    );
  }

  const ServiceIcon = getServiceIcon(currentLead.selectedService);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/my-calls')}
                className="flex items-center px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
                title="Back to My Calling Queue"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Back</span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Lead Management</h1>
                  <p className="text-sm text-gray-500">ID: {leadId}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Auto-save indicator */}
              {isAutoSaving && (
                <div className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Auto-saving...
                </div>
              )}

              {!isCallActive ? (
                <ActionButton
                  module="calling_employee"
                  action="start_call"
                  label="Call"
                  icon={<Phone className="h-4 w-4 mr-2" />}
                  onClick={handleStartCall}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                />
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-sm font-medium">Call Active</span>
                  </div>
                  <ActionButton
                    module="calling_employee"
                    action="end_call"
                    label="Cancel Call"
                    icon={isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PhoneOff className="h-4 w-4 mr-2" />}
                    onClick={handleEndCall}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 disabled:opacity-50"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Error Display */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-500 mr-3" />
              <span className="text-red-800 font-medium">{errors.general}</span>
            </div>
          </div>
        )}

        {/* Success Display */}
        {errors.success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <span className="text-green-800 font-medium">{errors.success}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Lead Information - Non-editable */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Lead Information
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${formData.status === 'completed' ? 'bg-green-100 text-green-800' :
                  formData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    formData.status === 'failed' ? 'bg-red-100 text-red-800' :
                      formData.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                  }`}>
                  {formData.status.replace('_', ' ').charAt(0).toUpperCase() + formData.status.replace('_', ' ').slice(1)}
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                  <p className="text-sm font-medium text-gray-900">{currentLead.name}</p>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Contact Number</label>
                  <PhoneLink phone={currentLead.contactNo} className="text-sm font-medium" />
                </div>

                {currentLead.email && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Email Address</label>
                    <EmailLink email={currentLead.email} className="text-sm font-medium" />
                  </div>
                )}

                <div className="p-3 bg-gray-50 rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${currentLead.priority === 'high' ? 'bg-red-100 text-red-800' :
                      currentLead.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                      {currentLead.priority?.charAt(0).toUpperCase() + currentLead.priority?.slice(1)} Priority
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Original Service</label>
                  <div className="flex items-center">
                    <ServiceIcon className="h-4 w-4 mr-2 text-blue-600" />
                    <p className="text-sm font-medium text-gray-900">{currentLead.selectedService}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Call History - Collapsible */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              {/* Call History Header - Always Visible */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowCallHistory(!showCallHistory)}
                    className="flex items-center text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    <Clock className="h-5 w-5 mr-2 text-blue-600" />
                    Call History ({callHistory.totalCalls || 0} calls)
                    <svg
                      className={`ml-2 h-4 w-4 transition-transform ${showCallHistory ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <div className="flex items-center space-x-2">
                    {/* Quick Stats */}
                    {callHistory.totalCalls > 0 && (
                      <div className="flex items-center space-x-3 text-sm">
                        <span className="flex items-center text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                          {callHistory.pickedCalls}
                        </span>
                        <span className="flex items-center text-red-600">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                          {callHistory.notPickedCalls}
                        </span>
                        <span className="text-gray-500">
                          {Math.floor((callHistory.totalDuration || 0) / 60)}m total
                        </span>
                      </div>
                    )}

                    <button
                      onClick={loadData}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
              </div>

              {/* Call History Content - Collapsible */}
              {showCallHistory && (
                <div className="p-6">
                  {callHistory.callHistory && callHistory.callHistory.length > 0 ? (
                    <>
                      {/* Call Statistics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{callHistory.totalCalls}</div>
                          <div className="text-sm text-blue-700">Total Calls</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{callHistory.pickedCalls}</div>
                          <div className="text-sm text-green-700">Picked Up</div>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">{callHistory.notPickedCalls}</div>
                          <div className="text-sm text-red-700">Not Picked</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{Math.floor((callHistory.totalDuration || 0) / 60)}m</div>
                          <div className="text-sm text-purple-700">Total Duration</div>
                        </div>
                      </div>

                      {/* Call History List */}
                      <div className="space-y-4">
                        <h4 className="text-md font-semibold text-gray-800 mb-3">Call History Details</h4>
                        {callHistory.callHistory.map((call, index) => {
                          const isExpanded = expandedCalls.has(index);
                          return (
                            <div key={index} className="border border-gray-200 rounded-lg bg-white shadow-sm">
                              {/* Collapsed Header - Always Visible */}
                              <div
                                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => toggleCallExpansion(index)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${call.picked === true ? 'bg-green-100' :
                                      call.picked === false ? 'bg-red-100' : 'bg-gray-100'
                                      }`}>
                                      {call.picked === true ? (
                                        <Phone className="w-4 h-4 text-green-600" />
                                      ) : call.picked === false ? (
                                        <PhoneOff className="w-4 h-4 text-red-600" />
                                      ) : (
                                        <Clock className="w-4 h-4 text-gray-500" />
                                      )}
                                    </div>
                                    <div>
                                      <div className="font-semibold text-gray-900 flex items-center">
                                        Call #{callHistory.callHistory.length - index}
                                        {call.picked === true && (
                                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <Phone className="w-3 h-3 mr-1" />
                                            Picked
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        {new Date(call.callTime).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric'
                                        })} at {new Date(call.callTime).toLocaleTimeString('en-US', {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-3">
                                    {/* Quick Status */}
                                    <div className="text-right">
                                      <div className={`text-sm font-medium ${call.picked === true ? 'text-green-600' :
                                        call.picked === false ? 'text-red-600' : 'text-gray-600'
                                        }`}>
                                        {call.picked === true ? 'Answered' :
                                          call.picked === false ? 'Not Answered' : 'Attempted'}
                                      </div>
                                      {call.duration > 0 && (
                                        <div className="text-xs text-gray-500">
                                          {Math.floor(call.duration / 60)}m {call.duration % 60}s
                                        </div>
                                      )}
                                    </div>

                                    {/* Expand/Collapse Icon */}
                                    <svg
                                      className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''
                                        }`}
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </div>
                                </div>
                              </div>

                              {/* Expanded Details - Show on Demand */}
                              {isExpanded && (
                                <div className="px-4 pb-4 border-t border-gray-100">
                                  <div className="pt-4 space-y-4">
                                    {/* Detailed Time Information */}
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Call Timeline</div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        <div>
                                          <span className="font-medium text-gray-700">Started:</span>
                                          <div className="text-gray-900">
                                            {new Date(call.callTime).toLocaleDateString('en-US', {
                                              weekday: 'long',
                                              year: 'numeric',
                                              month: 'long',
                                              day: 'numeric'
                                            })}
                                          </div>
                                          <div className="text-gray-600">
                                            {new Date(call.callTime).toLocaleTimeString('en-US', {
                                              hour: '2-digit',
                                              minute: '2-digit',
                                              second: '2-digit'
                                            })}
                                          </div>
                                        </div>
                                        {call.callEndTime && (
                                          <div>
                                            <span className="font-medium text-gray-700">Ended:</span>
                                            <div className="text-gray-600">
                                              {new Date(call.callEndTime).toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit'
                                              })}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Call Details Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Call Status</div>
                                        <div className={`text-sm font-semibold ${call.picked === true ? 'text-green-600' :
                                          call.picked === false ? 'text-red-600' : 'text-gray-600'
                                          }`}>
                                          {call.picked === true ? '✓ Call Answered' :
                                            call.picked === false ? '✗ Not Answered' : '⏳ Call Attempted'}
                                        </div>
                                      </div>

                                      <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Duration</div>
                                        <div className="text-sm font-semibold text-gray-900">
                                          {call.duration > 0 ? (
                                            <>
                                              {Math.floor(call.duration / 60)}m {call.duration % 60}s
                                              <span className="text-xs text-gray-500 ml-1">({call.duration}s total)</span>
                                            </>
                                          ) : (
                                            <span className="text-gray-500">No duration</span>
                                          )}
                                        </div>
                                      </div>

                                      <div className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Outcome</div>
                                        <div>
                                          {call.outcome ? (
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${call.outcome === 'completed' ? 'bg-green-100 text-green-800' :
                                              call.outcome === 'failed' ? 'bg-red-100 text-red-800' :
                                                call.outcome === 'interested' ? 'bg-blue-100 text-blue-800' :
                                                  call.outcome === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                                    call.outcome === 'follow_up' ? 'bg-purple-100 text-purple-800' :
                                                      call.outcome === 'not_picked' ? 'bg-red-100 text-red-800' :
                                                        call.outcome === 'picked' ? 'bg-green-100 text-green-800' :
                                                          'bg-gray-100 text-gray-800'
                                              }`}>
                                              {call.outcome.replace('_', ' ').charAt(0).toUpperCase() + call.outcome.replace('_', ' ').slice(1)}
                                            </span>
                                          ) : (
                                            <span className="text-gray-500 text-sm">No outcome recorded</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Call Notes */}
                                    {call.notes ? (
                                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                                        <div className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-1">Call Notes</div>
                                        <div className="text-sm text-blue-900 leading-relaxed">
                                          {call.notes}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                                        <span className="text-xs text-gray-500 italic">No notes recorded for this call</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No calls made yet</p>
                      <p className="text-sm text-gray-400 mt-1">Call history will appear here after making calls</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Call Status */}
            {isCallActive && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-green-600" />
                  Call Status
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`flex items-center cursor-pointer p-4 border-2 rounded-xl transition-all ${callPicked === true
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                    }`}>
                    <input
                      type="radio"
                      name="callPicked"
                      checked={callPicked === true}
                      onChange={() => setCallPicked(true)}
                      className="sr-only"
                    />
                    <div className={`flex items-center w-full ${callPicked === true ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${callPicked === true ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                        <Phone className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-lg font-medium">Call Answered</span>
                        <p className={`text-sm ${callPicked === true ? 'text-green-700' : 'text-gray-500'}`}>
                          Customer picked up the call
                        </p>
                      </div>
                      {callPicked === true && (
                        <div className="ml-auto">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                      )}
                    </div>
                  </label>

                  <label className={`flex items-center cursor-pointer p-4 border-2 rounded-xl transition-all ${callPicked === false
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300'
                    }`}>
                    <input
                      type="radio"
                      name="callPicked"
                      checked={callPicked === false}
                      onChange={() => setCallPicked(false)}
                      className="sr-only"
                    />
                    <div className={`flex items-center w-full ${callPicked === false ? 'text-red-600' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${callPicked === false ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                        <PhoneOff className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-lg font-medium">No Answer</span>
                        <p className={`text-sm ${callPicked === false ? 'text-red-700' : 'text-gray-500'}`}>
                          Call was not answered
                        </p>
                      </div>
                      {callPicked === false && (
                        <div className="ml-auto">
                          <XCircle className="h-5 w-5 text-red-600" />
                        </div>
                      )}
                    </div>
                  </label>
                </div>

                {/* Status Selection Feedback */}
                {callPicked === true && (
                  <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-green-600 mr-3" />
                      <div>
                        <p className="font-medium text-green-800">Call answered successfully!</p>
                        <p className="text-sm text-green-700 mt-1">
                          Great! The customer picked up. You can now proceed with the conversation and update the lead status accordingly.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {callPicked === false && (
                  <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                    <div className="flex items-center">
                      <PhoneOff className="h-5 w-5 text-yellow-600 mr-3" />
                      <div>
                        <p className="font-medium text-yellow-800">Call not answered</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          This lead will be marked for follow-up. You can try calling again later or leave notes for the next attempt.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Service Details */}
            {(callPicked === true || !isCallActive) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ServiceIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Service Management
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                    <select
                      value={formData.selectedService}
                      onChange={(e) => handleChange('selectedService', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Service</option>
                      {services.filter(s => ['Credit Card', 'Insurance', 'Personal Loan', 'Home Loan', 'Business Loan', 'Health Insurance', 'Life Insurance'].includes(s.name)).map((service) => (
                        <option key={service.id} value={service.name}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="unassigned">Unassigned</option>
                      <option value="assigned">Assigned</option>
                      <option value="called">Called</option>
                      <option value="not_picked">Not Picked</option>
                      <option value="picked">Picked</option>
                      <option value="interested">Interested</option>
                      <option value="in_progress">In Progress</option>
                      <option value="applied">Applied</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                      <option value="follow_up">Follow Up</option>
                    </select>
                  </div>

                  {subcategories.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                      <select
                        value={formData.serviceSubcategory}
                        onChange={(e) => handleChange('serviceSubcategory', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Subcategory</option>
                        {subcategories.map((sub) => (
                          <option key={sub.name} value={sub.name}>
                            {sub.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {providers.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Service Provider</label>
                      <select
                        value={formData.serviceProvider}
                        onChange={(e) => handleChange('serviceProvider', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Provider</option>
                        {providers.map((provider) => (
                          <option key={provider.id} value={provider.id}>
                            {provider.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Provider Website */}
                {getSelectedProvider()?.website && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <ExternalLink className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-900">{getSelectedProvider().name}</h4>
                          <p className="text-sm text-blue-700">Visit official website to complete application</p>
                        </div>
                      </div>
                      <WebsiteLink
                        url={getSelectedProvider().website}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                        showIcon={false}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Website
                      </WebsiteLink>
                    </div>
                  </div>
                )}

                {/* Remarks */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks & Call Notes
                  </label>
                  <textarea
                    value={formData.remarks}
                    onChange={(e) => handleChange('remarks', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add customer feedback, conversation notes, follow-up requirements, or any other relevant information..."
                  />
                </div>

                {/* Save Button */}
                {!isCallActive && (
                  <div className="mt-6 flex justify-end">
                    <ActionButton
                      module="calling_employee"
                      action="update_status"
                      label="Submit"
                      icon={isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 disabled:opacity-50"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetails;