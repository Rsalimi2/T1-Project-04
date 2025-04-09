import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Select, MenuItem, Button, Grid } from '@mui/material';
import axios from 'axios';

export default function MaskingPage() {
  const navigate = useNavigate();
  const [columns, setColumns] = useState([]);
  const [rules, setRules] = useState({});
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/columns');
        setColumns(response.data.columns);
      } catch (error) {
        alert('Failed to fetch columns!');
      }
    };
    fetchColumns();
  }, []);

  const handleRuleChange = (column, method) => {
    setRules({ ...rules, [column]: method });
  };

  const handlePreview = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/preview', {
        rules,
        sampleSize: 5
      });
      setPreview(response.data);
    } catch (error) {
      alert('Preview failed!');
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Configure Masking Rules</Typography>
      
      <Grid container spacing={3}>
        {columns.map((column) => (
          <Grid item xs={12} sm={6} key={column}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body1" sx={{ minWidth: 150 }}>{column}</Typography>
              <Select
                value={rules[column] || 'none'}
                onChange={(e) => handleRuleChange(column, e.target.value)}
                fullWidth
              >
                <MenuItem value="none">No Masking</MenuItem>
                <MenuItem value="faker">Faker Replacement</MenuItem>
                <MenuItem value="hash">Hash Masking</MenuItem>
              </Select>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Button variant="contained" onClick={handlePreview} sx={{ mt: 4 }}>
        Preview Masking
      </Button>

      {preview && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Preview:</Typography>
          <pre>{JSON.stringify(preview, null, 2)}</pre>
          <Button 
            variant="contained" 
            color="success"
            onClick={() => navigate('/audit')}
          >
            Export Masked Data
          </Button>
        </Box>
      )}
    </Box>
  );
}