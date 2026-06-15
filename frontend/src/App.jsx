import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeToggleProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

// Layout
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import Login from './pages/Login';

// Settings Page
import Settings from './pages/Settings';

// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import CreateRequest from './pages/employee/CreateRequest';
import TrackRequest from './pages/employee/TrackRequest';

// Agent Pages
import AgentDashboard from './pages/agent/AgentDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageAgents from './pages/admin/ManageAgents';
import ManageAssets from './pages/admin/ManageAssets';
import ViewRequests from './pages/admin/ViewRequests';
import Reports from './pages/admin/Reports';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={user ? <NavigateToDashboard user={user} /> : <Login />} />

      {/* Authenticated Dashboard Routes */}
      <Route element={<DashboardLayout />}>
        {/* Unified Settings Route */}
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        {/* Employee Routes */}
        <Route path="/employee-dashboard" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><EmployeeDashboard /></ProtectedRoute>} />
        <Route path="/create-request" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><CreateRequest /></ProtectedRoute>} />
        <Route path="/track-request/:id" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><TrackRequest /></ProtectedRoute>} />

        {/* Agent Routes */}
        <Route path="/agent-dashboard" element={<ProtectedRoute allowedRoles={['AGENT', 'TEAM_LEAD']}><AgentDashboard /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><ManageUsers /></ProtectedRoute>} />
        <Route path="/admin/agents" element={<ProtectedRoute allowedRoles={['ADMIN']}><ManageAgents /></ProtectedRoute>} />
        <Route path="/admin/assets" element={<ProtectedRoute allowedRoles={['ADMIN']}><ManageAssets /></ProtectedRoute>} />
        <Route path="/admin/requests" element={<ProtectedRoute allowedRoles={['ADMIN']}><ViewRequests /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['ADMIN']}><Reports /></ProtectedRoute>} />
      </Route>

      {/* Redirects */}
      <Route path="*" element={user ? <NavigateToDashboard user={user} /> : <Navigate to="/login" />} />
    </Routes>
  );
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  const role = user.role ? user.role.toUpperCase() : '';
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" />;
  }

  return children;
};

const NavigateToDashboard = ({ user }) => {
  const role = user.role ? user.role.toUpperCase() : '';
  if (role === 'ADMIN') {
    return <Navigate to="/admin-dashboard" />;
  } else if (role === 'AGENT' || role === 'TEAM_LEAD') {
    return <Navigate to="/agent-dashboard" />;
  } else {
    return <Navigate to="/employee-dashboard" />;
  }
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeToggleProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </ThemeToggleProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

