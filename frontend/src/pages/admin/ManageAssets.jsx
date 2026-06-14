import React, { useState, useEffect } from 'react';
import { assetAPI } from '../../services/api';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const ManageAssets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState(null);

  // Form States
  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await assetAPI.getAssets();
      setAssets(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch assets');
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEdit(false);
    setSelectedAssetId(null);
    setAssetName('');
    setAssetType('');
    // Default to today
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setError('');
    setOpenDialog(true);
  };

  const handleOpenEdit = (asset) => {
    setIsEdit(true);
    setSelectedAssetId(asset.assetId);
    setAssetName(asset.assetName);
    setAssetType(asset.assetType);
    setPurchaseDate(asset.purchaseDate || '');
    setError('');
    setOpenDialog(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!assetName || !assetType || !purchaseDate) {
      setError('All fields are required');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      if (isEdit) {
        await assetAPI.updateAsset(selectedAssetId, { assetName, assetType, purchaseDate });
      } else {
        await assetAPI.addAsset({ assetName, assetType, purchaseDate });
      }
      setSubmitting(false);
      setOpenDialog(false);
      fetchAssets();
    } catch (err) {
      setSubmitting(false);
      setError('Failed to save asset details');
      console.error(err);
    }
  };

  const handleDelete = async (assetId) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await assetAPI.deleteAsset(assetId);
        fetchAssets();
      } catch (err) {
        console.error(err);
        alert('Failed to delete asset');
      }
    }
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
          Managed Enterprise Assets
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{ textTransform: 'none', fontWeight: 'bold' }}
        >
          Add Asset
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Asset ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Asset Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Asset Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Purchase Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset.assetId} hover>
                <TableCell>{asset.assetId}</TableCell>
                <TableCell sx={{ fontWeight: 'medium' }}>{asset.assetName}</TableCell>
                <TableCell>{asset.assetType}</TableCell>
                <TableCell>{asset.purchaseDate || 'N/A'}</TableCell>
                <TableCell align="center">
                  <IconButton color="primary" onClick={() => handleOpenEdit(asset)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(asset.assetId)}>
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
          {isEdit ? 'Modify Asset Profile' : 'Register New Asset'}
        </DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSave}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Asset Name"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              placeholder="e.g. MacBook Pro, Logitech Mouse"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Asset Type"
              value={assetType}
              onChange={(e) => setAssetType(e.target.value)}
              placeholder="e.g. Laptop, Mouse, Monitor"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              type="date"
              label="Purchase Date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save Asset'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageAssets;
