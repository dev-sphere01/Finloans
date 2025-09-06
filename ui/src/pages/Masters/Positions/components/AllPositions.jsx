import React, { useEffect, useMemo, useState } from 'react';
import { Link , useNavigate } from 'react-router-dom';
import TableService from '@/services/TableService';
import { confirm } from '@/services/ConfirmationService';
import notification from '@/services/NotificationService';
import { Briefcase, Plus, Edit, Trash2, CornerDownRight } from 'lucide-react';
import PositionService from '@/services/Positions/positions';
import { getDepartmentById } from '@/services/Departments';

const AllPositions = () => {
  const [positions, setPositions] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');


  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const data = await PositionService.getAllPositions();

        const formatted = data.map((pos) => ({
          _id: pos.PositionID.toString(),
          deptID: pos.DeptID,
          positionName: pos.PositionName,
          reportsTo: pos.ReportsTo,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        // Unique department IDs
        const uniqueDeptIDs = [...new Set(formatted.map((pos) => pos.deptID))];

        // Unique reportsTo IDs
        const uniqueReportsToIDs = [
          ...new Set(formatted.flatMap((pos) => pos.reportsTo || [])),
        ];

        // Fetch department names
        const deptMap = {};
        await Promise.all(
          uniqueDeptIDs.map(async (id) => {
            try {
              const dept = await getDepartmentById(id);
              deptMap[id] = dept.DeptName;
            } catch {
              deptMap[id] = 'Unknown Dept';
            }
          })
        );

        // Fetch position names for reportsTo
        const reportsToMap = {};
        await Promise.all(
          uniqueReportsToIDs.map(async (id) => {
            try {
              const position = await PositionService.getPositionById(id);
              reportsToMap[id] = position.PositionName;
            } catch {
              reportsToMap[id] = `#${id}`;
            }
          })
        );

        const withNames = formatted.map((pos) => ({
          ...pos,
          deptName: deptMap[pos.deptID] || 'Unknown',
          reportsToNames: (pos.reportsTo || []).map((id) => reportsToMap[id] || `#${id}`),
        }));

        setPositions(withNames);
      } catch (error) {
        console.error(error);
        notification().error('Failed to load positions.');
      }
    };

    fetchPositions();
  }, []);


  const handleDelete = async (position) => {
    const confirmed = await confirm({
      title: 'Delete Position',
      message: `Are you sure you want to delete the "${position.positionName}" position?`,
    });

    if (!confirmed) {
      notification().info('Position deletion cancelled');
      return;
    }

    try {
      // If you implement deletion later
      // await PositionService.deletePosition(parseInt(position._id));
      notification().success(`Position "${position.positionName}" deleted successfully!`);
      setPositions((prev) => prev.filter((p) => p._id !== position._id));
    } catch (error) {
      console.error(error);
      notification().error('Failed to delete position');
    }
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'positionName',
      header: 'Position Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Briefcase className="text-green-600" size={16} />
          </div>
          <span className="font-medium text-gray-900">{row.original.positionName}</span>
        </div>
      ),
    },
    {
      accessorKey: 'deptName',
      header: 'Department',
      cell: ({ row }) => (
        <span className="text-gray-800 font-medium">{row.original.deptName}</span>
      ),
    },
    // Optionally also keep deptID column if you want

    {
      accessorKey: 'reportsToNames',
      header: 'Reports To',
      cell: ({ row }) => {
        const names = row.original.reportsToNames || [];
        return names.length ? (
          <div className="flex flex-wrap gap-1">
            {names.map((name, i) => (
              <span
                key={i}
                className="inline-flex items-center text-xs bg-gray-100 text-gray-700 rounded px-2 py-0.5"
              >
                <CornerDownRight className="mr-1" size={12} />
                {name}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-400 italic">None</span>
        );
      },
    },

    // {
    //   accessorKey: 'createdAt',
    //   header: 'Created Date',
    //   cell: ({ row }) => {
    //     const date = new Date(row.original.createdAt);
    //     return (
    //       <span className="text-gray-700">
    //         {date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
    //       </span>
    //     );
    //   },
    // },
    // {
    //   accessorKey: 'updatedAt',
    //   header: 'Last Updated',
    //   cell: ({ row }) => {
    //     const date = new Date(row.original.updatedAt);
    //     return (
    //       <span className="text-gray-600">
    //         {date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
    //       </span>
    //     );
    //   },
    // },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const position = row.original;
        return (
          <div className="flex items-center gap-2">
            <Link
              to={`/dashboard/positions/edit/${position._id}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors duration-200"
            >
              <Edit size={14} /> Edit
            </Link>
            {/* <button
              onClick={() => handleDelete(position)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors duration-200"
            >
              <Trash2 size={14} /> Delete
            </button> */}
          </div>
        );
      },
    },
  ], []);

  return (
    <div className="p-2">
      <div className="mb-2">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Positions</h1>
            <p className="text-gray-600">Manage all available positions in your organization</p>
          </div>
          <Link
            to="/dashboard/positions/add"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} /> Add Position
          </Link>
        </div>
      </div>

      <div>
        <TableService
          columns={columns}
          data={positions}
          initialPageSize={10}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          serverPagination={false}
        />
      </div>
    </div>
  );
};

export default AllPositions;
