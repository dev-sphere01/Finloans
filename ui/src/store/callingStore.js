import { create } from 'zustand';

const useCallingStore = create((set, get) => ({
  // Lead data state
  leads: [],
  currentLead: null,
  isLoading: false,
  
  // Calling session state
  isCallSessionActive: false,
  sessionData: null,
  hasUnsavedChanges: false,
  
  // Filter and pagination state
  filters: {
    status: 'all', // all, assigned, unassigned, pending, completed
    assignedTo: '',
    service: '',
    dateRange: null
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0
  },
  
  // Services and staff data
  services: [],
  serviceProviders: [],
  staff: [],
  
  // Actions for leads management
  setLeads: (leads) => set({ leads }),
  
  addLead: (lead) => set((state) => ({
    leads: [lead, ...state.leads]
  })),
  
  updateLead: (leadId, updates) => set((state) => ({
    leads: state.leads.map(lead => 
      lead.id === leadId ? { ...lead, ...updates } : lead
    ),
    currentLead: state.currentLead?.id === leadId 
      ? { ...state.currentLead, ...updates } 
      : state.currentLead
  })),
  
  deleteLead: (leadId) => set((state) => ({
    leads: state.leads.filter(lead => lead.id !== leadId)
  })),
  
  // Bulk operations
  assignLeadsToStaff: (leadIds, staffId) => set((state) => ({
    leads: state.leads.map(lead => 
      leadIds.includes(lead.id) 
        ? { ...lead, assignedTo: staffId, status: 'assigned' }
        : lead
    )
  })),
  
  // Current lead management
  setCurrentLead: (lead) => set({ currentLead: lead }),
  
  // Calling session management
  startCallSession: (leadId) => {
    const state = get();
    const lead = state.leads.find(l => l.id === leadId) || state.currentLead;
    
    if (!lead) return;
    
    // Store session data in both Zustand and sessionStorage
    const sessionData = {
      leadId,
      startTime: new Date().toISOString(),
      originalData: { ...lead },
      currentData: { ...lead }
    };
    
    sessionStorage.setItem('callingSession', JSON.stringify(sessionData));
    
    set({
      isCallSessionActive: true,
      sessionData,
      hasUnsavedChanges: false
    });
    
    // Add beforeunload listener to prevent accidental tab closure
    window.addEventListener('beforeunload', get().handleBeforeUnload);
  },
  
  updateSessionData: (updates) => {
    const state = get();
    if (!state.isCallSessionActive || !state.sessionData) return;
    
    const updatedSessionData = {
      ...state.sessionData,
      currentData: { ...state.sessionData.currentData, ...updates }
    };
    
    sessionStorage.setItem('callingSession', JSON.stringify(updatedSessionData));
    
    set({
      sessionData: updatedSessionData,
      hasUnsavedChanges: true
    });
  },
  
  endCallSession: (saveChanges = true) => {
    const state = get();
    if (!state.isCallSessionActive || !state.sessionData) return;
    
    if (saveChanges && state.hasUnsavedChanges) {
      // Update the lead with session data
      get().updateLead(state.sessionData.leadId, state.sessionData.currentData);
    }
    
    // Clean up
    sessionStorage.removeItem('callingSession');
    window.removeEventListener('beforeunload', get().handleBeforeUnload);
    
    set({
      isCallSessionActive: false,
      sessionData: null,
      hasUnsavedChanges: false
    });
  },
  
  // Restore session from sessionStorage (on page reload)
  restoreSession: () => {
    const sessionData = sessionStorage.getItem('callingSession');
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        set({
          isCallSessionActive: true,
          sessionData: parsed,
          hasUnsavedChanges: true
        });
        window.addEventListener('beforeunload', get().handleBeforeUnload);
      } catch (error) {
        console.error('Error restoring calling session:', error);
        sessionStorage.removeItem('callingSession');
      }
    }
  },
  
  // Handle beforeunload event
  handleBeforeUnload: (event) => {
    const state = get();
    if (state.isCallSessionActive && state.hasUnsavedChanges) {
      event.preventDefault();
      event.returnValue = 'You have unsaved changes in your calling session. Are you sure you want to leave?';
      return event.returnValue;
    }
  },
  
  // Filters and pagination
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  
  setPagination: (pagination) => set((state) => ({
    pagination: { ...state.pagination, ...pagination }
  })),
  
  // Master data
  setServices: (services) => set({ services }),
  setServiceProviders: (serviceProviders) => set({ serviceProviders }),
  setStaff: (staff) => set({ staff }),
  
  // Loading state
  setLoading: (isLoading) => set({ isLoading }),
  
  // Reset store
  reset: () => set({
    leads: [],
    currentLead: null,
    isLoading: false,
    isCallSessionActive: false,
    sessionData: null,
    hasUnsavedChanges: false,
    filters: {
      status: 'all',
      assignedTo: '',
      service: '',
      dateRange: null
    },
    pagination: {
      page: 1,
      limit: 10,
      total: 0
    }
  })
}));

export default useCallingStore;