import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { assetAPI, requestAPI } from '../../services/api';
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
} from '@mui/material';
import { ArrowBack as BackIcon, Send as SendIcon } from '@mui/icons-material';

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

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assetId, setAssetId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await assetAPI.getAssets();
      setAssets(response.data);
      setLoadingAssets(false);
    } catch (err) {
      console.error('Error fetching assets:', err);
      setLoadingAssets(false);
    }
  };

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
      navigate('/employee-dashboard');
    } catch (err) {
      setSubmitting(false);
      setError('Failed to submit request. Please try again.');
      console.error(err);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Button
        variant="text"
        startIcon={<BackIcon />}
        onClick={() => navigate('/employee-dashboard')}
        sx={{ mb: 2, textTransform: 'none' }}
      >
        Back to Dashboard
      </Button>

      <Card sx={{ boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
            Submit a New Service Request
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {loadingAssets ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Request Title"
                    placeholder="Brief summary of the issue (e.g. Broken keyboard, Reset DB password)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    select
                    fullWidth
                    label="Category"
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
                  <TextField
                    required
                    select
                    fullWidth
                    label="Priority"
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

                <Grid item xs={12}>
                  <TextField
                    required
                    select
                    fullWidth
                    label="Associated Asset"
                    value={assetId}
                    onChange={(e) => setAssetId(e.target.value)}
                    helperText="Select the device or hardware affected by this issue"
                  >
                    {assets.map((asset) => (
                      <MenuItem key={asset.assetId} value={asset.assetId}>
                        {asset.assetName} ({asset.assetType})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={4}
                    label="Detailed Description"
                    placeholder="Please explain the issue or details of your request in full..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/employee-dashboard')}
                    sx={{ textTransform: 'none' }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SendIcon />}
                    disabled={submitting}
                    sx={{ textTransform: 'none', fontWeight: 'bold' }}
                  >
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateRequest;
