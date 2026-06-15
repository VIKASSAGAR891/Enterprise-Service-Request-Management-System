import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestAPI, userAPI, agentAPI, assetAPI, assignmentAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import {
  Grid,
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
  Avatar,
  LinearProgress,
  Card,
  CardContent
} from '@mui/material';
import {
  Users,
  ClipboardList,
  UserCheck,
  Activity,
  BarChart,
  HardDrive,
  UserPlus
} from 'lucide-react';
import CustomCard from '../../components/CustomCard';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    usersCount: 0,
    agentsCount: 0,
    assetsCount: 0,
    requestsCount: 0,
  });
  const [unassignedRequests, setUnassignedRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Assign Dialog States
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [assignError, setAssignError] = useState('');
  const [assigning, setAssigning] = useState(false);

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
      setAllRequests(allReqs);
      setUnassignedRequests(unassigned);
      setAgents(agentsRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      showNotification('Failed to retrieve system metrics from server', 'error');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleOpenAssign = (req) => {
    setSelectedRequest(req);
    setSelectedAgentId('');
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
      showNotification(`Request #${selectedRequest.requestId} assigned successfully!`, 'success');
      loadDashboardData(); // Reload dashboard
    } catch (err) {
      setAssigning(false);
      setAssignError('Failed to allocate agent. Please verify.');
      console.error(err);
    }
  };

  // Status Color Mappings
  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return '#8B80F9'; // Primary Accent
      case 'ASSIGNED': return '#0EA5E9'; // Info Blue
      case 'RESOLVED': return '#16A34A'; // Success Green
      case 'CLOSED': return '#6B7280'; // Grey
      case 'ESCALATED': return '#DC2626'; // Danger Red
      default: return '#6B7280';
    }
  };

  // SLA calculations (dynamic mock helper)
  const escalatedRequests = allRequests.filter(r => r.status === 'ESCALATED').length;
  const slaViolations = escalatedRequests; // Escalated tickets treated as SLA violations here
  const totalCompleted = allRequests.filter(r => r.status === 'RESOLVED' || r.status === 'CLOSED').length;
  const complianceRate = allRequests.length > 0 ? Math.round(((allRequests.length - escalatedRequests) / allRequests.length) * 100) : 100;



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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5, color: 'var(--text-primary)' }}>
            System Administration Console
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Overview of users, support specialists, assets, and service request timelines.
          </Typography>
        </Box>
      </Box>

      {/* Main Grid: Left (Metrics + Tables/Lists), Right (Widgets & Health) */}
      <Grid container spacing={4}>
        <Grid item xs={12} lg={8}>
          
          {/* Asymmetrical Stats Counters Grid */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Box
                className="uiverse-card"
                onClick={() => navigate('/admin/requests')}
                sx={{ height: '100%' }}
              >
                {/* Front Face: centered icon, title, and current value */}
                <Box className="card__front" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ClipboardList size={42} strokeWidth={1.5} />
                  </Box>
                  <span className="card__front-title">Service Request Console</span>
                  <span className="card__front-value">{stats.requestsCount} Requests</span>
                </Box>

                {/* Back Hover Face: detailed sub-metrics */}
                <Box className="card__content" sx={{ justifyContent: 'space-between', width: '100%', height: '100%', p: 2 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.75rem', display: 'block', mb: 0.5 }}
                  >
                    Service Request Console
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em', mb: 1 }}>
                    {stats.requestsCount} Total Requests
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, pt: 1, borderTop: '1px solid', borderColor: 'divider', width: '100%' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', fontSize: '0.7rem' }}>Unassigned</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'warning.main', mt: 0.25, fontSize: '0.8rem' }}>{unassignedRequests.length} pending</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', fontSize: '0.7rem' }}>SLA Compliance</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: complianceRate < 80 ? 'error.main' : 'success.main', mt: 0.25, fontSize: '0.8rem' }}>{complianceRate}%</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', fontSize: '0.7rem' }}>Catalog Assets</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mt: 0.25, fontSize: '0.8rem' }}>{stats.assetsCount} items</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Medium stats cards */}
            <Grid item xs={12} sm={6} md={3}>
              <CustomCard
                title="Total Users"
                value={stats.usersCount}
                trend="+8% this mo"
                icon={<Users size={42} strokeWidth={1.5} />}
                onClick={() => navigate('/admin/users')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <CustomCard
                title="Active Agents"
                value={stats.agentsCount}
                trend="+2 specialize"
                icon={<UserCheck size={42} strokeWidth={1.5} />}
                onClick={() => navigate('/admin/agents')}
              />
            </Grid>
          </Grid>

          {/* Unassigned Requests Table */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.01em' }}>
                Unassigned Requests ({unassignedRequests.length})
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/admin/requests')}
                sx={{
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  borderColor: 'divider',
                  color: 'text.secondary',
                  '&:hover': { borderColor: 'text.primary', color: 'text.primary' }
                }}
              >
                View All Requests
              </Button>
            </Box>

            {unassignedRequests.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
                <Typography variant="body2" color="text.secondary">
                  Excellent! All active service requests are currently allocated to agents.
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
                      <TableCell>Priority</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {unassignedRequests.map((req) => (
                      <TableRow key={req.requestId}>
                        <TableCell sx={{ fontWeight: 700 }}>#{req.requestId}</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>{req.title}</TableCell>
                        <TableCell>{req.employeeName}</TableCell>
                        <TableCell>
                          <Chip
                            label={req.priority}
                            size="small"
                            sx={{
                              backgroundColor: req.priority === 'CRITICAL' || req.priority === 'HIGH' ? 'rgba(220, 38, 38, 0.08)' : 'rgba(107, 114, 128, 0.08)',
                              color: req.priority === 'CRITICAL' || req.priority === 'HIGH' ? '#DC2626' : 'text.secondary',
                              fontWeight: 700,
                              borderRadius: '4px'
                            }}
                          />
                        </TableCell>
                        <TableCell>{req.categoryName || 'General'}</TableCell>
                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleOpenAssign(req)}
                            sx={{
                              py: 0.5,
                              px: 1.5,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              borderRadius: '4px',
                              border: '1px solid',
                              borderColor: 'primary.main',
                              color: 'primary.main',
                              '&:hover': {
                                backgroundColor: 'primary.main',
                                color: '#FFFFFF',
                                borderColor: 'primary.main'
                              }
                            }}
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
          </Box>

          {/* Quick Actions Panel */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: 'text.primary' }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Paper
                  onClick={() => navigate('/admin/users')}
                  sx={{
                    p: 2.5,
                    textAlign: 'center',
                    cursor: 'pointer',
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 'none',
                    backgroundImage: 'none',
                    backgroundColor: 'background.paper',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      borderColor: 'primary.main',
                    },
                    transition: 'all 0.15s ease'
                  }}
                >
                  <UserPlus size={22} strokeWidth={1.5} style={{ color: '#4F46E5', marginBottom: '8px' }} />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>Add User</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper
                  onClick={() => navigate('/admin/agents')}
                  sx={{
                    p: 2.5,
                    textAlign: 'center',
                    cursor: 'pointer',
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 'none',
                    backgroundImage: 'none',
                    backgroundColor: 'background.paper',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      borderColor: 'primary.main',
                    },
                    transition: 'all 0.15s ease'
                  }}
                >
                  <UserCheck size={22} strokeWidth={1.5} style={{ color: '#0D9488', marginBottom: '8px' }} />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>Add Agent</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper
                  onClick={() => navigate('/admin/assets')}
                  sx={{
                    p: 2.5,
                    textAlign: 'center',
                    cursor: 'pointer',
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 'none',
                    backgroundImage: 'none',
                    backgroundColor: 'background.paper',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      borderColor: 'primary.main',
                    },
                    transition: 'all 0.15s ease'
                  }}
                >
                  <HardDrive size={22} strokeWidth={1.5} style={{ color: '#EA580C', marginBottom: '8px' }} />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>Add Asset</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper
                  onClick={() => navigate('/admin/reports')}
                  sx={{
                    p: 2.5,
                    textAlign: 'center',
                    cursor: 'pointer',
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 'none',
                    backgroundImage: 'none',
                    backgroundColor: 'background.paper',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      borderColor: 'primary.main',
                    },
                    transition: 'all 0.15s ease'
                  }}
                >
                  <BarChart size={22} strokeWidth={1.5} style={{ color: '#7C3AED', marginBottom: '8px' }} />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>Reports</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* Right Sidebar Widgets */}
        <Grid item xs={12} lg={4}>
          {/* SLA Status Widget */}
          <Card sx={{ mb: 4, borderRadius: '12px' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5, color: 'text.primary' }}>
                SLA Status & Compliance
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    SLA Compliance Rate
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: complianceRate < 80 ? 'error.main' : 'success.main' }}>
                    {complianceRate}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={complianceRate}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'action.hover',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: complianceRate < 80 ? 'error.main' : 'success.main',
                    }
                  }}
                />
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Active Violations</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'error.main' }}>{slaViolations}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Resolved/Closed</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'success.main' }}>{totalCompleted}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Top Support Agent */}
          <Card sx={{ mb: 4, borderRadius: '12px' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: 'text.primary' }}>
                Active Agent Workload
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {agents.slice(0, 3).map((agent) => (
                  <Box key={agent.agentId} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem', fontWeight: 700, bgcolor: 'primary.main' }}>
                        {agent.fullName?.substring(0, 2).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{agent.fullName}</Typography>
                        <Typography variant="caption" color="text.secondary">Agent ID: #{agent.agentId}</Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={`${agent.workload || 0} active`}
                      size="small"
                      sx={{
                        backgroundColor: (agent.workload || 0) > 3 ? '#F59E0B15' : '#16A34A15',
                        color: (agent.workload || 0) > 3 ? '#F59E0B' : '#16A34A',
                        fontWeight: 700
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Recent System Activity Log */}
          <Card sx={{ borderRadius: '12px' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: 'text.primary' }}>
                Recent Activities
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {allRequests.slice(0, 4).map((req) => (
                  <Box key={req.requestId} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <Box sx={{ p: 1, borderRadius: '8px', backgroundColor: `${getStatusColor(req.status)}15`, color: getStatusColor(req.status), mt: 0.5 }}>
                      <Activity size={14} />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {req.employeeName} submitted Request #{req.requestId}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        "{req.title}" • {new Date(req.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

        </Grid>
      </Grid>

      {/* Assign Request Dialog */}
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
            label="Support Agent Allocator"
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            helperText="Select from active agents with work load display"
          >
            {agents.map((agent) => (
              <MenuItem key={agent.agentId} value={agent.agentId}>
                {agent.fullName} (Workload: {agent.workload} active tickets)
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
            {assigning ? 'Allocating...' : 'Assign Agent'}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default AdminDashboard;

