import React, { useState, useEffect } from 'react';
import { requestAPI, agentAPI, assignmentAPI } from '../../services/api';
import {
  Box,
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
  TextField,
  MenuItem,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import { AssignmentInd as AssignIcon, InfoOutlined as InfoIcon, Delete as DeleteIcon } from '@mui/icons-material';

const STATUSES = ['ALL', 'OPEN', 'ASSIGNED', 'RESOLVED', 'CLOSED', 'ESCALATED'];

const ViewRequests = () => {
  const [requests, setRequests] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Assign Dialog States
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [assignError, setAssignError] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadRequestsAndAgents();
  }, [statusFilter]);

  const loadRequestsAndAgents = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'ALL' ? { status: statusFilter } : {};
      const [requestsRes, agentsRes] = await Promise.all([
        requestAPI.getRequests(params),
        agentAPI.getAgents(),
      ]);
      setRequests(requestsRes.data);
      setAgents(agentsRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleOpenAssign = (req) => {
    setSelectedRequest(req);
    setSelectedAgentId(req.agentId > 0 ? req.agentId : '');
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
      loadRequestsAndAgents();
    } catch (err) {
      setAssigning(false);
      setAssignError('Failed to assign request');
      console.error(err);
    }
  };

  const handleDeleteRequest = async (id) => {
    if (window.confirm('Are you sure you want to delete this service request? This deletes all assignments and assets mappings associated with it.')) {
      try {
        await requestAPI.deleteRequest(id);
        loadRequestsAndAgents();
      } catch (err) {
        console.error(err);
        alert('Failed to delete request');
      }
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          All Service Requests
        </Typography>
        
        <TextField
          select
          size="small"
          label="Filter by Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ width: 200 }}
        >
          {STATUSES.map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : requests.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#fafafa' }}>
          <Typography variant="body1" color="text.secondary">
            No service requests found matching the current status filter.
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
                <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Assignee</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Created At</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.requestId} hover>
                  <TableCell>{req.requestId}</TableCell>
                  <TableCell sx={{ fontWeight: 'medium' }}>{req.title}</TableCell>
                  <TableCell>{req.employeeName}</TableCell>
                  <TableCell>{req.categoryName || 'General'}</TableCell>
                  <TableCell>
                    <Chip label={req.priority} size="small" color={req.priority === 'CRITICAL' ? 'error' : 'default'} />
                  </TableCell>
                  <TableCell>
                    <Chip label={req.status} size="small" color={getStatusColor(req.status)} />
                  </TableCell>
                  <TableCell>{req.agentId > 0 ? req.agentName : <Typography variant="caption" color="text.secondary">Unassigned</Typography>}</TableCell>
                  <TableCell>{new Date(req.createdAt).toLocaleString()}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                      {(req.status === 'OPEN' || req.status === 'ASSIGNED' || req.status === 'ESCALATED') && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<AssignIcon />}
                          onClick={() => handleOpenAssign(req)}
                          sx={{ textTransform: 'none', py: 0.5 }}
                        >
                          Assign
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteRequest(req.requestId)}
                        sx={{ textTransform: 'none', py: 0.5 }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Assign Dialog */}
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
            helperText="Assign agent from active staff"
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

export default ViewRequests;
