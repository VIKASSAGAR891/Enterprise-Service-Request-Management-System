import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useThemeToggle } from '../context/ThemeContext';
import { Box, AppBar, Toolbar, Typography, Button, IconButton, Avatar, Chip, Tooltip, Divider } from '@mui/material';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Laptop,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const drawerWidth = 260;

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeToggle();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    const role = user.role ? user.role.toUpperCase() : '';
    if (role === 'ADMIN') {
      return [
        { text: 'Dashboard', icon: <LayoutDashboard size={18} strokeWidth={1.5} />, path: '/admin-dashboard' },
        { text: 'Manage Users', icon: <Users size={18} strokeWidth={1.5} />, path: '/admin/users' },
        { text: 'Manage Agents', icon: <Briefcase size={18} strokeWidth={1.5} />, path: '/admin/agents' },
        { text: 'Manage Assets', icon: <Laptop size={18} strokeWidth={1.5} />, path: '/admin/assets' },
        { text: 'Service Requests', icon: <ClipboardList size={18} strokeWidth={1.5} />, path: '/admin/requests' },
        { text: 'Reports', icon: <BarChart3 size={18} strokeWidth={1.5} />, path: '/admin/reports' },
        { text: 'Settings', icon: <Settings size={18} strokeWidth={1.5} />, path: '/settings' },
      ];
    } else if (role === 'AGENT' || role === 'TEAM_LEAD') {
      return [
        { text: 'Assigned Requests', icon: <ClipboardList size={18} strokeWidth={1.5} />, path: '/agent-dashboard' },
        { text: 'Settings', icon: <Settings size={18} strokeWidth={1.5} />, path: '/settings' },
      ];
    } else {
      // EMPLOYEE
      return [
        { text: 'Dashboard', icon: <LayoutDashboard size={18} strokeWidth={1.5} />, path: '/employee-dashboard' },
        { text: 'Create Request', icon: <ClipboardList size={18} strokeWidth={1.5} />, path: '/create-request' },
        { text: 'Settings', icon: <Settings size={18} strokeWidth={1.5} />, path: '/settings' },
      ];
    }
  };

  const menuItems = getNavItems();

  const getPageTitle = () => {
    const activeItem = menuItems.find(item => item.path === location.pathname);
    if (activeItem) return activeItem.text;
    if (location.pathname.startsWith('/track-request/')) return 'Track Service Request';
    return 'ESRMS Console';
  };

  const getRoleColor = (role) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN': return '#DC2626';
      case 'AGENT': return '#0D9488';
      case 'TEAM_LEAD': return '#D97706';
      default: return '#8B80F9';
    }
  };

  const sidebarContent = (
    <Box className="sidebar-card">
      {/* Header/Logo */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: '#111827',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1.125rem',
            mb: 1.5,
            border: '2px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          ES
        </Box>
        <Typography variant="subtitle2" sx={{ color: 'var(--sidebar-text-primary)', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.8125rem' }}>
          ESRMS Console
        </Typography>
        <Typography variant="caption" sx={{ color: 'var(--sidebar-text-secondary)', fontSize: '0.6875rem' }}>
          Enterprise IT Portal
        </Typography>
      </Box>

      {/* Navigation List */}
      <nav className="nav-list">
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <button
              key={item.text}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              className={`nav-item ${isSelected ? 'active' : ''}`}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', opacity: isSelected ? 1 : 0.7 }}>
                {item.icon}
              </Box>
              <span>{item.text}</span>
            </button>
          );
        })}
      </nav>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      
      {/* Sidebar - Desktop */}
      <Box
        component="nav"
        sx={{
          width: { md: drawerWidth },
          flexShrink: { md: 0 },
          display: { xs: 'none', md: 'block' },
        }}
      >
        <Box
          sx={{
            width: drawerWidth,
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 1200,
            backgroundColor: 'var(--sidebar-bg)',
            borderRight: '1px solid rgba(255, 255, 255, 0.05)',
            transition: 'background-color 0.15s ease',
          }}
        >
          {sidebarContent}
        </Box>
      </Box>

      {/* Sidebar - Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <Box
            sx={{
              position: 'fixed',
              inset: 0,
              zIndex: 1300,
              display: { xs: 'block', md: 'none' },
            }}
          >
            {/* Backdrop */}
            <Box
              component={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              sx={{ position: 'absolute', inset: 0, backgroundColor: 'black' }}
            />
            {/* Drawer */}
            <Box
              component={motion.div}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 280,
                backgroundColor: 'var(--sidebar-bg)',
                boxShadow: '4px 0 25px rgba(0,0,0,0.3)',
              }}
            >
              {sidebarContent}
            </Box>
          </Box>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          paddingLeft: { md: 0 },
        }}
      >
        {/* Sticky Top Navbar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            zIndex: 1100,
            backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(9, 9, 11, 0.8)', // Dynamic theme blur background
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            width: '100%',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 }, height: 70 }}>
            {/* Left: Mobile Toggle & Page Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                color="inherit"
                onClick={() => setMobileOpen(!mobileOpen)}
                sx={{ display: { md: 'none' } }}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </IconButton>
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                {getPageTitle()}
              </Typography>
            </Box>

            {/* Right: Actions, Theme, Logout */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2.5 } }}>
              {/* User Profile Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    backgroundColor: getRoleColor(user.role),
                    color: 'white',
                  }}
                >
                  {user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                </Avatar>
                <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'left' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2, color: 'var(--text-primary)' }}>
                    {user.fullName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>
                    {user.email}
                  </Typography>
                </Box>
              </Box>

              <Chip
                label={user.role}
                size="small"
                sx={{
                  backgroundColor: `${getRoleColor(user.role)}15`,
                  color: getRoleColor(user.role),
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  px: 0.5,
                  display: { xs: 'none', sm: 'inline-flex' },
                }}
              />
              
              {/* Theme Toggle Button */}
              <Tooltip title={`Switch to ${mode === 'light' ? 'Dark' : 'Light'} Mode`}>
                <IconButton
                  onClick={toggleTheme}
                  sx={{
                    color: 'var(--text-secondary)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    '&:hover': {
                      color: 'var(--text-primary)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  {mode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </IconButton>
              </Tooltip>

              <Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: 'center', borderColor: 'var(--border-color)' }} />

              {/* Logout Button */}
              <Button
                variant="outlined"
                color="error"
                startIcon={<LogOut size={16} />}
                onClick={handleLogout}
                sx={{
                  fontWeight: 600,
                  px: 2,
                  py: 0.75,
                  borderRadius: '8px',
                  borderWidth: '1px',
                  borderColor: (theme) => `${theme.palette.error.main}40`,
                  textTransform: 'none',
                  '&:hover': {
                    borderWidth: '1px',
                    borderColor: 'error.main',
                    backgroundColor: 'error.main',
                    color: '#FFFFFF',
                  },
                }}
              >
                Logout
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Content Wrapper */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2.5, sm: 4 },
            maxWidth: '1440px',
            width: '100%',
            mx: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;

