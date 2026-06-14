package com.esrms.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.esrms.dao.AgentDAO;
import com.esrms.dao.ServiceRequestDAO;
import com.esrms.model.Agent;
import com.esrms.model.ServiceRequest;
import org.springframework.stereotype.Service;

@Service
public class ReportService {

    private final ServiceRequestDAO serviceRequestDAO = new ServiceRequestDAO();
    private final AgentDAO agentDAO = new AgentDAO();

    // Map priority name to resolution hours
    private static final Map<String, Integer> SLA_HOURS = Map.of(
        "LOW", 72,
        "MEDIUM", 24,
        "HIGH", 12,
        "CRITICAL", 4
    );

    public Map<String, Object> getSystemReport() {
        List<ServiceRequest> allRequests = serviceRequestDAO.getAllRequests();
        List<Agent> allAgents = agentDAO.getAllAgents();

        int totalRequests = allRequests.size();
        int openRequests = 0;
        int assignedRequests = 0;
        int resolvedRequests = 0;
        int closedRequests = 0;
        int escalatedRequests = 0;
        int slaViolations = 0;

        // Group counts and SLA violations
        for (ServiceRequest req : allRequests) {
            String status = req.getStatus() != null ? req.getStatus().toUpperCase() : "";
            switch (status) {
                case "OPEN" -> openRequests++;
                case "ASSIGNED" -> assignedRequests++;
                case "RESOLVED" -> resolvedRequests++;
                case "CLOSED" -> closedRequests++;
                case "ESCALATED" -> escalatedRequests++;
            }

            if (isSlaViolated(req)) {
                slaViolations++;
            }
        }

        // Agent performance
        List<Map<String, Object>> agentPerformanceList = new ArrayList<>();
        for (Agent agent : allAgents) {
            Map<String, Object> perf = new HashMap<>();
            perf.put("agentId", agent.getAgentId());
            perf.put("agentName", agent.getFullName() != null ? agent.getFullName() : "Agent " + agent.getAgentId());
            perf.put("email", agent.getEmail());
            
            // Filter requests for this agent
            List<ServiceRequest> agentRequests = allRequests.stream()
                .filter(r -> r.getAgentId() == agent.getAgentId())
                .toList();

            long assignedCount = agentRequests.stream().filter(r -> "ASSIGNED".equals(r.getStatus()) || "ESCALATED".equals(r.getStatus())).count();
            long resolvedCount = agentRequests.stream().filter(r -> "RESOLVED".equals(r.getStatus()) || "CLOSED".equals(r.getStatus())).count();
            long agentSlaViolations = agentRequests.stream().filter(this::isSlaViolated).count();

            // Calculate average resolution time
            double avgTimeHours = 0.0;
            List<ServiceRequest> resolvedReqs = agentRequests.stream()
                .filter(r -> (r.getStatus().equals("RESOLVED") || r.getStatus().equals("CLOSED")) && r.getResolvedAt() != null)
                .toList();

            if (!resolvedReqs.isEmpty()) {
                double totalHours = 0;
                for (ServiceRequest r : resolvedReqs) {
                    Duration duration = Duration.between(r.getCreatedAt(), r.getResolvedAt());
                    totalHours += duration.toMinutes() / 60.0;
                }
                avgTimeHours = totalHours / resolvedReqs.size();
            }

            perf.put("assignedRequests", assignedCount);
            perf.put("resolvedRequests", resolvedCount);
            perf.put("slaViolations", agentSlaViolations);
            perf.put("avgResolutionTimeHours", Math.round(avgTimeHours * 10.0) / 10.0);
            perf.put("workload", agent.getWorkload());

            agentPerformanceList.add(perf);
        }

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalRequests", totalRequests);
        metrics.put("openRequests", openRequests);
        metrics.put("assignedRequests", assignedRequests);
        metrics.put("resolvedRequests", resolvedRequests);
        metrics.put("closedRequests", closedRequests);
        metrics.put("escalatedRequests", escalatedRequests);
        metrics.put("slaViolations", slaViolations);
        metrics.put("agentPerformance", agentPerformanceList);

        return metrics;
    }

    private boolean isSlaViolated(ServiceRequest req) {
        if (req.getCreatedAt() == null) return false;
        
        String priority = req.getPriority() != null ? req.getPriority().toUpperCase() : "MEDIUM";
        int allowedHours = SLA_HOURS.getOrDefault(priority, 24);

        LocalDateTime limitTime = req.getResolvedAt();
        if (limitTime == null) {
            limitTime = LocalDateTime.now();
        }

        Duration duration = Duration.between(req.getCreatedAt(), limitTime);
        return duration.toHours() > allowedHours;
    }
}
