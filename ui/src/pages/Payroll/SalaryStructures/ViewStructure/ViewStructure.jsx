import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { notification, TableService, ConfirmationService } from '@/services';
import GetAllSalaryStructure from '@/services/SalaryStructure/ViewStructure';

const Allsalarystructure = () => {
  // Global search state
  const [globalFilter, setGlobalFilter] = useState('');
  const [allsalarystructure, setAllsalarystructure] = useState([]);
  const [loading, setLoading] = useState(true);

  // Server pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all salarystructure on component mount and when pagination/filters change
  useEffect(() => {
    fetchAllsalarystructure();
  }, [pagination.pageIndex, pagination.pageSize, globalFilter]);

  const fetchAllsalarystructure = async () => {
    setLoading(true);

    const salarystructure = await GetAllSalaryStructure.getAllStructure(
      globalFilter || "",
      pagination.pageIndex + 1, // API expects 1-based page numbers
      pagination.pageSize,
      null, // obStatus
      null  // isActive
    );

    if (Array.isArray(salarystructure)) {
      console.log("Salary structure", salarystructure)
      // Map API data to table format
      const mappedsalarystructure = salarystructure.map(ss => ({
        Department: ss.Department, // Format as ss001, ss002, etc.
        Position: ss.Position,
        MinCTC: ss.MinCTC,
        MaxCTC: ss.MaxCTC,
        AverageCTC: ss.AverageCTC,
      }));
      console.log(mappedsalarystructure)
      setAllsalarystructure(mappedsalarystructure);

      // Set pagination info from API response
      setTotalItems(salarystructure.TotalRecords || salarystructure.Total || mappedsalarystructure.length);
      setTotalPages(salarystructure.TotalPages || Math.ceil((salarystructure.TotalRecords || salarystructure.Total || mappedsalarystructure.length) / pagination.pageSize));
      setCurrentPage(pagination.pageIndex + 1);

      console.log('Mapped salarystructure:', mappedsalarystructure);
      console.log('Pagination info:', {
        totalItems: salarystructure.TotalRecords || salarystructure.Total,
        totalPages: salarystructure.TotalPages,
        currentPage: pagination.pageIndex + 1
      });
    } else {
      setAllsalarystructure([]);
      setTotalItems(0);
      setTotalPages(0);
      setCurrentPage(1);
    }

    setLoading(false);
  };

  // Handle pagination changes from table
  const handlePaginationChange = (newPagination) => {
    setPagination(newPagination);
  };

  // Handle global filter changes with debouncing
  const handleGlobalFilterChange = (value) => {
    setGlobalFilter(value);
    // Reset to first page when searching
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  // Enhanced table columns configuration with all features enabled
  const columns = useMemo(() => [
    {
      accessorKey: 'Department',
      header: 'Department',
      enableSorting: true,
      enableColumnFilter: true,

      size: 180,
    },
    {
      accessorKey: 'Position',
      header: 'Position',
      enableSorting: true,
      enableColumnFilter: true,

      size: 200,
    },
    {
      accessorKey: 'MaxCTC',
      header: 'MaxCTC',
      enableSorting: true,
      enableColumnFilter: true,
      size: 120,
    },
    {
      accessorKey: 'AverageCTC',
      header: 'Avg CTC',
      enableSorting: true,
      enableColumnFilter: true,

      size: 140,
    },
    {
      accessorKey: 'MinCTC',
      header: 'MinCTC',
      enableSorting: true,
      enableColumnFilter: true,

      size: 100,
    },

  ], []);

  return (
    <div className="p-6">
      <div className="">
        <TableService
          columns={columns}
          data={allsalarystructure}
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
  );
};

export default Allsalarystructure;