package com.esrms.controller;

import java.util.List;
import com.esrms.dto.AssignmentRequest;
import com.esrms.model.Assignment;
import com.esrms.service.AssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    private final AssignmentService assignmentService;

    @Autowired
    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @GetMapping
    public ResponseEntity<List<Assignment>> getAllAssignments() {
        return ResponseEntity.ok(assignmentService.getAllAssignments());
    }

    @PostMapping
    public ResponseEntity<?> createAssignment(@RequestBody AssignmentRequest request) {
        boolean success = assignmentService.createAssignment(request.getRequestId(), request.getAgentId());
        if (success) {
            return ResponseEntity.status(HttpStatus.CREATED).body("Assignment created successfully");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to create assignment");
    }
}
