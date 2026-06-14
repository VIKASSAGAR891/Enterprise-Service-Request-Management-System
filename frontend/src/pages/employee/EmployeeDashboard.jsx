import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { requestAPI } from '../../services/api';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  AddCircle as AddIcon,
  Visibility as ViewIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await requestAPI.getRequests({ userId: user.userId });
      setRequests(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load requests:', err);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'primary';
      case 'ASSIGNED': return 'info';
      case 'RESOLVED': return 'success';
      case 'CLOSED': return 'default';
      case 'ESCALATED': return 'error';
      default: return 'default';
    }
  };

  const openCount = requests.filter(r => r.status === 'OPEN' || r.status === 'ASSIGNED' || r.status === 'ESCALATED').length;
  const resolvedCount = requests.filter(r => r.status === 'RESOLVED' || r.status === 'CLOSED').length;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Employee Request Portal
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/create-request')}
          sx={{ textTransform: 'none', fontWeight: 'bold' }}
        >
          Create Request
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderLeft: '4px solid #1976d2' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                ACTIVE REQUESTS
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                {openCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderLeft: '4px solid #2e7d32' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                RESOLVED / CLOSED
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                {resolvedCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderLeft: '4px solid #ed6c02' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                TOTAL SUBMITTED
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ed6c02' }}>
                {requests.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Requests Table */}
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
        My Service Requests
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : requests.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#fafafa' }}>
          <InfoIcon color="action" sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            You have not submitted any service requests yet.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate('/create-request')}
            sx={{ mt: 2, textTransform: 'none' }}
          >
            Submit your first request
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Created At</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.requestId} hover>
                  <TableCell>{req.requestId}</TableCell>
                  <TableCell sx={{ fontWeight: 'medium' }}>{req.title}</TableCell>
                  <TableCell>{req.categoryName || 'General'}</TableCell>
                  <TableCell>
                    <Chip
                      label={req.priority}
                      size="small"
                      color={
                        req.priority === 'CRITICAL' || req.priority === 'HIGH' ? 'warning' : 'default'
                      }
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={req.status}
                      size="small"
                      color={getStatusColor(req.status)}
                    />
                  </TableCell>
                  <TableCell>
                    {req.createdAt ? new Date(req.createdAt).toLocaleString() : 'N/A'}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="text"
                      startIcon={<ViewIcon />}
                      onClick={() => navigate(`/track-request/${req.requestId}`)}
                      sx={{ textTransform: 'none' }}
                    >
                      Track
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default EmployeeDashboard;
