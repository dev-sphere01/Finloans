import React from 'react'
import { Routes, Route } from 'react-router-dom';

//components imports

import AddPositions from './components/AddPositions'
import EditPositions from './components/EditPositions.jsx'
import AllPositions from './components/AllPositions.jsx'

const Positions = () => {
  return (
    <Routes>
      <Route index element={<AllPositions />} />
      <Route path="add" element={<AddPositions />} />
      <Route path="edit/:id" element={<EditPositions />} />
    </Routes>
  )
}

export default Positions