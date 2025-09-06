import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Employees from '@/services/Employees/employees';

const useEmpDataStore = create(
  persist(
    (set, get) => ({
      // Employee data state
      currentEmployee: null,
      loading: false,
      error: null,

      // Actions
      setCurrentEmployee: (employee) => set({ currentEmployee: employee }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),

      // Fetch employee data by ID
      fetchEmployeeById: async (empId) => {
        if (!empId) {
          set({ error: 'Employee ID is required' });
          return null;
        }

        set({ loading: true, error: null });
        
        try {
          const employeeData = await Employees.getEmployeeById(empId);
          
          if (employeeData) {
            set({ 
              currentEmployee: employeeData, 
              loading: false, 
              error: null 
            });
            return employeeData;
          } else {
            set({ 
              currentEmployee: null, 
              loading: false, 
              error: 'Employee not found' 
            });
            return null;
          }
        } catch (error) {
          console.error('Error fetching employee data:', error);
          set({ 
            currentEmployee: null, 
            loading: false, 
            error: error.message || 'Failed to fetch employee data' 
          });
          return null;
        }
      },

      // Force refresh employee data by ID (always fetches fresh data)
      refreshEmployeeById: async (empId) => {
        if (!empId) {
          set({ error: 'Employee ID is required' });
          return null;
        }

        // Completely clear current data and persisted storage
        get().clearEmployeeDataCompletely();
        set({ loading: true, error: null });
        
        // Small delay to ensure storage is cleared
        await new Promise(resolve => setTimeout(resolve, 200));
        
        try {
          const employeeData = await Employees.getEmployeeById(empId, true); // Force refresh with cache busting
          
          if (employeeData) {
            // Add a timestamp to ensure the data is fresh
            const freshEmployeeData = {
              ...employeeData,
              _lastUpdated: Date.now()
            };
            
            set({ 
              currentEmployee: freshEmployeeData, 
              loading: false, 
              error: null 
            });
            return freshEmployeeData;
          } else {
            set({ 
              currentEmployee: null, 
              loading: false, 
              error: 'Employee not found' 
            });
            return null;
          }
        } catch (error) {
          console.error('Error refreshing employee data:', error);
          set({ 
            currentEmployee: null, 
            loading: false, 
            error: error.message || 'Failed to refresh employee data' 
          });
          return null;
        }
      },

      // Get employee full name
      getEmployeeFullName: () => {
        const { currentEmployee } = get();
        if (!currentEmployee) return null;
        
        const firstName = currentEmployee.FirstName || '';
        const lastName = currentEmployee.LastName || '';
        return `${firstName} ${lastName}`.trim();
      },

      // Get employee display name (for UI)
      getEmployeeDisplayName: () => {
        const fullName = get().getEmployeeFullName();
        return fullName || 'Employee';
      },

      // Clear employee data
      clearEmployeeData: () => set({ 
        currentEmployee: null, 
        loading: false, 
        error: null 
      }),

      // Clear employee data and persisted storage
      clearEmployeeDataCompletely: () => {
        // Clear the state
        set({ 
          currentEmployee: null, 
          loading: false, 
          error: null 
        });
        // Clear the persisted storage
        localStorage.removeItem('emp-data-storage');
        // Also clear any potential cached versions
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.includes('emp-data') || key.includes('employee')) {
            localStorage.removeItem(key);
          }
        });
      },

      // Update employee data (for when employee updates their profile)
      updateCurrentEmployee: (updatedData) => set((state) => ({
        currentEmployee: state.currentEmployee ? {
          ...state.currentEmployee,
          ...updatedData
        } : null
      })),

      // Force complete refresh with storage clearing and re-fetch
      forceCompleteRefresh: async (empId) => {
        if (!empId) {
          set({ error: 'Employee ID is required' });
          return null;
        }

        console.log('Starting complete refresh...');
        
        // Step 1: Clear everything
        get().clearEmployeeDataCompletely();
        
        // Step 2: Reset state completely
        set({ 
          currentEmployee: null, 
          loading: true, 
          error: null 
        });
        
        // Step 3: Wait for clearing to complete
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Step 4: Fetch fresh data with cache busting
        try {
          console.log('Fetching fresh employee data...');
          const employeeData = await Employees.getEmployeeById(empId, true);
          
          if (employeeData) {
            const freshData = {
              ...employeeData,
              _refreshed: Date.now(),
              _version: Math.random().toString(36).substr(2, 9)
            };
            
            console.log('Setting fresh employee data:', freshData);
            set({ 
              currentEmployee: freshData, 
              loading: false, 
              error: null 
            });
            
            return freshData;
          } else {
            set({ 
              currentEmployee: null, 
              loading: false, 
              error: 'Employee not found' 
            });
            return null;
          }
        } catch (error) {
          console.error('Error in complete refresh:', error);
          set({ 
            currentEmployee: null, 
            loading: false, 
            error: error.message || 'Failed to refresh employee data' 
          });
          return null;
        }
      }
    }),
    {
      name: 'emp-data-storage', // unique name for localStorage
      partialize: (state) => ({ 
        currentEmployee: state.currentEmployee,
        version: Date.now() // Add version to force refresh when needed
      }), // only persist currentEmployee data with version
      version: 1, // Increment this to force clear old data
    }
  )
);

export default useEmpDataStore;