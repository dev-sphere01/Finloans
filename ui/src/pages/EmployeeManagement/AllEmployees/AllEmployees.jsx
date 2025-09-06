import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { EmployeeSearch, notification, TableService, ConfirmationService } from '@/services';

const AllEmployees = () => {
  const tableRef = useRef();
  
  // Data and loading states
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Server pagination state
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all employees based on current table state
  const fetchAllEmployees = useCallback(async () => {
    if (!tableRef.current) return;
    
    setLoading(true);
    
    // Get current table state from TableService
    const tableState = tableRef.current.getTableState();
    console.log('Table state:', tableState);
    
    const {
      pagination,
      sorting,
      columnFilters,
      globalFilter
    } = tableState;

    try {
      const employees = await EmployeeSearch.getAllEmployees(
        globalFilter || "",
        pagination.pageIndex + 1, // API expects 1-based page numbers
        pagination.pageSize,
        true, // obStatus
        true, // isActive
        columnFilters // Pass column filters to the service
      );

      if (employees && employees.Data) {
        // Map API data to table format
        const mappedEmployees = employees.Data.map(emp => ({
          id: emp.EmpID,
          empID: `EMP${emp.EmpID.toString().padStart(3, '0')}`, // Format as EMP001, EMP002, etc.
          firstName: emp.FirstName,
          lastName: emp.LastName,
          email: emp.WorkEmail || emp.PersonalEmail,
          status: emp.IsActive ? 'Active' : 'Inactive',
          joinDate: emp.DateOfJoining,
          phoneNumber: emp.PhoneNumber,
          address: emp.Address,
          emergencyContact: emp.EmergencyContact,
          emergencyContactNumber: emp.EmergencyContactNumber,
          dateOfBirth: emp.DateOfBirth,
          gender: emp.Gender,
          profilePicture: emp.ProfilePicture,
          obStatus: emp.OBStatus
        }));

        setAllEmployees(mappedEmployees);

        // Set pagination info from API response
        const totalRecords = employees.TotalRecords || employees.Total || mappedEmployees.length;
        const calculatedTotalPages = employees.TotalPages || Math.ceil(totalRecords / pagination.pageSize);
        
        setTotalItems(totalRecords);
        setTotalPages(calculatedTotalPages);
        setCurrentPage(pagination.pageIndex + 1);

        console.log('Mapped employees:', mappedEmployees);
        console.log('Pagination info:', {
          totalItems: totalRecords,
          totalPages: calculatedTotalPages,
          currentPage: pagination.pageIndex + 1
        });
      } else {
        setAllEmployees([]);
        setTotalItems(0);
        setTotalPages(0);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      notification.error('Failed to fetch employees');
      setAllEmployees([]);
      setTotalItems(0);
      setTotalPages(0);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    // Small delay to ensure tableRef is available
    const timer = setTimeout(() => {
      fetchAllEmployees();
    },
    {
      accessorKey: 'name',
      header: 'Full Name',
      enableSorting: false, // Disable sorting for combined name
      enableColumnFilter: false, // Disable filtering for combined name
      cell: ({ row }) => (
        <Link
          to={`/dashboard/all-employees/${row.original.id}`}
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
        >
          {row.original.name}
        </Link>
      ),
      size: 200,
    }, 100);
    
    return () => clearTimeout(timer);
  }, [fetchAllEmployees]);

  // Enhanced table columns configuration with all features enabled
  const columns = useMemo(() => [
    {
      accessorKey: 'empID',
      header: 'Employee ID',
      enableSorting: true,
      enableColumnFilter: true,
      size: 120,
    },
    {
      accessorKey: 'firstName',
      header: 'First Name',
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ row }) => (
        <Link
          to={`/dashboard/all-employees/${row.original.id}`}
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
        >
          {row.original.firstName}
        </Link>
      ),
      size: 180,
    },
    {
      accessorKey: 'lastName',
      header: 'Last Name',
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ row }) => (
        <Link
          to={`/dashboard/all-employees/${row.original.id}`}
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
        >
          {row.original.lastName}
        </Link>
      ),
      size: 180,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ row }) => (
        <a
          href={`mailto:${row.original.email}`}
          className="text-gray-700 hover:text-blue-600 transition-colors"
        >
          {row.original.email}
        </a>
      ),
      size: 200,
    },
    {
      accessorKey: 'phoneNumber',
      header: 'Phone Number',
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ row }) => (
        <a
          href={`tel:${row.original.phoneNumber}`}
          className="text-gray-700 hover:text-blue-600 transition-colors"
        >
          {row.original.phoneNumber}
        </a>
      ),
      size: 140,
    },
    {
      accessorKey: 'gender',
      header: 'Gender',
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          {row.original.gender}
        </span>
      ),
      size: 100,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ row }) => {
        const status = row.original.status;
        const statusColors = {
          'Active': 'bg-green-100 text-green-800',
          'On Leave': 'bg-yellow-100 text-yellow-800',
          'Inactive': 'bg-red-100 text-red-800'
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
          </span>
        );
      },
      size: 100,
    },
    {
      accessorKey: 'joinDate',
      header: 'Join Date',
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ row }) => {
        const date = new Date(row.original.joinDate);
        return date.toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      },
      size: 120,
    },
    {
      accessorKey: 'address',
      header: 'Address',
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ row }) => (
        <span className="truncate max-w-xs" title={row.original.address}>
          {row.original.address}
        </span>
      ),
      size: 200,
    },
    {
      accessorKey: 'emergencyContact',
      header: 'Emergency Contact',
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="font-medium">{row.original.emergencyContact}</div>
          <div className="text-gray-500">{row.original.emergencyContactNumber}</div>
        </div>
      ),
      size: 160,
    },
  ], []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Employees</h1>
        <p className="text-gray-600">Manage and view all employee information</p>
      </div>

      <div className="">
        <TableService
          ref={tableRef}
          columns={columns}
          data={allEmployees}
          initialPageSize={5}
          serverPagination={true}
          pageCount={totalPages}
          totalItems={totalItems}
          totalPages={totalPages}
          currentPage={currentPage}
          loading={loading}
          onRefresh={fetchAllEmployees}
        />
      </div>
    </div>
  );
};

export default AllEmployees;