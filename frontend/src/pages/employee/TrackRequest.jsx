import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { requestAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
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
  MenuItem,
  Step,
  Stepper,
  StepLabel,
  Paper
} from '@mui/material';
import { ArrowLeft, Edit, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const TrackRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

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



  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      const response = await requestAPI.getRequestById(id);
      setRequest(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching request details:', err);
      showNotification('Failed to read ticket logs from server', 'error');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

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
      showNotification('Request ticket details updated.', 'success');
      fetchRequestDetails();
    } catch (err) {
      console.error(err);
      setEditError('Failed to update request settings');
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
      showNotification('Ticket closed successfully.', 'info');
      fetchRequestDetails();
    } catch (err) {
      console.error(err);
      setCloseError('Failed to close request');
    }
  };

  const getStatusStep = (status) => {
    switch (status) {
      case 'OPEN': return 0;
      case 'ASSIGNED': return 1;
      case 'ESCALATED': return 1;
      case 'RESOLVED': return 2;
      case 'CLOSED': return 3;
      default: return 0;
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!request) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" variant="body1">Request not found.</Typography>
        <Button onClick={() => navigate('/employee-dashboard')} sx={{ mt: 2 }}>Back</Button>
      </Box>
    );
  }

  const isEditable = request.status === 'OPEN';
  const isClosable = request.status !== 'CLOSED';
  const activeStep = getStatusStep(request.status);
  const statusColors = getStatusColors(request.status);

  // Stepper labels
  const steps = ['Logged', 'Agent Dispatched', 'Resolved', 'Closed'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Box sx={{ maxWidth: 900, mx: 'auto', p: 1 }}>
        <Button
          variant="text"
          startIcon={<ArrowLeft size={16} />}
          onClick={() => navigate('/employee-dashboard')}
          sx={{ mb: 3, textTransform: 'none', color: 'text.secondary', fontWeight: 600 }}
        >
          Back to Dashboard
        </Button>

        {/* Status Stepper Progression */}
        <Paper sx={{ p: 4, mb: 4, borderRadius: '12px', border: '1px solid', borderColor: 'divider', boxShadow: 'none', backgroundImage: 'none' }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => {
              const labelProps = {};
              if (index === 1 && request.status === 'ESCALATED') {
                labelProps.error = true;
                labelProps.optional = (
                  <Typography variant="caption" color="error" sx={{ fontWeight: 700 }}>
                    Escalated
                  </Typography>
                );
              }
              return (
                <Step key={label}>
                  <StepLabel {...labelProps}>{label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
        </Paper>

        <Card sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'divider', boxShadow: 'none', mb: 4 }}>
          <CardContent sx={{ p: { xs: 4, sm: 5 } }}>
            {/* Header Title */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 3 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em', color: 'text.primary' }}>
                  Request #{request.requestId}: {request.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Submitted on {new Date(request.createdAt).toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  label={request.status}
                  sx={{
                    backgroundColor: statusColors.bg,
                    color: statusColors.text,
                    fontWeight: 700,
                    borderRadius: '4px'
                  }}
                />
                <Chip
                  label={`${request.priority} Priority`}
                  variant="outlined"
                  sx={{ fontWeight: 600, borderRadius: '4px' }}
                />
              </Box>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Content description + Sidebar */}
            <Grid container spacing={4} sx={{ mb: 4 }}>
              <Grid item xs={12} md={7}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}>
                  Description
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary', mb: 4 }}>
                  {request.description}
                </Typography>

                {request.resolution && (
                  <Box
                    sx={{
                      bgcolor: 'success.main',
                      backgroundColor: (theme) => theme.palette.mode === 'light' ? '#16A34A0B' : '#22C55E15',
                      p: 2.5,
                      borderRadius: '12px',
                      borderLeft: '4px solid',
                      borderColor: 'success.main',
                      mb: 3
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'success.main', mb: 0.5 }}>
                      Resolution Notes
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      {request.resolution}
                    </Typography>
                  </Box>
                )}
              </Grid>

              {/* Sidebar Metadata Card */}
              <Grid item xs={12} md={5}>
                <Card variant="outlined" sx={{ bgcolor: 'action.hover', borderRadius: '12px', borderColor: 'divider' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2.5, color: 'text.primary' }}>
                      Ticket Information
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Category</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{request.categoryName || 'General'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Asset ID</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>#{request.assetId} ({request.assetName || 'Hardware'})</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Support Assignee</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: request.agentId > 0 ? 'primary.main' : 'text.secondary' }}>
                          {request.agentId > 0 ? request.agentName : 'Awaiting assignment'}
                        </Typography>
                      </Box>
                      {request.assignedAt && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Assigned Date</Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>{new Date(request.assignedAt).toLocaleString()}</Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Divider sx={{ mb: 4 }} />

            {/* Actions Panel */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 2 }}>
              {isEditable && (
                <Button
                  variant="outlined"
                  startIcon={<Edit size={16} />}
                  onClick={handleOpenEdit}
                  sx={{ borderRadius: '8px' }}
                >
                  Update Details
                </Button>
              )}
              
              {isClosable && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setCloseDialogOpen(true)}
                  sx={{ borderRadius: '8px', borderColor: (theme) => `${theme.palette.error.main}40` }}
                >
                  Close Request
                </Button>
              )}

              {request.status === 'RESOLVED' && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircle size={16} />}
                  onClick={() => {
                    setCloseResolution('Resolution confirmed by employee');
                    setCloseDialogOpen(true);
                  }}
                  sx={{ borderRadius: '8px', fontWeight: 700 }}
                >
                  Confirm Resolution & Close
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Edit Request Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle sx={{ fontWeight: 800 }}>Update Request Details</DialogTitle>
          <DialogContent dividers sx={{ py: 3 }}>
            {editError && <Alert severity="error" sx={{ mb: 2 }}>{editError}</Alert>}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                fullWidth
                required
                label="Request Title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
              <TextField
                fullWidth
                required
                select
                label="Priority level"
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
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
                label="Detailed Description"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleUpdate}>Save Changes</Button>
          </DialogActions>
        </Dialog>

        {/* Close Request Dialog */}
        <Dialog open={closeDialogOpen} onClose={() => setCloseDialogOpen(false)} fullWidth maxWidth="xs">
          <DialogTitle sx={{ fontWeight: 800 }}>Close Service Request</DialogTitle>
          <DialogContent dividers sx={{ py: 3 }}>
            {closeError && <Alert severity="error" sx={{ mb: 2 }}>{closeError}</Alert>}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Are you sure you want to close this request? Please provide feedback or final resolution comments below.
            </Typography>
            <TextField
              fullWidth
              required
              multiline
              rows={3}
              label="Closure Notes / Comments"
              value={closeResolution}
              onChange={(e) => setCloseResolution(e.target.value)}
              placeholder="e.g. Printer is working perfectly now, Resolution verified..."
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setCloseDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleCloseRequest}>Close Request</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </motion.div>
  );
};

export default TrackRequest;

