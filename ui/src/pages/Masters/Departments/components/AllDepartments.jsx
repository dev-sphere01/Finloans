import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import TableService from '@/services/TableService';
import { confirm } from '@/services/ConfirmationService';
import notification from '@/services/NotificationService';
import { Building, Plus, Edit, Trash2, Users } from 'lucide-react';
import {getAllDepartments,deleteDepartment } from '@/services/Departments';


const AllDepartments = () => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [departments, setDepartments] = useState([]);

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await getAllDepartments();
        const formatted = data.map((dept) => ({
          _id: dept.DeptID?.toString(),
          deptName: dept.DeptName,
          employeeCount: dept.EmployeeCount,
          positionCount: dept.PositionCount,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        setDepartments(formatted);
      } catch (err) {
        notification().error('Failed to load departments');
        console.error(err);
      }
    };

    fetchDepartments();
  }, []);

  const handleDeleteDepartment = async (department) => {
    const confirmed = await confirm({
      title: "Delete Department",
      message: `Are you sure you want to delete the "${department.deptName}" department?`,
    });

    if (confirmed) {
      try {
        await deleteDepartment(parseInt(department._id));
        setDepartments(prev => prev.filter(dept => dept._id !== department._id));
        notification().success(`Department "${department.deptName}" deleted successfully!`);
      } catch (error) {
        notification().error('Failed to delete department. Please try again.');
        console.error(error);
      }
    } else {
      notification().info('Department deletion cancelled');
    }
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'deptName',
      header: 'Department Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building className="text-blue-600" size={16} />
          </div>
          <span className="font-medium text-gray-900">{row.original.deptName}</span>
        </div>
      ),
    },
    {
      accessorKey: 'employeeCount',
      header: 'Employee Count',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Users className="text-gray-500" size={16} />
          <span className="font-medium text-gray-900">{row.original.employeeCount}</span>
          <span className="text-sm text-gray-500">
            employee{row.original.employeeCount !== 1 ? 's' : ''}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'positionCount',
      header: 'Position Count',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Users className="text-gray-500" size={16} />
          <span className="font-medium text-gray-900">{row.original.positionCount}</span>
          <span className="text-sm text-gray-500">
            employee{row.original.positionCount !== 1 ? 's' : ''}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created Date',
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return (
          <span className="text-gray-700">
            {date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        );
      },
    },
    {
      accessorKey: 'updatedAt',
      header: 'Last Updated',
      cell: ({ row }) => {
        const date = new Date(row.original.updatedAt);
        return (
          <span className="text-gray-600">
            {date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        );
      },
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const department = row.original;
        return (
          <div className="flex items-center gap-2">
            <Link
              to={`/dashboard/departments/edit/${department._id}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors duration-200"
            >
              <Edit size={14} /> Edit
            </Link>
            {/* <button
              onClick={() => handleDeleteDepartment(department)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors duration-200"
            >
              <Trash2 size={14} /> Delete
            </button> */}
          </div>
        );
      },
    },
  ], []);

  const stats = useMemo(() => {
    const totalDepartments = departments.length;
    const totalEmployees = departments.reduce((sum, dept) => sum + dept.employeeCount, 0);
    const avgEmployeesPerDept = totalDepartments > 0 ? Math.round(totalEmployees / totalDepartments) : 0;
    const largestDept = departments.reduce((max, dept) =>
      dept.employeeCount > (max?.employeeCount || 0) ? dept : max, null
    );

    return { totalDepartments, totalEmployees, avgEmployeesPerDept, largestDept };
  }, [departments]);

  return (
    <div className="p-2">
      <div className="mb-2">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Departments</h1>
            <p className="text-gray-600">Manage and organize your company departments</p>
          </div>
          <Link
            to="/dashboard/departments/add"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} /> Add Department
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-sm font-small text-gray-500">Total Departments</h3>
            <p className="text-xl font-bold text-gray-900">{stats.totalDepartments}</p>
          </div>
          <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-sm font-small text-gray-500">Total Employees</h3>
            <p className="text-xl font-bold text-blue-600">{stats.totalEmployees}</p>
          </div>
          <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-sm font-small text-gray-500">Avg. per Department</h3>
            <p className="text-xl font-bold text-green-600">{stats.avgEmployeesPerDept}</p>
          </div>
          <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-sm font-small text-gray-500">Largest Department</h3>
            <p className="text-g font-bold text-purple-600">
              {stats.largestDept ? stats.largestDept.deptName : 'N/A'}
            </p>
            {stats.largestDept && (
              <p className="text-sm text-gray-500">{stats.largestDept.employeeCount} employees</p>
            )}
          </div>
        </div>
      </div>

      <div className="">
        <TableService
          columns={columns}
          data={departments}
          initialPageSize={10}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          serverPagination={false}
        />
      </div>
    </div>
  );
};

export default AllDepartments;
