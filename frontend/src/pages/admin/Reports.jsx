import React, { useState, useEffect } from 'react';
import { reportAPI } from '../../services/api';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

const COLORS = ['#1976d2', '#009688', '#2e7d32', '#757575', '#e53935'];

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await reportAPI.getSystemReport();
      setReportData(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load reports:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!reportData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Failed to load system reports.</Typography>
      </Box>
    );
  }

  // Map status counts to Recharts data
  const statusData = [
    { name: 'Open', value: reportData.openRequests },
    { name: 'Assigned', value: reportData.assignedRequests },
    { name: 'Resolved', value: reportData.resolvedRequests },
    { name: 'Closed', value: reportData.closedRequests },
    { name: 'Escalated', value: reportData.escalatedRequests },
  ].filter(item => item.value > 0);

  // SLA calculation
  const totalCompleted = reportData.resolvedRequests + reportData.closedRequests;
  const compliantCount = Math.max(0, totalCompleted - reportData.slaViolations);
  const complianceRate = totalCompleted > 0 ? Math.round((compliantCount / totalCompleted) * 100) : 100;

  // Agent Performance Chart data
  const agentChartData = reportData.agentPerformance.map(agent => ({
    name: agent.agentName.split(' ')[0], // First name
    Resolved: agent.resolvedRequests,
    Workload: agent.workload,
  }));

  return (
    <Box sx={{ pb: 5 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        Reports & System Analytics
      </Typography>

      {/* Summary Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #1976d2', boxShadow: 1 }}>
            <CardContent>
              <Typography color="text.secondary" variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                TOTAL REQUESTS
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                {reportData.totalRequests}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #e53935', boxShadow: 1 }}>
            <CardContent>
              <Typography color="text.secondary" variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                ACTIVE SLA VIOLATIONS
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1, color: '#e53935' }}>
                {reportData.slaViolations}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #2e7d32', boxShadow: 1 }}>
            <CardContent>
              <Typography color="text.secondary" variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                SLA COMPLIANCE RATE
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1, color: '#2e7d32' }}>
                {complianceRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #ed6c02', boxShadow: 1 }}>
            <CardContent>
              <Typography color="text.secondary" variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                PENDING ACTION
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1, color: '#ed6c02' }}>
                {reportData.openRequests + reportData.escalatedRequests}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Visual Graphs */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {/* Requests by Status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, boxShadow: 2, height: 350 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Requests by Status
            </Typography>
            {statusData.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%' }}>
                <Typography color="text.secondary">No requests data available</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Agent Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, boxShadow: 2, height: 350 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Agent Workload & Performance
            </Typography>
            {agentChartData.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%' }}>
                <Typography color="text.secondary">No agents registered</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={agentChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Resolved" fill="#2e7d32" />
                  <Bar dataKey="Workload" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Agent Performance Table */}
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
        Agent Performance Scorecard
      </Typography>
      <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Agent ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Agent Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Active Workload</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Requests Resolved</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>SLA Violations</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Avg Resolution Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportData.agentPerformance.map((agent) => (
              <TableRow key={agent.agentId} hover>
                <TableCell>{agent.agentId}</TableCell>
                <TableCell sx={{ fontWeight: 'medium' }}>{agent.agentName}</TableCell>
                <TableCell>{agent.email}</TableCell>
                <TableCell>{agent.workload} requests</TableCell>
                <TableCell>{agent.resolvedRequests} resolved</TableCell>
                <TableCell sx={{ color: agent.slaViolations > 0 ? '#e53935' : 'inherit', fontWeight: agent.slaViolations > 0 ? 'bold' : 'normal' }}>
                  {agent.slaViolations} violations
                </TableCell>
                <TableCell>{agent.avgResolutionTimeHours} hours</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Reports;
