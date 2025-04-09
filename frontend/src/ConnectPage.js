import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Container, Typography } from '@mui/material';
import axios from 'axios';

export default function ConnectPage() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_db'
  });

  const handleConnect = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/connect', credentials);
      navigate('/browse');
    } catch (error) {
      alert('Connection failed!');
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>Database Connection</Typography>
      <TextField
        label="Host"
        fullWidth
        margin="normal"
        value={credentials.host}
        onChange={(e) => setCredentials({ ...credentials, host: e.target.value })}
      />
      <TextField
        label="Username"
        fullWidth
        margin="normal"
        value={credentials.user}
        onChange={(e) => setCredentials({ ...credentials, user: e.target.value })}
      />
      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        value={credentials.password}
        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
      />
      <TextField
        label="Database"
        fullWidth
        margin="normal"
        value={credentials.database}
        onChange={(e) => setCredentials({ ...credentials, database: e.target.value })}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleConnect}
        sx={{ mt: 3 }}
      >
        Connect
      </Button>
    </Container>
  );
}