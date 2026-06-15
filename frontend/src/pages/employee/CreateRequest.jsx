import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { assetAPI, requestAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { ArrowLeft, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORIES = [
  { id: 1, name: 'Software' },
  { id: 2, name: 'Hardware' },
  { id: 3, name: 'Network' },
  { id: 4, name: 'Database' },
  { id: 5, name: 'Email' },
  { id: 6, name: 'Security' },
  { id: 7, name: 'Access Management' },
];

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const CreateRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const { showNotification } = useNotification();

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assetId, setAssetId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);



  const fetchAssets = async () => {
    try {
      const response = await assetAPI.getAssets();
      setAssets(response.data);
      setLoadingAssets(false);
    } catch (err) {
      console.error('Error fetching assets:', err);
      showNotification('Failed to read assets inventory', 'error');
      setLoadingAssets(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !assetId || !categoryId || !priority) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const requestData = {
        userId: user.userId,
        assetId: parseInt(assetId),
        categoryId: parseInt(categoryId),
        title,
        description,
        priority,
      };

      await requestAPI.createRequest(requestData);
      setSubmitting(false);
      showNotification('IT service request submitted successfully!', 'success');
      navigate('/employee-dashboard');
    } catch (err) {
      setSubmitting(false);
      setError('Failed to submit request. Please verify inputs.');
      console.error(err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 1 }}>
        <Button
          variant="text"
          startIcon={<ArrowLeft size={16} />}
          onClick={() => navigate('/employee-dashboard')}
          sx={{ mb: 2, textTransform: 'none', color: 'text.secondary', fontWeight: 600 }}
        >
          Back to Dashboard
        </Button>

        <Card
          sx={{
            borderRadius: '12px',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 'none',
          }}
        >
          <CardContent sx={{ p: { xs: 4, sm: 5 } }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em', color: 'text.primary' }}>
              Submit a New Service Request
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Fill in details about the hardware, software, or network issue you are experiencing.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
                {error}
              </Alert>
            )}

            {loadingAssets ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                    Request Title
                  </Typography>
                  <TextField
                    required
                    fullWidth
                    placeholder="e.g. Printer offline, Cannot connect to VPN"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                      Category
                    </Typography>
                    <TextField
                      required
                      select
                      fullWidth
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                    >
                      {CATEGORIES.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                      Priority Level
                    </Typography>
                    <TextField
                      required
                      select
                      fullWidth
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      {PRIORITIES.map((pri) => (
                        <MenuItem key={pri} value={pri}>
                          {pri}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                    Affected Enterprise Asset
                  </Typography>
                  <TextField
                    required
                    select
                    fullWidth
                    value={assetId}
                    onChange={(e) => setAssetId(e.target.value)}
                    helperText="Associate this request with the specific cataloged hardware asset"
                  >
                    {assets.map((asset) => (
                      <MenuItem key={asset.assetId} value={asset.assetId}>
                        {asset.assetName} ({asset.assetType})
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                    Detailed Issue Description
                  </Typography>
                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Describe the error, replication steps, or hardware faults in detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Box>

                <Divider />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/employee-dashboard')}
                    sx={{ borderRadius: '8px' }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <Send size={16} />}
                    disabled={submitting}
                    sx={{ borderRadius: '8px', fontWeight: 700 }}
                  >
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </motion.div>
  );
};

export default CreateRequest;

