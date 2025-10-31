import API from './API';

const callingService = {
  // Lead management
  getLeads: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      const response = await API.get(`/calling/leads?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
  },

  getLeadById: async (leadId) => {
    try {
      const response = await API.get(`/calling/leads/${leadId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lead:', error);
      throw error;
    }
  },

  createLead: async (leadData) => {
    try {
      const response = await API.post('/calling/leads', leadData);
      return response.data;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  },

  updateLead: async (leadId, leadData) => {
    try {
      const response = await API.put(`/calling/leads/${leadId}`, leadData);
      return response.data;
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  },

  deleteLead: async (leadId) => {
    try {
      const response = await API.delete(`/calling/leads/${leadId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  },

  // Bulk operations
  bulkImportLeads: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await API.post('/calling/leads/bulk-import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error importing leads:', error);
      throw error;
    }
  },

  bulkCreateLeads: async (leadsData) => {
    try {
      // For large datasets, split into chunks to avoid request size limits
      const CHUNK_SIZE = 1000; // Process 1000 leads at a time
      
      if (leadsData.length <= CHUNK_SIZE) {
        // Small dataset, send all at once
        const response = await API.post('/calling/leads/bulk-create', {
          leads: leadsData
        });
        return response.data;
      }

      // Large dataset, process in chunks
      console.log(`Processing ${leadsData.length} leads in chunks of ${CHUNK_SIZE}`);
      
      const totalChunks = Math.ceil(leadsData.length / CHUNK_SIZE);
      const combinedResults = {
        total: leadsData.length,
        success: 0,
        failed: 0,
        errors: []
      };

      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, leadsData.length);
        const chunk = leadsData.slice(start, end);

        console.log(`Processing chunk ${i + 1}/${totalChunks} (${chunk.length} leads)`);

        try {
          const response = await API.post('/calling/leads/bulk-create', {
            leads: chunk
          });

          const chunkResults = response.data.results;
          combinedResults.success += chunkResults.success;
          combinedResults.failed += chunkResults.failed;
          
          // Adjust row numbers for errors to reflect original positions
          if (chunkResults.errors) {
            chunkResults.errors.forEach(error => {
              combinedResults.errors.push({
                ...error,
                row: error.row + start // Adjust row number to original position
              });
            });
          }

        } catch (chunkError) {
          console.error(`Error processing chunk ${i + 1}:`, chunkError);
          
          // Mark all leads in this chunk as failed
          combinedResults.failed += chunk.length;
          chunk.forEach((_, index) => {
            combinedResults.errors.push({
              row: start + index + 1,
              error: chunkError.response?.data?.error || chunkError.message || 'Network error'
            });
          });
        }
      }

      return {
        message: 'Bulk create completed',
        results: combinedResults
      };

    } catch (error) {
      console.error('Error bulk creating leads:', error);
      throw error;
    }
  },

  assignLeads: async (leadIds, staffId) => {
    try {
      const response = await API.post('/calling/leads/assign', {
        leadIds,
        staffId
      });
      return response.data;
    } catch (error) {
      console.error('Error assigning leads:', error);
      throw error;
    }
  },

  // Call management
  startCall: async (leadId) => {
    try {
      const response = await API.post(`/calling/leads/${leadId}/start-call`);
      return response.data;
    } catch (error) {
      console.error('Error starting call:', error);
      throw error;
    }
  },

  endCall: async (leadId, callData) => {
    try {
      const response = await API.post(`/calling/leads/${leadId}/end-call`, callData);
      return response.data;
    } catch (error) {
      console.error('Error ending call:', error);
      throw error;
    }
  },

  updateCallStatus: async (leadId, statusData) => {
    try {
      const response = await API.put(`/calling/leads/${leadId}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error('Error updating call status:', error);
      throw error;
    }
  },

  // Master data
  getServices: async () => {
    try {
      const response = await API.get('/calling/services');
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  },

  getServiceSubcategories: async (serviceId) => {
    try {
      const response = await API.get(`/calling/services/${serviceId}/subcategories`);
      return response.data;
    } catch (error) {
      console.error('Error fetching service subcategories:', error);
      throw error;
    }
  },

  getServiceProviders: async (serviceId) => {
    try {
      const response = await API.get(`/calling/service-providers?serviceId=${serviceId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching service providers:', error);
      throw error;
    }
  },

  getStaff: async () => {
    try {
      const response = await API.get('/calling/staff');
      return response.data;
    } catch (error) {
      console.error('Error fetching staff:', error);
      throw error;
    }
  },

  // Get available status transitions for a lead
  getLeadStatusTransitions: async (leadId) => {
    try {
      const response = await API.get(`/calling/leads/${leadId}/status-transitions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching status transitions:', error);
      throw error;
    }
  },

  // Get call history for a lead
  getLeadCallHistory: async (leadId) => {
    try {
      const response = await API.get(`/calling/leads/${leadId}/call-history`);
      return response.data;
    } catch (error) {
      console.error('Error fetching call history:', error);
      throw error;
    }
  },

  // Get calling stats for current user
  getMyStats: async () => {
    try {
      const response = await API.get('/calling/my-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching calling stats:', error);
      throw error;
    }
  },

  // Reports and analytics
  getCallReports: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      const response = await API.get(`/calling/reports?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching call reports:', error);
      throw error;
    }
  }
};

export default callingService;