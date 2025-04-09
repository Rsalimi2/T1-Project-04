import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, List, ListItem, ListItemText, Checkbox, Button } from '@mui/material';
import axios from 'axios';

export default function SchemaBrowser() {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/tables');
        setTables(response.data.tables);
      } catch (error) {
        alert('Failed to fetch tables!');
      }
    };
    fetchTables();
  }, []);

  const handleToggle = (table) => () => {
    const currentIndex = selected.indexOf(table);
    const newSelected = [...selected];

    if (currentIndex === -1) {
      newSelected.push(table);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    setSelected(newSelected);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Select Tables to Mask</Typography>
      <List>
        {tables.map((table) => (
          <ListItem key={table} button onClick={handleToggle(table)}>
            <Checkbox checked={selected.indexOf(table) !== -1} />
            <ListItemText primary={table} />
          </ListItem>
        ))}
      </List>
      <Button
        variant="contained"
        onClick={() => navigate('/mask')}
        disabled={selected.length === 0}
      >
        Continue with {selected.length} tables
      </Button>
    </Box>
  );
}