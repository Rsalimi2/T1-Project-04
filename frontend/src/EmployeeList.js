// In src/EmployeeList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/employees')
      .then(response => setEmployees(response.data))
      .catch(error => console.error('Error fetching employees:', error));
  }, []);

  return (
    <div>
      <h2>Employee Records</h2>
      <ul>
        {employees.map(emp => (
          <li key={emp.EmployeeID}>
            {emp.EmployeeName} - {emp.Department} - {emp.HireDate}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EmployeeList;
