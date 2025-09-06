import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AllDepartments from './components/AllDepartments';
import AddDepartment from './components/AddDepartment';
import EditDepartment from './components/EditDepartment';

const Departments = () => {
  return (
    <Routes>
      <Route index element={<AllDepartments />} />
      <Route path="add" element={<AddDepartment />} />
      <Route path="edit/:id" element={<EditDepartment />} />
    </Routes>
  );
};

export default Departments;