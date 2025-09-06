import ExcelImportService from '@/services/ExcelMappingService';
import React, { useState } from 'react'

const ExcelUploadDemo = () => {
  const [myData, setMyData] = useState([]);//data to send in payload

  const predefinedFields = [
    { key: 'names', label: 'Names', required: true, variations: ['names', 'name', 'full name', 'full_name', 'customer name', 'employee name'] },
    { key: 'role', label: 'Roles', required: true, variations: ['roles', 'role', 'mobile', 'phone number', 'mobile number', 'contact number'] },
    { key: 'positions', label: 'Positions', required: true, variations: ['positions', 'position', 'title', 'job title', 'designation', 'role', 'job position'] }
  ];

  // Callback function to receive data from child
  const handleDataChange = (newData) => {
    setMyData(newData);
    console.log('Received Data:', newData);
  };

  return (
    <div className=" bg-gray-100 ">
      <div className="">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <ExcelImportService
            predefinedFields={predefinedFields}
            onDataChange={handleDataChange}
            debugMode={true}
            exportJsonEnabled={true}
          />
        </div>
      </div>
    </div>
  );
};

export default ExcelUploadDemo;
