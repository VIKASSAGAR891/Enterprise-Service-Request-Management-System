import React, { useState, useEffect } from 'react';
import { agentAPI, userAPI } from '../../services/api';
import {
  Box,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const DEPARTMENTS = [
  { id: 1, name: 'IT Helpdesk' },
  { id: 2, name: 'Network Operations' },
  { id: 3, name: 'Database Administration' },
  { id: 4, name: 'Security & Compliance' },
];

const ManageAgents = () => {
  const [agents, setAgents] = useState([]);
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState(null);

  // Form States
  const [selectedUserId, setSelectedUserId] = useState('');
  const [deptId, setDeptId] = useState(1);
  const [workload, setWorkload] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch agents
      const agentsRes = await agentAPI.getAgents();
      setAgents(agentsRes.data);

      // Fetch all users to filter out eligible ones (AGENT or TEAM_LEAD roles who aren't already agents)
      const usersRes = await userAPI.getUsers();
      const allUsers = usersRes.data;
      const currentAgentUserIds = agentsRes.data.map(a => a.userId);
      
      const eligible = allUsers.filter(u => 
        (u.role === 'AGENT' || u.role === 'TEAM_LEAD') && 
        !currentAgentUserIds.includes(u.userId)
      );

      setEligibleUsers(eligible);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to load agents information');
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEdit(false);
    setSelectedAgentId(null);
    setSelectedUserId('');
    setDeptId(1);
    setWorkload(0);
    setError('');
    setOpenDialog(true);
  };

  const handleOpenEdit = (agent) => {
    setIsEdit(true);
    setSelectedAgentId(agent.agentId);
    setSelectedUserId(agent.userId); // Read only in edit mode
    setDeptId(agent.deptId);
    setWorkload(agent.workload);
    setError('');
    setOpenDialog(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !deptId) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      if (isEdit) {
        await agentAPI.updateAgent(selectedAgentId, {
          deptId: parseInt(deptId),
          workload: parseInt(workload)
        });
      } else {
        await agentAPI.addAgent({
          userId: parseInt(selectedUserId),
          deptId: parseInt(deptId)
        });
      }
      setSubmitting(false);
      setOpenDialog(false);
      loadData(); // Reload list
    } catch (err) {
      setSubmitting(false);
      setError('Failed to save agent settings');
      console.error(err);
    }
  };

  const handleDelete = async (agentId) => {
    if (window.confirm('Are you sure you want to delete this agent? This removes their agent registry status (the user account will still exist).')) {
      try {
        await agentAPI.deleteAgent(agentId);
        loadData();
      } catch (err) {
        console.error(err);
        alert('Failed to delete agent');
      }
    }
  };

  const getDeptName = (id) => {
    const dept = DEPARTMENTS.find(d => d.id === id);
    return dept ? dept.name : `Dept ${id}`;
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Support Agent Registry
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{ textTransform: 'none', fontWeight: 'bold' }}
        >
          Register Agent
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Agent ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Full Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Active Workload</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {agents.map((agent) => (
              <TableRow key={agent.agentId} hover>
                <TableCell>{agent.agentId}</TableCell>
                <TableCell sx={{ fontWeight: 'medium' }}>{agent.fullName}</TableCell>
                <TableCell>{agent.email}</TableCell>
                <TableCell>{getDeptName(agent.deptId)}</TableCell>
                <TableCell>
                  <Chip
                    label={`${agent.workload} requests`}
                    size="small"
                    color={agent.workload > 3 ? 'warning' : 'default'}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton color="primary" onClick={() => handleOpenEdit(agent)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(agent.agentId)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {isEdit ? 'Modify Agent Department' : 'Register New Support Agent'}
        </DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSave}>
            {isEdit ? (
              <TextField
                margin="normal"
                fullWidth
                disabled
                label="Selected Agent User ID"
                value={selectedUserId}
              />
            ) : eligibleUsers.length === 0 ? (
              <Alert severity="info" sx={{ my: 1 }}>
                All user accounts with AGENT or TEAM_LEAD roles are already registered.
              </Alert>
            ) : (
              <TextField
                margin="normal"
                required
                select
                fullWidth
                label="Select User Account"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                {eligibleUsers.map((u) => (
                  <MenuItem key={u.userId} value={u.userId}>
                    {u.fullName} ({u.role})
                  </MenuItem>
                ))}
              </TextField>
            )}

            <TextField
              margin="normal"
              required
              select
              fullWidth
              label="Assigned Department"
              value={deptId}
              onChange={(e) => setDeptId(e.target.value)}
            >
              {DEPARTMENTS.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </TextField>

            {isEdit && (
              <TextField
                margin="normal"
                required
                type="number"
                fullWidth
                label="Current Workload (Active Requests)"
                value={workload}
                onChange={(e) => setWorkload(e.target.value)}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={submitting || (!isEdit && eligibleUsers.length === 0)}
          >
            {submitting ? 'Saving...' : 'Save Registry'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageAgents;
