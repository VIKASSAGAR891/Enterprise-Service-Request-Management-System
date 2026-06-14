import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Drawer,
  AppBar,
  CssBaseline,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AddCircle as AddCircleIcon,
  ListAlt as ListAltIcon,
  People as PeopleIcon,
  SupportAgent as AgentIcon,
  Devices as AssetIcon,
  Assessment as ReportIcon,
  AssignmentTurnedIn as AssignmentIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define navigation items based on role
  const getNavItems = () => {
    const role = user.role ? user.role.toUpperCase() : '';
    if (role === 'ADMIN') {
      return [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin-dashboard' },
        { text: 'Manage Users', icon: <PeopleIcon />, path: '/admin/users' },
        { text: 'Manage Agents', icon: <AgentIcon />, path: '/admin/agents' },
        { text: 'Manage Assets', icon: <AssetIcon />, path: '/admin/assets' },
        { text: 'View Requests', icon: <ListAltIcon />, path: '/admin/requests' },
        { text: 'Reports', icon: <ReportIcon />, path: '/admin/reports' },
      ];
    } else if (role === 'AGENT' || role === 'TEAM_LEAD') {
      return [
        { text: 'Assigned Requests', icon: <AssignmentIcon />, path: '/agent-dashboard' },
      ];
    } else {
      // EMPLOYEE
      return [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/employee-dashboard' },
        { text: 'Create Request', icon: <AddCircleIcon />, path: '/create-request' },
        { text: 'My Requests', icon: <ListAltIcon />, path: '/my-requests' },
      ];
    }
  };

  const menuItems = getNavItems();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f6f8' }}>
      <CssBaseline />
      
      {/* Top Navbar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: '#1976d2' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', letterSpacing: 0.5 }}>
            Enterprise Service Request Management System (ESRMS)
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ bgcolor: 'rgba(255,255,255,0.15)', px: 1.5, py: 0.5, borderRadius: 1 }}>
              {user.role}
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
              {user.fullName}
            </Typography>
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ ml: 1, textTransform: 'none' }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Navigation */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', borderRight: '1px solid #e0e0e0' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <List>
            {menuItems.map((item) => {
              const isSelected = location.pathname === item.path;
              return (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    selected={isSelected}
                    sx={{
                      mx: 1,
                      borderRadius: 1,
                      mb: 0.5,
                      '&.Mui-selected': {
                        bgcolor: 'rgba(25, 118, 210, 0.08)',
                        color: '#1976d2',
                        '& .MuiListItemIcon-root': { color: '#1976d2' },
                        '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.12)' },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isSelected ? 'bold' : 'regular' }} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        <Box sx={{ mt: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
