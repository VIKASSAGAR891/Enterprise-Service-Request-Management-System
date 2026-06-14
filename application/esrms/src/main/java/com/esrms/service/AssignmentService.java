package com.esrms.service;

import java.util.List;
import com.esrms.dao.AssignmentDAO;
import com.esrms.dao.ServiceRequestDAO;
import com.esrms.model.Assignment;
import org.springframework.stereotype.Service;

@Service
public class AssignmentService {

    private final AssignmentDAO assignmentDAO = new AssignmentDAO();
    private final ServiceRequestDAO serviceRequestDAO = new ServiceRequestDAO();

    public boolean createAssignment(int requestId, int agentId) {
        return serviceRequestDAO.assignRequest(requestId, agentId);
    }

    public List<Assignment> getAllAssignments() {
        return assignmentDAO.getAllAssignments();
    }
}
