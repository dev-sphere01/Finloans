import React, { useState } from 'react'
import AddSalaryStructure from './AddStructure/AddStructure'
import Allsalarystructure from './ViewStructure/ViewStructure';

const SalaryStructures = () => {
  const [showAddstructure, setShowAddStructure] = useState(false);

  const handleSalary = (() => {
    setShowAddStructure((prev) => !prev)
  })

  return (
    <div className='p-6'>
      <div className="flex justify-between items-center mb-4"> 
        <h1 className="text-xl font-semibold">Salary Structure</h1>
        <button
          onClick={handleSalary}
          className={`${
            showAddstructure ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
          } text-white font-semibold py-2 px-4 rounded shadow transition`}
        >
          {showAddstructure ? 'Close' : '+ Add Salary Structure'}
        </button>
       
      </div>
      {showAddstructure &&
        <AddSalaryStructure/>
      }
      <Allsalarystructure />
    </div>
  )
}

export default SalaryStructures
