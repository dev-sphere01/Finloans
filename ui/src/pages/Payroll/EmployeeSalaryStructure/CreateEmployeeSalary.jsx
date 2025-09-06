import { useEffect, useState } from "react";
import API from "@/services/API";
import ErrorHandler from "@/services/ErrorHandler";

export default function AddEmployeeSalaryStructure() {
  const [form, setForm] = useState({
    department: "",
    position: "",
    basic: 0.0,
    hourly: 0.0,
    hra: 0.0,
    da: 0.0,
    otherAllowances: 0.0,
    pf: 0.0,
    professionalTax: 0.0,
    incomeTax: 0.0,
    otherDeduction: 0.0,
  });

  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [salaryInputType, setSalaryInputType] = useState(null);

  const [grossSalary, setGrossSalary] = useState(0);
  const [totalDeduction, setTotalDeduction] = useState(0);
  const [netSalary, setNetSalary] = useState(0);

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

  useEffect(() => {
    const hra = form.basic * 0.15;
    const da = form.basic * 0.15;
    const pf = form.basic * 0.12;
    const gross = form.basic + hra + da + form.otherAllowances;
    const totalDed = pf + form.professionalTax + form.incomeTax + form.otherDeduction;
    const net = gross - totalDed;

    setForm((prev) => ({
      ...prev,
      hra,
      da,
      pf,
    }));

    setGrossSalary(gross);
    setTotalDeduction(totalDed);
    setNetSalary(net);
  }, [
    form.basic,
    form.otherAllowances,
    form.professionalTax,
    form.incomeTax,
    form.otherDeduction,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericValue = parseFloat(value) || 0;

    setForm((prev) => {
      const updated = { ...prev, [name]: numericValue };

      if (name === "hourly") {
        updated.basic = numericValue > 0 ? numericValue * 200 : 0;
      } else if (name === "basic") {
        updated.hourly = numericValue > 0 ? numericValue / 200 : 0;
      }

      return updated;
    });
  };

  const handleSave = async () => {
    const selectedPosition = positions.find((p) => p.PositionName === form.position);


    const payload = {
      PositionID: selectedPosition.PositionID,
      BasicSalary: form.basic,
      HourlyRate: form.hourly,
      HRA: form.hra,
      DA: form.da,
      OtherAllowances: form.otherAllowances,
      GrossSalary: parseFloat(grossSalary.toFixed(2)),
      ProvidentFund: form.pf,
      ProfessionalTax: form.professionalTax,
      IncomeTax: form.incomeTax,
      OtherDeductions: form.otherDeduction,
      TotalDeductions: parseFloat(totalDeduction.toFixed(2)),
      NetSalary: parseFloat(netSalary.toFixed(2)),
    };

    const response = await ErrorHandler.handle(() =>
      API.post("/SalaryStructures", payload)
    );

    if (response?.status === 200 || response?.status === 201) {
      //  toast.success("Salary structure saved successfully!");
    } else {
      // toast.error("Failed to save salary structure.");
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

        {/* Salary Input Type */}
        <div>
          <label className="block text-gray-700 mb-1">Salary Input Type</label>
          <select
            className="w-full border p-2 rounded"
            value={salaryInputType || ""}
            onChange={(e) => {
              setSalaryInputType(e.target.value);
              setForm((prev) => ({ ...prev, basic: 0, hourly: 0 }));
            }}
          >
            <option value="" disabled>Select one</option>
            <option value="basic">Basic Salary</option>
            <option value="hourly">Hourly Rate</option>
          </select>
        </div>

        {/* Conditionally show salary input */}
        {salaryInputType === "basic" && (
          <div>
            <label className="block text-gray-700 mb-1">Basic Salary</label>
            <input
              type="number"
              name="basic"
              className="w-full border p-2 rounded"
              value={form.basic}
              onChange={handleChange}
            />
            <p className="text-xs text-gray-500">Hourly Rate: ₹{form.hourly.toFixed(2)}</p>
          </div>
        )}
        {salaryInputType === "hourly" && (
          <div>
            <label className="block text-gray-700 mb-1">Hourly Rate</label>
            <input
              type="number"
              name="hourly"
              className="w-full border p-2 rounded"
              value={form.hourly}
              onChange={handleChange}
            />
            <p className="text-xs text-gray-500">Basic Salary: ₹{form.basic.toFixed(2)}</p>
          </div>
        )}

        {/* Other Inputs */}
        <div>
          <label className="block text-gray-700 mb-1">Other Allowances</label>
          <input
            type="number"
            name="otherAllowances"
            className="w-full border p-2 rounded"
            value={form.otherAllowances}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Professional Tax</label>
          <input
            type="number"
            name="professionalTax"
            className="w-full border p-2 rounded"
            value={form.professionalTax}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Income Tax</label>
          <input
            type="number"
            name="incomeTax"
            className="w-full border p-2 rounded"
            value={form.incomeTax}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Other Deduction</label>
          <input
            type="number"
            name="otherDeduction"
            className="w-full border p-2 rounded"
            value={form.otherDeduction}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Salary Summary */}
      <div className="bg-gray-100 p-4 rounded mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><strong>HRA:</strong> ₹{form.hra.toFixed(2)}</div>
          <div><strong>DA:</strong> ₹{form.da.toFixed(2)}</div>
          <div><strong>PF:</strong> ₹{form.pf.toFixed(2)}</div>
          <div><strong>Gross Salary:</strong> ₹{grossSalary.toFixed(2)}</div>
          <div><strong>Total Deduction:</strong> ₹{totalDeduction.toFixed(2)}</div>
          <div><strong>Net Salary:</strong> ₹{netSalary.toFixed(2)}</div>
        </div>
      </div>
    
        <button
          className={`px-6 py-2 rounded transition ${!form.department || !form.position || !salaryInputType
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          disabled={!form.department || !form.position || !salaryInputType}
          onClick={handleSave}
        >
          Save
        </button>
    </div>

  );
}
