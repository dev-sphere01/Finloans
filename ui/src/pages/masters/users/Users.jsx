import React, { useState, useEffect } from 'react';
import userService from '@/services/userService';
import UserForm from './components/UserForm';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data.users);
    } catch (err) {
      setError(err.error || 'Failed to fetch users');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (formData) => {
    try {
      await userService.createUser(formData);
      setIsFormOpen(false);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Failed to create user:', error);
      // You might want to show an error message to the user
    }
  };

  const handleUpdateUser = async (formData) => {
    try {
      await userService.updateUser(editingUser._id, formData);
      setIsFormOpen(false);
      setEditingUser(null);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Failed to update user:', error);
      // You might want to show an error message to the user
    }
  };

  const handleDeleteUser = async () => {
    try {
      await userService.deleteUser(deletingUser._id);
      setDeletingUser(null);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete user:', error);
      // You might want to show an error message to the user
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (user) => {
    setDeletingUser(user);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingUser(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button onClick={() => {
          setEditingUser(null); // Make sure we are not in edit mode
          setIsFormOpen(true);
        }} className="bg-blue-500 text-white px-4 py-2 rounded">
          Add User
        </button>
      </div>

      {isFormOpen && (
        <UserForm
          onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
          onCancel={handleCancel}
          initialData={editingUser}
        />
      )}

      {deletingUser && (
        <DeleteConfirmationModal
          userName={deletingUser.username}
          onConfirm={handleDeleteUser}
          onCancel={() => setDeletingUser(null)}
        />
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Username</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Full Name</th>
              <th className="py-2 px-4 border-b">Role</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td className="py-2 px-4 border-b">{user.username}</td>
                <td className="py-2 px-4 border-b">{user.email}</td>
                <td className="py-2 px-4 border-b">{user.fullName}</td>
                <td className="py-2 px-4 border-b">{user.roleId.name}</td>
                <td className="py-2 px-4 border-b">{user.isActive ? 'Active' : 'Inactive'}</td>
                <td className="py-2 px-4 border-b">
                  <button onClick={() => handleEditClick(user)} className="bg-blue-500 text-white px-2 py-1 rounded mr-2">Edit</button>
                  <button onClick={() => handleDeleteClick(user)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
