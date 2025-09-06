// src/services/getEmptyFieldsByEmpID.js
import API from "@/services/API";

/**
 * Fetches empty or missing fields for a given employee by ID.
 *
 * @param {number|string} empId - The ID of the employee.
 * @returns {Promise<Object>} Object containing missing fields grouped by sections:
 *   - Employee: string[]
 *   - EmpBankDetails: string[]
 *   - Academics: string[]
 *   - ProfessionalHistory: string[]
 *   - Documents: {
 *       TotalRequired: number,
 *       TotalSubmitted: number,
 *       MissingCount: number,
 *       Details: Array<{
 *         DocumentName: string,
 *         Status: string,
 *         Fields: string[]
 *       }>
 *     }
 *
 * @throws {Error} Throws an error if the fetch fails or if the response format is invalid.
 */
const pendingFields = async (empId) => {
  try {
    const response = await API.get(`/Employees/GetEmptyFieldsByEmpID/${empId}`);

    if (!response.data || typeof response.data !== "object") {
      throw new Error("Invalid response format: Expected an object");
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching empty fields by EmpID:", error);

    if (error.response) {
      const statusCode = error.response.status;
      const errorMessage =
        error.response.data?.message ||
        error.response.data ||
        "Unknown server error";
      throw new Error(`Server error (${statusCode}): ${errorMessage}`);
    } else if (error.request) {
      throw new Error("Network error: Unable to connect to server");
    } else {
      throw new Error(error.message || "An unexpected error occurred");
    }
  }
};

export default pendingFields;
