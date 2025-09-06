import { useEffect, useState } from "react";
import API from "@/services/API";
import ErrorHandler from "@/services/ErrorHandler";
import { notification } from "@/services";

export default function AddSalaryStructure() {
  const initialFormState = {
    department: "",
    position: "",
    maxctc: "",
    minctc: "",
  };
  const [form, setForm] = useState(initialFormState);

  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      const response = await ErrorHandler.handle(() => API.get('/Departments'));
      if (response?.data) {
        setDepartments(response.data);
      }
    };

    fetchDepartments();
  }, []);

  const fetchPositionsByDepartment = async (deptId) => {
    const response = await ErrorHandler.handle(() =>
      API.get(`/Positions/ByDepartment/${deptId}`)
    );
    if (response?.data) {
      setPositions(response.data);
    }
  };


  const handleSave = async () => {
    const min = parseFloat(form.minctc);
    const max = parseFloat(form.maxctc);

    if (isNaN(min) || isNaN(max)) {
      notification().error("CTC values must be numbers.");
      return;
    }

    if (max < min) {
      notification().error("Max CTC cannot be less than Min CTC.");
      return;
    }
    const selectedPosition = positions.find((p) => p.PositionName === form.position);

    try {
      const payload = {
        PositionID: selectedPosition.PositionID,
        MaxCTC: max,
        MinCTC: min,
        AverageCTC: (max + min) / 2
      };
      const response = await ErrorHandler.handle(() =>
        API.post("/SalaryStructures", payload)
      );
      if (response?.status === 200 || response?.status === 201) {
        notification().success("Salary structure saved successfully!");
      } else {
        notification().error("Failed to save salary structure.");
      }
      notification().success(successmessage)
      setForm(initialFormState)
    }
    catch (error) {
      console.error('Error adding salary structure:', error);
      notification().error(error.message || 'Failed to add salary structure. Please try again.');
    }

  };


  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Salary Structure</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Department Dropdown */}
        <div>
          <label className="block text-gray-700 mb-1">Department</label>
          <select
            name="department"
            className="w-full border p-2 rounded"
            value={form.department}
            onChange={(e) => {
              const deptId = parseInt(e.target.value);
              setForm((prev) => ({ ...prev, department: deptId, position: "" }));
              fetchPositionsByDepartment(deptId);
            }}
          >
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d.DeptID} value={d.DeptID}>
                {d.DeptName}
              </option>
            ))}
          </select>
        </div>

        {/* Position Dropdown */}
        <div>
          <label className="block text-gray-700 mb-1">Position</label>
          <select
            name="position"
            className="w-full border p-2 rounded"
            disabled={!form.department}
            value={form.position}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, position: e.target.value }))
            }
          >
            <option value="">Select Position</option>
            {positions.map((p) => (
              <option key={p.PositionID} value={p.PositionName}>
                {p.PositionName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Min CTC</label>
          <input
            name="minctc"
            type="number"
            className="w-full border p-2 rounded"
            onChange={(e) =>
              setForm((prev) => ({ ...prev, minctc: e.target.value }))
            }
          >

          </input>
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Max CTC</label>
          <input
            name="maxctc"
            type="number"
            className="w-full border p-2 rounded"
            onChange={(e) =>
              setForm((prev) => ({ ...prev, maxctc: e.target.value }))
            }
          >
          </input>
        </div>
      </div>

      <button
        className={`px-6 py-2 rounded transition ${!form.department || !form.position
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        disabled={!form.department || !form.position || !form.maxctc || !form.maxctc}
        onClick={handleSave}
      >
        Save
      </button>
    </div>

  );
}
