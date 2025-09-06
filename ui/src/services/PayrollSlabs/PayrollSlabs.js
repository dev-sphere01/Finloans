import API from '@/services/API';

// Get all payroll slabs
const getAllSlabs = async () => {
    try {
        const response = await API.get('/PayrollSlabs');
        // console.log("data", response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching slabs:', error);
        return null;
    }
};

// Get a single payroll slab by id //not used
// const getSlabById = async (id) => {
//     try {
//         const response = await API.get(`/PayrollSlabs/${id}`);
//         return response.data;
//     } catch (error) {
//         console.error('Error fetching slab by id:', error);
//         return null;
//     }
// };

// Create a new payroll slab
const createSlab = async (slabData) => {
    /*Payload body
    {
        "MinHours": 0,
        "MaxHours": 0,
        "Multiplier": 0,
        "IsFlatBasic": true,
        "IsPenalty": true,
        "Description": "string"
    }
    */
    try {
        const response = await API.post('/PayrollSlabs', slabData);
        return response.data;
    } catch (error) {
        console.error('Error creating slab:', error);
        return null;
    }
};

// Update a payroll slab
const updateSlab = async (id, slabData) => {
    try {
        const response = await API.put(`/PayrollSlabs/${id}`, slabData);

        // API returns 204 No Content on successful update
        if (response.status === 204 || response.status === 200) {
            return { success: true, message: 'Slab updated successfully' };
        }

        return response.data;
    } catch (error) {
        console.error('Error updating slab:', error);
        return null;
    }
};

// Delete a payroll slab
const deleteSlab = async (id) => {
    try {
        const response = await API.delete(`/PayrollSlabs/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting slab:', error);
        return null;
    }
};

const PayrollSlabsServices = {
    getAllSlabs,
    createSlab,
    updateSlab,
    deleteSlab,
};

export default PayrollSlabsServices;
