package com.esrms.controller;

import java.util.List;
import com.esrms.dto.StatusUpdateRequest;
import com.esrms.model.ServiceRequest;
import com.esrms.service.ServiceRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/service-requests")
public class ServiceRequestController {

    private final ServiceRequestService serviceRequestService;

    @Autowired
    public ServiceRequestController(ServiceRequestService serviceRequestService) {
        this.serviceRequestService = serviceRequestService;
    }

    @GetMapping
    public ResponseEntity<List<ServiceRequest>> getServiceRequests(
            @RequestParam(required = false) Integer userId,
            @RequestParam(required = false) Integer agentId,
            @RequestParam(required = false) String status) {
        
        if (userId != null) {
            return ResponseEntity.ok(serviceRequestService.getRequestsByUser(userId));
        } else if (agentId != null) {
            return ResponseEntity.ok(serviceRequestService.getRequestsByAgent(agentId));
        } else if (status != null) {
            return ResponseEntity.ok(serviceRequestService.getRequestsByStatus(status));
        }
        return ResponseEntity.ok(serviceRequestService.getAllRequests());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceRequest> getRequestById(@PathVariable int id) {
        ServiceRequest request = serviceRequestService.getRequestById(id);
        if (request != null) {
            return ResponseEntity.ok(request);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<?> createRequest(@RequestBody ServiceRequest request) {
        boolean success = serviceRequestService.createRequest(request);
        if (success) {
            return ResponseEntity.status(HttpStatus.CREATED).body("Request created successfully");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to create request");
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRequest(@PathVariable int id, @RequestBody ServiceRequest request) {
        boolean success = serviceRequestService.updateRequest(id, request);
        if (success) {
            return ResponseEntity.ok("Request updated successfully");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to update request");
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable int id, @RequestBody StatusUpdateRequest statusUpdate) {
        boolean success;
        String action = statusUpdate.getStatus().toUpperCase();
        if ("RESOLVED".equals(action)) {
            success = serviceRequestService.resolveRequest(id, statusUpdate.getResolution());
        } else if ("CLOSED".equals(action)) {
            success = serviceRequestService.closeRequest(id, statusUpdate.getResolution());
        } else {
            // General status change or fallback
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid status update action");
        }

        if (success) {
            return ResponseEntity.ok("Status updated successfully to " + action);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to update status");
    }

    @PostMapping("/{id}/escalate")
    public ResponseEntity<?> escalateRequest(@PathVariable int id) {
        boolean success = serviceRequestService.escalateRequest(id);
        if (success) {
            return ResponseEntity.ok("Request escalated successfully");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to escalate request");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRequest(@PathVariable int id) {
        boolean success = serviceRequestService.deleteRequest(id);
        if (success) {
            return ResponseEntity.ok("Request deleted successfully");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to delete request");
    }
}
