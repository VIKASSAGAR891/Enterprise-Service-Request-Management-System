import { useState, useEffect } from 'react';
import { requestAPI, agentAPI, assignmentAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  InputAdornment,
  TablePagination
} from '@mui/material';
import { UserCheck, Trash2, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const STATUSES = ['ALL', 'OPEN', 'ASSIGNED', 'RESOLVED', 'CLOSED', 'ESCALATED'];

const ViewRequests = () => {
  const [requests, setRequests] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { showNotification } = useNotification();

  // Search & Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Assign Dialog States
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [assignError, setAssignError] = useState('');
  const [assigning, setAssigning] = useState(false);



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
      showNotification('Failed to retrieve service requests', 'error');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequestsAndAgents();
  }, [statusFilter]);

  const handleOpenAssign = (req) => {
    setSelectedRequest(req);
    setSelectedAgentId(req.agentId > 0 ? req.agentId : '');
    setAssignError('');
    setAssignDialogOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedAgentId) {
      setAssignError('Please select a support agent');
      return;
    }
    setAssignError('');
    setAssigning(true);
    try {
      await assignmentAPI.createAssignment(selectedRequest.requestId, selectedAgentId);
      setAssigning(false);
      setAssignDialogOpen(false);
      showNotification(`Ticket #${selectedRequest.requestId} assigned to agent.`, 'success');
      loadRequestsAndAgents();
    } catch (err) {
      setAssigning(false);
      setAssignError('Failed to allocate agent to ticket');
      console.error(err);
    }
  };

  const handleDeleteRequest = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this service request? This action deletes all associated assign logs.')) {
      try {
        await requestAPI.deleteRequest(id);
        showNotification('Service request deleted.', 'info');
        loadRequestsAndAgents();
      } catch (err) {
        console.error(err);
        showNotification('Failed to delete service request', 'error');
      }
    }
  };

  const getStatusColors = (status) => {
    switch (status) {
      case 'OPEN': return { bg: '#8B80F915', text: '#8B80F9' };
      case 'ASSIGNED': return { bg: '#0EA5E915', text: '#0EA5E9' };
      case 'RESOLVED': return { bg: '#16A34A15', text: '#16A34A' };
      case 'CLOSED': return { bg: '#6B728015', text: '#6B7280' };
      case 'ESCALATED': return { bg: '#DC262615', text: '#DC2626' };
      default: return { bg: '#E5E7EB', text: '#374151' };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return '#DC2626';
      case 'HIGH': return '#EA580C';
      case 'MEDIUM': return '#D97706';
      case 'LOW':
      default: return '#16A34A';
    }
  };

  // Searching logic
  const filteredRequests = requests.filter((req) => {
    return (
      req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.agentName && req.agentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      String(req.requestId).includes(searchTerm)
    );
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5, color: 'var(--text-primary)' }}>
            All Service Requests
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Monitor, assign, escalate, and resolve all database, software, hardware, and network tickets.
          </Typography>
        </Box>
        
        <TextField
          select
          size="small"
          label="Filter by Status"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          sx={{ width: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Filter size={16} color="#94A3B8" />
              </InputAdornment>
            ),
          }}
        >
          {STATUSES.map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Search Bar Panel */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: '12px', border: '1px solid', borderColor: 'divider', display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Search requests by title, assignee name, employee, or request ID..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={16} color="#94A3B8" />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
          <CircularProgress />
        </Box>
      ) : filteredRequests.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
          <Typography variant="body2" color="text.secondary">
            No service requests found matching the active criteria.
          </Typography>
        </Paper>
      ) : (
        <TableContainer className="modern-table-container">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Employee</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assignee</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRequests.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((req) => {
                const statusColors = getStatusColors(req.status);
                const priorityColor = getPriorityColor(req.priority);
                return (
                  <TableRow key={req.requestId} hover>
                    <TableCell sx={{ fontWeight: 700 }}>#{req.requestId}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>{req.title}</TableCell>
                    <TableCell>{req.employeeName}</TableCell>
                    <TableCell>{req.categoryName || 'General'}</TableCell>
                    <TableCell>
                      <Chip
                        label={req.priority}
                        size="small"
                        sx={{
                          backgroundColor: `${priorityColor}15`,
                          color: priorityColor,
                          fontWeight: 700,
                          borderRadius: '6px'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={req.status}
                        size="small"
                        sx={{
                          backgroundColor: statusColors.bg,
                          color: statusColors.text,
                          fontWeight: 700,
                          borderRadius: '6px'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: req.agentId > 0 ? 600 : 400 }}>
                      {req.agentId > 0 ? req.agentName : <Typography variant="caption" color="text.secondary">Unassigned</Typography>}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8125rem' }}>{new Date(req.createdAt).toLocaleString()}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        {(req.status === 'OPEN' || req.status === 'ASSIGNED' || req.status === 'ESCALATED') && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<UserCheck size={14} />}
                            onClick={() => handleOpenAssign(req)}
                            sx={{ py: 0.5, borderRadius: '6px' }}
                          >
                            Assign
                          </Button>
                        )}
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<Trash2 size={14} />}
                          onClick={() => handleDeleteRequest(req.requestId)}
                          sx={{
                            py: 0.5,
                            borderRadius: '6px',
                            borderColor: (theme) => `${theme.palette.error.main}30`
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredRequests.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      )}

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800 }}>Assign Service Request</DialogTitle>
        <DialogContent dividers sx={{ py: 3 }}>
          {assignError && <Alert severity="error" sx={{ mb: 2 }}>{assignError}</Alert>}
          {selectedRequest && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: '8px' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Request #{selectedRequest.requestId}: {selectedRequest.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Priority: {selectedRequest.priority} | Category: {selectedRequest.categoryName || 'General'}
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
            helperText="Choose active agent for SLA dispatch"
          >
            {agents.map((agent) => (
              <MenuItem key={agent.agentId} value={agent.agentId}>
                {agent.fullName} (Workload: {agent.workload} active requests)
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAssign}
            disabled={assigning}
          >
            {assigning ? 'Allocating...' : 'Assign Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default ViewRequests;

