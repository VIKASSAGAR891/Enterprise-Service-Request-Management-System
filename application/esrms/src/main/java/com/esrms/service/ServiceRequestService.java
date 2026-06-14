package com.esrms.service;

import java.util.List;
import com.esrms.dao.ServiceRequestDAO;
import com.esrms.model.ServiceRequest;
import org.springframework.stereotype.Service;

@Service
public class ServiceRequestService {

    private final ServiceRequestDAO serviceRequestDAO = new ServiceRequestDAO();

    public boolean createRequest(ServiceRequest request) {
        return serviceRequestDAO.createRequest(
            request.getUserId(),
            request.getAssetId(),
            request.getCategoryId(),
            request.getTitle(),
            request.getDescription(),
            request.getPriority()
        );
    }

    public boolean updateRequest(int id, ServiceRequest request) {
        return serviceRequestDAO.updateRequest(
            id,
            request.getTitle(),
            request.getDescription(),
            request.getPriority()
        );
    }

    public boolean assignRequest(int id, int agentId) {
        return serviceRequestDAO.assignRequest(id, agentId);
    }

    public boolean resolveRequest(int id, String resolution) {
        return serviceRequestDAO.resolveRequest(id, resolution);
    }

    public boolean closeRequest(int id, String resolution) {
        return serviceRequestDAO.closeRequest(id, resolution);
    }

    public boolean escalateRequest(int id) {
        return serviceRequestDAO.escalateRequest(id);
    }

    public boolean deleteRequest(int id) {
        return serviceRequestDAO.deleteRequest(id);
    }

    public List<ServiceRequest> getAllRequests() {
        return serviceRequestDAO.getAllRequests();
    }

    public List<ServiceRequest> getRequestsByUser(int userId) {
        return serviceRequestDAO.getRequestsByUser(userId);
    }

    public List<ServiceRequest> getRequestsByAgent(int agentId) {
        return serviceRequestDAO.getRequestsByAgent(agentId);
    }

    public ServiceRequest getRequestById(int id) {
        return serviceRequestDAO.getRequestById(id);
    }

    public List<ServiceRequest> getRequestsByStatus(String status) {
        return serviceRequestDAO.getRequestsByStatus(status);
    }
}
