import { useState, useEffect } from 'react';
import { assetAPI } from '../../services/api';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  CircularProgress,
  InputAdornment,
  TablePagination
} from '@mui/material';
import { PlusCircle, Search, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ManageAssets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showNotification } = useNotification();

  // Search & Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState(null);

  // Form States
  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [submitting, setSubmitting] = useState(false);



  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await assetAPI.getAssets();
      setAssets(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch enterprise assets');
      showNotification('Could not read hardware/software assets catalog from database', 'error');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleOpenAdd = () => {
    setIsEdit(false);
    setSelectedAssetId(null);
    setAssetName('');
    setAssetType('');
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
        showNotification('Asset updated successfully!', 'success');
      } else {
        await assetAPI.addAsset({ assetName, assetType, purchaseDate });
        showNotification('New asset registered in inventory.', 'success');
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
    if (window.confirm('Are you sure you want to delete this asset record from inventory?')) {
      try {
        await assetAPI.deleteAsset(assetId);
        showNotification('Asset deleted from registry.', 'info');
        fetchAssets();
      } catch (err) {
        console.error(err);
        showNotification('Failed to remove asset', 'error');
      }
    }
  };

  // Filtered Assets Search Logic
  const filteredAssets = assets.filter((asset) => {
    return (
      asset.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.assetType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(asset.assetId).includes(searchTerm)
    );
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
            Managed Enterprise Assets
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Register and manage laptop hardware, servers, databases, and general infrastructure inventory.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PlusCircle size={18} />}
          onClick={handleOpenAdd}
          sx={{ fontWeight: 700, borderRadius: '8px' }}
        >
          Add Asset
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}

      {/* Search Header Panel */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: '12px', border: '1px solid', borderColor: 'divider', display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Search by asset name, type, or asset ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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

      {/* Assets Table */}
      <TableContainer className="modern-table-container">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Asset ID</TableCell>
              <TableCell>Asset Name</TableCell>
              <TableCell>Asset Type</TableCell>
              <TableCell>Purchase Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAssets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((asset) => (
              <TableRow key={asset.assetId} hover>
                <TableCell sx={{ fontWeight: 700 }}>#{asset.assetId}</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>{asset.assetName}</TableCell>
                <TableCell>{asset.assetType}</TableCell>
                <TableCell>{asset.purchaseDate || 'N/A'}</TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenEdit(asset)}
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
                      onClick={() => handleDelete(asset.assetId)}
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
            {filteredAssets.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No hardware/software assets match your search term.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredAssets.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800 }}>
          {isEdit ? 'Modify Asset Profile' : 'Register New Asset'}
        </DialogTitle>
        <DialogContent dividers sx={{ py: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              required
              fullWidth
              label="Asset Name"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              placeholder="e.g. MacBook Pro, Dell Latitude"
            />
            <TextField
              required
              fullWidth
              label="Asset Type"
              value={assetType}
              onChange={(e) => setAssetType(e.target.value)}
              placeholder="e.g. Laptop, Keyboard, Monitor"
            />
            <TextField
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
        <DialogActions sx={{ p: 2.5 }}>
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
    </motion.div>
  );
};

export default ManageAssets;

