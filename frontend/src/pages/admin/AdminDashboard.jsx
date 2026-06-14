import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestAPI, userAPI, agentAPI, assetAPI, assignmentAPI } from '../../services/api';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  AssignmentInd as AssignIcon,
  People as UsersIcon,
  SupportAgent as AgentsIcon,
  Devices as AssetsIcon,
  ListAlt as RequestsIcon,
} from '@mui/icons-material';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    usersCount: 0,
    agentsCount: 0,
    assetsCount: 0,
    requestsCount: 0,
  });
  const [unassignedRequests, setUnassignedRequests] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Assign Dialog States
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [assignError, setAssignError] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [usersRes, agentsRes, assetsRes, requestsRes] = await Promise.all([
        userAPI.getUsers(),
        agentAPI.getAgents(),
        assetAPI.getAssets(),
        requestAPI.getRequests(),
      ]);

      const allReqs = requestsRes.data;
      const unassigned = allReqs.filter(r => r.status === 'OPEN' && (!r.agentId || r.agentId === 0));

      setStats({
        usersCount: usersRes.data.length,
        agentsCount: agentsRes.data.length,
        assetsCount: assetsRes.data.length,
        requestsCount: allReqs.length,
      });
      setUnassignedRequests(unassigned);
      setAgents(agentsRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setLoading(false);
    }
  };

  const handleOpenAssign = (req) => {
    setSelectedRequest(req);
    setSelectedAgentId('');
    setAssignError('');
    setAssignDialogOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedAgentId) {
      setAssignError('Please select an agent');
      return;
    }
    setAssignError('');
    setAssigning(true);
    try {
      await assignmentAPI.createAssignment(selectedRequest.requestId, selectedAgentId);
      setAssigning(false);
      setAssignDialogOpen(false);
      loadDashboardData(); // Reload dashboard
    } catch (err) {
      setAssigning(false);
      setAssignError('Failed to assign request');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        System Administration Console
      </Typography>

      {/* Counters */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            onClick={() => navigate('/admin/users')}
            sx={{
              cursor: 'pointer',
              borderLeft: '4px solid #1976d2',
              '&:hover': { transform: 'translateY(-3px)', transition: 'all 0.2s' },
            }}
          >
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography color="text.secondary" variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  TOTAL USERS
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                  {stats.usersCount}
                </Typography>
              </Box>
              <UsersIcon color="primary" sx={{ fontSize: 40, opacity: 0.7 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            onClick={() => navigate('/admin/agents')}
            sx={{
              cursor: 'pointer',
              borderLeft: '4px solid #009688',
              '&:hover': { transform: 'translateY(-3px)', transition: 'all 0.2s' },
            }}
          >
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography color="text.secondary" variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  ACTIVE AGENTS
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                  {stats.agentsCount}
                </Typography>
              </Box>
              <AgentsIcon sx={{ color: '#009688', fontSize: 40, opacity: 0.7 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            onClick={() => navigate('/admin/assets')}
            sx={{
              cursor: 'pointer',
              borderLeft: '4px solid #ed6c02',
              '&:hover': { transform: 'translateY(-3px)', transition: 'all 0.2s' },
            }}
          >
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography color="text.secondary" variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  MANAGED ASSETS
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                  {stats.assetsCount}
                </Typography>
              </Box>
              <AssetsIcon color="warning" sx={{ fontSize: 40, opacity: 0.7 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            onClick={() => navigate('/admin/requests')}
            sx={{
              cursor: 'pointer',
              borderLeft: '4px solid #9c27b0',
              '&:hover': { transform: 'translateY(-3px)', transition: 'all 0.2s' },
            }}
          >
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography color="text.secondary" variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  SERVICE REQUESTS
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                  {stats.requestsCount}
                </Typography>
              </Box>
              <RequestsIcon sx={{ color: '#9c27b0', fontSize: 40, opacity: 0.7 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Unassigned Requests Table */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Unassigned Requests ({unassignedRequests.length})
        </Typography>
        <Button size="small" onClick={() => navigate('/admin/requests')} sx={{ textTransform: 'none' }}>
          View All Requests
        </Button>
      </Box>

      {unassignedRequests.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#fafafa', boxShadow: 1 }}>
          <Typography variant="body1" color="text.secondary">
            Good job! All service requests are currently assigned to agents.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Employee</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Created At</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {unassignedRequests.map((req) => (
                <TableRow key={req.requestId} hover>
                  <TableCell>{req.requestId}</TableCell>
                  <TableCell sx={{ fontWeight: 'medium' }}>{req.title}</TableCell>
                  <TableCell>{req.employeeName}</TableCell>
                  <TableCell>
                    <Chip label={req.priority} size="small" color={req.priority === 'CRITICAL' ? 'error' : 'default'} />
                  </TableCell>
                  <TableCell>{req.categoryName || 'General'}</TableCell>
                  <TableCell>{new Date(req.createdAt).toLocaleString()}</TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AssignIcon />}
                      onClick={() => handleOpenAssign(req)}
                      sx={{ textTransform: 'none', py: 0.5 }}
                    >
                      Assign
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Assign Request Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Assign Service Request</DialogTitle>
        <DialogContent dividers>
          {assignError && <Alert severity="error" sx={{ mb: 2 }}>{assignError}</Alert>}
          {selectedRequest && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                Request #{selectedRequest.requestId}: {selectedRequest.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Priority: {selectedRequest.priority} | Category: {selectedRequest.categoryName}
              </Typography>
            </Box>
          )}
          <TextField
            fullWidth
            select
            required
            label="Select Support Agent"
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            helperText="Choose an agent based on specialization or current workload"
          >
            {agents.map((agent) => (
              <MenuItem key={agent.agentId} value={agent.agentId}>
                {agent.fullName} (Workload: {agent.workload} active requests)
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAssign}
            disabled={assigning}
          >
            {assigning ? 'Assigning...' : 'Assign Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
