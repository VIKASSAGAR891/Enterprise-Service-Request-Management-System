import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { requestAPI } from '../../services/api';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  CheckCircle as ConfirmIcon,
} from '@mui/icons-material';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const TrackRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editError, setEditError] = useState('');

  // Close State
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [closeResolution, setCloseResolution] = useState('');
  const [closeError, setCloseError] = useState('');

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      const response = await requestAPI.getRequestById(id);
      setRequest(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching request details:', err);
      setLoading(false);
    }
  };

  const handleOpenEdit = () => {
    if (request) {
      setEditTitle(request.title);
      setEditDesc(request.description);
      setEditPriority(request.priority);
      setEditDialogOpen(true);
    }
  };

  const handleUpdate = async () => {
    if (!editTitle || !editDesc || !editPriority) {
      setEditError('All fields are required');
      return;
    }
    setEditError('');
    try {
      await requestAPI.updateRequest(id, {
        title: editTitle,
        description: editDesc,
        priority: editPriority,
      });
      setEditDialogOpen(false);
      fetchRequestDetails();
    } catch (err) {
      console.error(err);
      setEditError('Failed to update request');
    }
  };

  const handleCloseRequest = async () => {
    if (!closeResolution) {
      setCloseError('Please provide closure notes / comments');
      return;
    }
    setCloseError('');
    try {
      await requestAPI.updateRequestStatus(id, 'CLOSED', closeResolution);
      setCloseDialogOpen(false);
      fetchRequestDetails();
    } catch (err) {
      console.error(err);
      setCloseError('Failed to close request');
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!request) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Request not found.</Typography>
        <Button onClick={() => navigate('/employee-dashboard')} sx={{ mt: 2 }}>Back</Button>
      </Box>
    );
  }

  const isEditable = request.status === 'OPEN';
  const isClosable = request.status !== 'CLOSED';

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Button
        variant="text"
        startIcon={<BackIcon />}
        onClick={() => navigate('/employee-dashboard')}
        sx={{ mb: 2, textTransform: 'none' }}
      >
        Back to Dashboard
      </Button>

      <Card sx={{ boxShadow: 3, mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                Request #{request.requestId}: {request.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Submitted on {new Date(request.createdAt).toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Chip label={request.status} color={getStatusColor(request.status)} sx={{ fontWeight: 'bold' }} />
              <Chip label={`${request.priority} Priority`} variant="outlined" />
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Details */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Description
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: '#444', mb: 3 }}>
                {request.description}
              </Typography>

              {request.resolution && (
                <Box sx={{ bgcolor: '#e8f5e9', p: 2, borderRadius: 1, borderLeft: '4px solid #2e7d32', mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1b5e20', mb: 0.5 }}>
                    Resolution Notes
                  </Typography>
                  <Typography variant="body2" color="#1b5e20">
                    {request.resolution}
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ bgcolor: '#fafafa', border: '1px solid #e0e0e0' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Metadata
                  </Typography>
                  <Grid container spacing={1.5}>
                    <Grid item xs={5}><Typography variant="caption" color="text.secondary">Category:</Typography></Grid>
                    <Grid item xs={7}><Typography variant="body2">{request.categoryName || 'General'}</Typography></Grid>

                    <Grid item xs={5}><Typography variant="caption" color="text.secondary">Asset ID:</Typography></Grid>
                    <Grid item xs={7}><Typography variant="body2">{request.assetId} ({request.assetName || 'Hardware'})</Typography></Grid>

                    <Grid item xs={5}><Typography variant="caption" color="text.secondary">Agent Assigned:</Typography></Grid>
                    <Grid item xs={7}>
                      <Typography variant="body2">
                        {request.agentId > 0 ? request.agentName : 'Unassigned'}
                      </Typography>
                    </Grid>

                    {request.assignedAt && (
                      <>
                        <Grid item xs={5}><Typography variant="caption" color="text.secondary">Assigned At:</Typography></Grid>
                        <Grid item xs={7}><Typography variant="body2">{new Date(request.assignedAt).toLocaleString()}</Typography></Grid>
                      </>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            {isEditable && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleOpenEdit}
                sx={{ textTransform: 'none' }}
              >
                Update Details
              </Button>
            )}
            
            {isClosable && (
              <Button
                variant="contained"
                color="error"
                startIcon={<CloseIcon />}
                onClick={() => setCloseDialogOpen(true)}
                sx={{ textTransform: 'none' }}
              >
                Close Request
              </Button>
            )}

            {request.status === 'RESOLVED' && (
              <Button
                variant="contained"
                color="success"
                startIcon={<ConfirmIcon />}
                onClick={() => {
                  setCloseResolution('Resolution confirmed by employee');
                  setCloseDialogOpen(true);
                }}
                sx={{ textTransform: 'none' }}
              >
                Confirm Resolution & Close
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Edit Request Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Update Request Details</DialogTitle>
        <DialogContent dividers>
          {editError && <Alert severity="error" sx={{ mb: 2 }}>{editError}</Alert>}
          <TextField
            fullWidth
            required
            label="Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            required
            select
            label="Priority"
            value={editPriority}
            onChange={(e) => setEditPriority(e.target.value)}
            sx={{ mb: 2 }}
          >
            {PRIORITIES.map((pri) => (
              <MenuItem key={pri} value={pri}>{pri}</MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            required
            multiline
            rows={4}
            label="Description"
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Close Request Dialog */}
      <Dialog open={closeDialogOpen} onClose={() => setCloseDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Close Service Request</DialogTitle>
        <DialogContent dividers>
          {closeError && <Alert severity="error" sx={{ mb: 2 }}>{closeError}</Alert>}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Are you sure you want to close this request? Please provide feedback or closure comments below.
          </Typography>
          <TextField
            fullWidth
            required
            multiline
            rows={3}
            label="Closure Comments / Resolution"
            value={closeResolution}
            onChange={(e) => setCloseResolution(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloseDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleCloseRequest}>Close Request</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TrackRequest;
