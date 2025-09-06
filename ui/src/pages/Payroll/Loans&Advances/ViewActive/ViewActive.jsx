import getLoan from "@/services/LoansAdvances/GetLoans";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { FaEdit, FaMoneyBillWave, FaCogs } from "react-icons/fa";
import { Link } from "react-router-dom";
import { API, notification, TableService } from "@/services";
import useAuthStore from "@/store/authStore";
import { Description } from "@headlessui/react";

const LoanAdminDashboard = () => {
  const tableRef = useRef();
  const [repaymentConfig, setRepaymentConfig] = useState({
    emi: "",
    startDate: "",
    installments: "",
    interest: "",
  });
  const [loans, setAllLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    getEmployeeRequest();
  }, [pagination.pageIndex, pagination.pageSize, globalFilter]);

  const getEmployeeRequest = async () => {
    setLoading(true);

    try {
      const getAllLoan = await getLoan.getAllLoan(
        globalFilter || "",
        pagination.pageIndex + 1, // API expects 1-based page numbers
        pagination.pageSize,
        null, // obStatus
        null // isActive
      );

      if (Array.isArray(getAllLoan)) {
        // Map API data to table format
        const loans = getAllLoan.map((ss) => ({
          LnAID: ss.LnAID,
          EmpID: ss.EmpID,
          Description: ss.Description,
          Employee: ss.EmployeeName, // Format as ss001, ss002, etc.
          Amount: ss.LoanAmount,
          Outstanding: ss.ClosingBalance,
          Period: ss.Period,
          MonthlyInstallment: ss.MonthlyInstallment,
          StartDate: ss.StartDate,
          Status: ss.IsApproved ? "Approved" : "Not Approved",
        }));
        // console.log(loans);
        setAllLoans(loans);

        // Set pagination info from API response
        setTotalItems(
          getAllLoan.TotalRecords || getAllLoan.Total || loans.length
        );
        setTotalPages(
          getAllLoan.TotalPages ||
          Math.ceil(
            (getAllLoan.TotalRecords || getAllLoan.Total || loans.length) /
            pagination.pageSize
          )
        );
        setCurrentPage(pagination.pageIndex + 1);

        // console.log("Pagination info:", {
        //   totalItems: getAllLoan.TotalRecords || getAllLoan.Total,
        //   totalPages: getAllLoan.TotalPages,
        //   currentPage: pagination.pageIndex + 1,
        // });
      } else {
        setAllLoans([]);
        setTotalItems(0);
        setTotalPages(0);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setAllLoans([]);
      setTotalItems(0);
      setTotalPages(0);
      setCurrentPage(1);
    }
    setLoading(false);
  };
  const handlePaginationChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Handle global filter changes with debouncing
  const handleGlobalFilterChange = (value) => {
    setGlobalFilter(value);
    // Reset to first page when searching
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };
  const columns = useMemo(
    () => [
      {
        accessorKey: "Employee",
        header: "Employee",
        enableSorting: true,
        enableColumnFilter: true,
        cell: ({ row }) => (
          <button
            onClick={() => {
              setSelectedEmployee(row.original);
              setRepaymentConfig({
                emi: row.original.MonthlyInstallment || "",
                startDate: row.original.StartDate || "",
              });
            }}
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
          >
            {row.original.Employee}
          </button>
        ),
        size: 180,
      },
      {
        accessorKey: "Amount",
        header: "Amount",
        enableSorting: true,
        enableColumnFilter: true,

        size: 200,
      },
      {
        accessorKey: "Outstanding",
        header: "Outstanding",
        enableSorting: true,
        enableColumnFilter: true,
        size: 120,
      },
      {
        accessorKey: "Period",
        header: "Period",
        enableSorting: true,
        enableColumnFilter: true,
        size: 120,
      },
      {
        accessorKey: "MonthlyInstallment",
        header: "MonthlyInstallment",
        enableSorting: true,
        enableColumnFilter: true,
        size: 120,
      },
      {
        accessorKey: "StartDate",
        header: "StartDate",
        enableSorting: true,
        enableColumnFilter: true,
        size: 120,
      },
      {
        accessorKey: "Status",
        header: "Status",
        enableSorting: true,
        enableColumnFilter: true,
        cell: ({ row }) => {
          const {
            LnAID,
            EmpID,
            Amount,
            Period,
            InterestRate,
            MonthlyInstallment,
            StartDate,
            Description,
          } = row.original;

          const [isApproved, setIsApproved] = React.useState(
            row.original.Status === "Approved"
          );
          const [loadingApprove, setLoadingApprove] = React.useState(false);
          const [loadingReject, setLoadingReject] = React.useState(false);

          const updateApproval = async (approve) => {
            approve ? setLoadingApprove(true) : setLoadingReject(true);
            try {
              const approverEmpId = user?.empId || user?.EmpID || 0;
              if (approve) {
                await API.put(`LnAs/ApproveLoan/${LnAID}/${approverEmpId}`);
                setIsApproved(approve);
                notification().success(
                  `Loan ${approve ? "approved" : "rejected"} successfully!`
                );
                // Refresh table data to reflect latest state
                getEmployeeRequest && getEmployeeRequest();
              } else {
                await API.put(
                  `/LnAs/RejectLoan?lnaId=${LnAID}&empId=${user?.empId}`
                );
                notification().success(`Loan rejected successfully!`);
                getEmployeeRequest && getEmployeeRequest();
              }

              // Backend uses: [HttpPut("ApproveLoan/{empID}")] ApproveLoan(int id, int empID, bool isApproved)
            } catch (err) {
              console.error(
                `Failed to ${approve ? "approve" : "reject"} loan:`,
                err
              );
              notification().error(
                `Error while ${approve ? "approving" : "rejecting"} loan.`
              );
            } finally {
              approve ? setLoadingApprove(false) : setLoadingReject(false);
            }
          };

          return (
            <div className="flex items-center gap-3">
              <div
                className={`text-sm font-medium ${isApproved ? "text-green-700" : "text-gray-600"
                  }`}
              >
                {isApproved ? "Approved" : "Not Approved"}
              </div>
              {!isApproved && <>
                <button
                  onClick={() => updateApproval(true)}
                  disabled={isApproved || loadingApprove}
                  className={`px-2 py-1 rounded text-white text-xs ${isApproved
                    ? "bg-green-300 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                    }`}
                  title="Approve"
                >
                  Approve
                </button>
                <button
                  onClick={() => updateApproval(false)}
                  disabled={loadingReject}
                  className={`px-2 py-1 rounded text-white text-xs ${"bg-red-600 hover:bg-red-700"}`}
                  title="Reject"
                >
                  Reject
                </button>
              </>}

            </div>
          );
        },
        size: 180,
      },
    ],
    []
  );

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    let updatedConfig = { ...repaymentConfig, [name]: value };

    if (name === "emi" && selectedEmployee?.Amount) {
      const emiValue = parseFloat(value);
      const loanAmount = parseFloat(selectedEmployee.Amount);

      if (!isNaN(emiValue) && emiValue > 0) {
        updatedConfig.installments = Math.ceil(loanAmount / emiValue);
      } else {
        updatedConfig.installments = "";
      }
    }

    setRepaymentConfig(updatedConfig);
  };

  // const handleSaveRepaymentSettings = async () => {
  //   if (!selectedEmployee)
  //     return notification().warning("Select an employee first");

  //   try {
  //     await API.put(`/LnAs/${selectedEmployee.LnAID}`, {
  //       LnAID: selectedEmployee.LnAID,
  //       EmpID: selectedEmployee.EmpID || 0, // Add EmpID to your data fetch if missing
  //       LoanAmount: selectedEmployee.Amount || 0,
  //       Period: Number(repaymentConfig.installments),
  //       InterestRate: Number(repaymentConfig.interest) || 0,
  //       MonthlyInstallment: Number(repaymentConfig.emi),
  //       StartDate: repaymentConfig.startDate,
  //       IsApproved: selectedEmployee.Status === "Approved",
  //       Description: selectedEmployee.Description || "", // optional field
  //     });

  //     notification().success("Repayment settings updated successfully!");
  //     getEmployeeRequest();
  //   } catch (error) {
  //     console.error("Failed to update repayment settings:", error);
  //     notification().error("Failed to update repayment settings.");
  //   }
  // };

  return (
    <div className="mt-5">
      {/* Section 1: Active Loans Tracker */}
      <div className="bg-white p-6 rounded shadow-lg mb-10">
        <div className="flex items-center gap-2 mb-4">
          <FaMoneyBillWave className="text-green-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            Active Loans & Advances
          </h2>
        </div>
        <div className="">
          <TableService
            columns={columns}
            data={loans}
            initialPageSize={5}
            serverPagination={true}
            pageCount={totalPages}
            totalItems={totalItems}
            totalPages={totalPages}
            currentPage={currentPage}
            onPaginationChange={handlePaginationChange}
            loading={loading}
            globalFilter={globalFilter}
            onGlobalFilterChange={handleGlobalFilterChange}
          />
        </div>
      </div>

      {/* Section 2: Repayment Configurator */}
      {/* <div className="bg-white p-6 rounded shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <FaCogs className="text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            Configure Repayment Schedule
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="block">
            <span className="text-gray-700">EMI Amount</span>
            <input
              type="number"
              name="emi"
              value={repaymentConfig.emi}
              onChange={handleConfigChange}
              className="mt-1 block w-full border rounded px-3 py-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter fixed EMI amount"
            />
            <p className="text-xs text-gray-500">
              Period: {repaymentConfig.installments}
            </p>
          </label>
          <label className="block">
            <span className="text-gray-700">Start Date</span>
            <input
              type="date"
              name="startDate"
              value={repaymentConfig.startDate}
              onChange={handleConfigChange}
              className="mt-1 block w-full border rounded px-3 py-2 focus:ring-blue-500 focus:outline-none"
            />
          </label>
        </div>
        <button
          className="mt-6 bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
          onClick={handleSaveRepaymentSettings}
        >
          Save Repayment Settings
        </button>
      </div> */}
    </div>
  );
}

export default LoanAdminDashboard;
