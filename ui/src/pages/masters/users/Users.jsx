import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import userService from '@/services/userService';
import { useNavigate } from 'react-router-dom';
import TableService from '@/services/TableService';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import { createColumnHelper } from '@tanstack/react-table';

const Users = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const tableRef = useRef(null);
  const navigate = useNavigate();

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor('username', {
        header: 'Username',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('fullName', {
        header: 'Full Name',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('roleId.name', {
        header: 'Role',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('isActive', {
        header: 'Status',
        cell: (info) => (info.getValue() ? 'Active' : 'Inactive'),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/dashboard/users/edit/${info.row.original._id}`)}
              className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteClick(info.row.original)}
              className="bg-red-500 text-white px-2 py-1 rounded text-sm"
            >
              Delete
            </button>
          </div>
        ),
      }),
    ],
    []
  );

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setData(data.users);
    } catch (err) {
      setError(err.error || 'Failed to fetch users');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteClick = useCallback((user) => {
    setDeletingUser(user);
  }, []);

  const handleDeleteUser = useCallback(async () => {
    try {
      if (deletingUser) {
        await userService.deleteUser(deletingUser._id);
        setDeletingUser(null);
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      // You might want to show an error message to the user
    }
  }, [deletingUser, fetchUsers]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          onClick={() => navigate('/dashboard/users/add')}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add User
        </button>
      </div>

      <TableService
        ref={tableRef}
        columns={columns}
        data={data}
        loading={loading}
        onRefresh={fetchUsers}
      />

      {deletingUser && (
        <DeleteConfirmationModal
          userName={deletingUser.username}
          onConfirm={handleDeleteUser}
          onCancel={() => setDeletingUser(null)}
        />
      )}
    </>
  );
};

export default Users;
