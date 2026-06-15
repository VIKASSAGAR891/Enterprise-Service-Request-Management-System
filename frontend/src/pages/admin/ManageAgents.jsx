import { useState, useEffect } from 'react';
import { agentAPI, userAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
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
  InputAdornment,
  TablePagination
} from '@mui/material';
import { UserPlus, Search, Edit2, Trash2, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const { showNotification } = useNotification();

  // Search & Filter & Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState(null);

  // Form States
  const [selectedUserId, setSelectedUserId] = useState('');
  const [deptId, setDeptId] = useState(1);
  const [workload, setWorkload] = useState(0);
  const [submitting, setSubmitting] = useState(false);



  const loadData = async () => {
    try {
      setLoading(true);
      const agentsRes = await agentAPI.getAgents();
      setAgents(agentsRes.data);

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
      showNotification('Could not read agent directory from database', 'error');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
        showNotification('Agent settings updated.', 'success');
      } else {
        await agentAPI.addAgent({
          userId: parseInt(selectedUserId),
          deptId: parseInt(deptId)
        });
        showNotification('Support agent registered successfully!', 'success');
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
    if (window.confirm('Are you sure you want to remove this support agent registration? (The user account itself will remain active)')) {
      try {
        await agentAPI.deleteAgent(agentId);
        showNotification('Support agent registration removed.', 'info');
        loadData();
      } catch (err) {
        console.error(err);
        showNotification('Failed to remove support agent', 'error');
      }
    }
  };

  const getDeptName = (id) => {
    const dept = DEPARTMENTS.find(d => d.id === id);
    return dept ? dept.name : `Dept ${id}`;
  };

  // Filters & Search logic
  const filteredAgents = agents.filter((a) => {
    const matchesSearch =
      a.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getDeptName(a.deptId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || a.deptId === parseInt(deptFilter);
    return matchesSearch && matchesDept;
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5, color: 'var(--text-primary)' }}>
            Support Agent Registry
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            View active support specialists, workloads, and department allocations.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<UserPlus size={18} />}
          onClick={handleOpenAdd}
          sx={{ fontWeight: 700, borderRadius: '8px' }}
        >
          Register Agent
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}

      {/* Search and Filters Block */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: '12px', border: '1px solid', borderColor: 'divider', display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Search by agent name, email, department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1, minWidth: '250px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={16} color="#94A3B8" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          label="Filter by Department"
          sx={{ width: 220 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Filter size={16} color="#94A3B8" />
              </InputAdornment>
            ),
          }}
        >
          <MenuItem value="ALL">All Departments</MenuItem>
          {DEPARTMENTS.map((dept) => (
            <MenuItem key={dept.id} value={String(dept.id)}>
              {dept.name}
            </MenuItem>
          ))}
        </TextField>
      </Paper>

      {/* Agents Table */}
      <TableContainer className="modern-table-container">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Agent ID</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Active Workload</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAgents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((agent) => (
              <TableRow key={agent.agentId} hover>
                <TableCell sx={{ fontWeight: 700 }}>#{agent.agentId}</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>{agent.fullName}</TableCell>
                <TableCell>{agent.email}</TableCell>
                <TableCell>{getDeptName(agent.deptId)}</TableCell>
                <TableCell>
                  <Chip
                    label={`${agent.workload || 0} active tickets`}
                    size="small"
                    sx={{
                      backgroundColor: agent.workload > 3 ? '#F59E0B15' : '#16A34A15',
                      color: agent.workload > 3 ? '#F59E0B' : '#16A34A',
                      fontWeight: 700,
                      borderRadius: '6px'
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenEdit(agent)}
                      sx={{
                        p: 1,
                        backgroundColor: 'action.hover',
                        borderRadius: '8px',
                        '&:hover': { color: 'primary.main' }
                      }}
                    >
                      <Edit2 size={16} />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(agent.agentId)}
                      sx={{
                        p: 1,
                        backgroundColor: 'action.hover',
                        borderRadius: '8px',
                        '&:hover': { color: 'error.main' }
                      }}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {filteredAgents.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No registered agents match your criteria.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredAgents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800 }}>
          {isEdit ? 'Modify Agent Department' : 'Register New Support Agent'}
        </DialogTitle>
        <DialogContent dividers sx={{ py: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {isEdit ? (
              <TextField
                fullWidth
                disabled
                label="Selected Agent User ID"
                value={selectedUserId}
              />
            ) : eligibleUsers.length === 0 ? (
              <Alert severity="info" sx={{ my: 1, borderRadius: '8px' }}>
                All user accounts with AGENT or TEAM_LEAD roles are already registered.
              </Alert>
            ) : (
              <TextField
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
        <DialogActions sx={{ p: 2.5 }}>
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
    </motion.div>
  );
};

export default ManageAgents;

