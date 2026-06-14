package com.esrms.controller;

import java.util.List;
import com.esrms.model.Agent;
import com.esrms.service.AgentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/agents")
public class AgentController {

    private final AgentService agentService;

    @Autowired
    public AgentController(AgentService agentService) {
        this.agentService = agentService;
    }

    @GetMapping
    public ResponseEntity<List<Agent>> getAllAgents() {
        return ResponseEntity.ok(agentService.getAllAgents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Agent> getAgentById(@PathVariable int id) {
        Agent agent = agentService.getAgentById(id);
        if (agent != null) {
            return ResponseEntity.ok(agent);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Agent> getAgentByUserId(@PathVariable int userId) {
        Agent agent = agentService.getAgentByUserId(userId);
        if (agent != null) {
            return ResponseEntity.ok(agent);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<?> addAgent(@RequestBody Agent agent) {
        boolean success = agentService.addAgent(agent);
        if (success) {
            return ResponseEntity.status(HttpStatus.CREATED).body("Agent added successfully");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to add agent");
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAgent(@PathVariable int id, @RequestBody Agent agent) {
        boolean success = agentService.updateAgent(id, agent);
        if (success) {
            return ResponseEntity.ok("Agent updated successfully");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to update agent");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAgent(@PathVariable int id) {
        boolean success = agentService.deleteAgent(id);
        if (success) {
            return ResponseEntity.ok("Agent deleted successfully");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to delete agent");
    }
}
