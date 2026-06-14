import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { agentAPI, requestAPI } from '../../services/api';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  DoneAll as ResolveIcon,
  TrendingUp as EscalateIcon,
  InfoOutlined as InfoIcon,
  SupportAgent as AgentIcon,
} from '@mui/icons-material';

const AgentDashboard = () => {
  const { user } = useAuth();
  const [agent, setAgent] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Action Dialog States
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [resolutionText, setResolutionText] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Details Dialog State
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [viewedRequest, setViewedRequest] = useState(null);

  useEffect(() => {
    loadAgentData();
  }, []);

  const loadAgentData = async () => {
    try {
      setLoading(true);
      // 1. Get Agent ID
      const agentRes = await agentAPI.getAgentByUserId(user.userId);
      const agentData = agentRes.data;
      setAgent(agentData);

      // 2. Get Requests assigned to this Agent
      const requestsRes = await requestAPI.getRequests({ agentId: agentData.agentId });
      setRequests(requestsRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load agent dashboard details:', err);
      setLoading(false);
    }
  };

  const handleOpenResolve = (req) => {
    setSelectedRequest(req);
    setResolutionText('');
    setError('');
    setResolveDialogOpen(true);
  };

  const handleResolve = async () => {
    if (!resolutionText) {
      setError('Please provide resolution details');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await requestAPI.updateRequestStatus(selectedRequest.requestId, 'RESOLVED', resolutionText);
      setSubmitting(false);
      setResolveDialogOpen(false);
      loadAgentData(); // Reload requests list
    } catch (err) {
      setSubmitting(false);
      setError('Failed to resolve request. Please try again.');
      console.error(err);
    }
  };

  const handleEscalate = async (requestId) => {
    if (window.confirm('Are you sure you want to escalate this request? It will increase priority to CRITICAL.')) {
      try {
        await requestAPI.escalateRequest(requestId);
        loadAgentData();
      } catch (err) {
        console.error('Failed to escalate request:', err);
      }
    }
  };

  const handleViewDetails = (req) => {
    setViewedRequest(req);
    setDetailsDialogOpen(true);
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

  const pendingRequests = requests.filter(r => r.status === 'ASSIGNED' || r.status === 'ESCALATED');
  const resolvedRequests = requests.filter(r => r.status === 'RESOLVED' || r.status === 'CLOSED');

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <AgentIcon color="primary" sx={{ fontSize: 36 }} />
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Agent Dashboard - Assigned Workspace
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderLeft: '4px solid #1976d2' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                PENDING REQUESTS
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                {pendingRequests.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderLeft: '4px solid #2e7d32' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                RESOLVED BY ME
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                {resolvedRequests.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderLeft: '4px solid #e53935' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                TOTAL ASSIGNED
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#e53935' }}>
                {requests.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Requests table */}
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
        Assigned Requests
      </Typography>

      {requests.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#fafafa' }}>
          <InfoIcon color="action" sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            No service requests are assigned to you at the moment.
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
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Assigned Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.requestId} hover>
                  <TableCell>{req.requestId}</TableCell>
                  <TableCell
                    sx={{ fontWeight: 'medium', cursor: 'pointer', color: '#1976d2', '&:hover': { textDecoration: 'underline' } }}
                    onClick={() => handleViewDetails(req)}
                  >
                    {req.title}
                  </TableCell>
                  <TableCell>{req.employeeName}</TableCell>
                  <TableCell>
                    <Chip
                      label={req.priority}
                      size="small"
                      color={
                        req.priority === 'CRITICAL' || req.priority === 'HIGH' ? 'error' : 'default'
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
                    {req.assignedAt ? new Date(req.assignedAt).toLocaleString() : 'N/A'}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<InfoIcon />}
                        onClick={() => handleViewDetails(req)}
                        sx={{ textTransform: 'none' }}
                      >
                        Details
                      </Button>
                      
                      {(req.status === 'ASSIGNED' || req.status === 'ESCALATED') && (
                        <>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<ResolveIcon />}
                            onClick={() => handleOpenResolve(req)}
                            sx={{ textTransform: 'none' }}
                          >
                            Resolve
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<EscalateIcon />}
                            onClick={() => handleEscalate(req.requestId)}
                            sx={{ textTransform: 'none' }}
                          >
                            Escalate
                          </Button>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Resolve Request Dialog */}
      <Dialog open={resolveDialogOpen} onClose={() => setResolveDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Resolve Service Request</DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Typography variant="body2" sx={{ mb: 2 }} color="text.secondary">
            Provide the details of how this request was resolved (e.g. resolution notes, diagnostic steps, etc.). This will notify the employee.
          </Typography>
          <TextField
            fullWidth
            required
            multiline
            rows={4}
            label="Resolution Notes"
            value={resolutionText}
            onChange={(e) => setResolutionText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleResolve}
            disabled={submitting}
          >
            {submitting ? 'Resolving...' : 'Submit Resolution'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Request Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} fullWidth maxWidth="sm">
        {viewedRequest && (
          <>
            <DialogTitle sx={{ fontWeight: 'bold' }}>
              Request #{viewedRequest.requestId}: {viewedRequest.title}
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Employee:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{viewedRequest.employeeName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Asset:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{viewedRequest.assetName || 'Hardware'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Category:</Typography>
                  <Typography variant="body2">{viewedRequest.categoryName || 'General'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Status:</Typography>
                  <Box sx={{ mt: 0.5 }}><Chip label={viewedRequest.status} size="small" color={getStatusColor(viewedRequest.status)} /></Box>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Description:</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: '#444', mb: 3 }}>
                {viewedRequest.description}
              </Typography>
              
              {viewedRequest.resolution && (
                <Box sx={{ bgcolor: '#e8f5e9', p: 2, borderRadius: 1, borderLeft: '4px solid #2e7d32' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1b5e20', mb: 0.5 }}>
                    Resolution Notes:
                  </Typography>
                  <Typography variant="body2" color="#1b5e20">
                    {viewedRequest.resolution}
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AgentDashboard;
