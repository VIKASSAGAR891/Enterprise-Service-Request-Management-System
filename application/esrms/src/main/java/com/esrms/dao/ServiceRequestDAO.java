package com.esrms.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.esrms.database.DBConnection;
import com.esrms.model.ServiceRequest;

/**
 * ServiceRequestDAO.java
 * 
 * Data Access Object for managing service requests in the database.
 * Provides CRUD operations and specialized queries for service request management.
 */
public class ServiceRequestDAO {

    private static final String BASE_SELECT_SQL = """
        SELECT 
            sr.request_id,
            sr.user_id,
            u.full_name AS employee_name,
            sr.category_id,
            c.category_name,
            sr.priority_id,
            p.priority_name AS priority,
            sr.created_at,
            sr.resolved_at,
            sr.title,
            sr.description,
            sr.status,
            ra.asset_id,
            ast.asset_name,
            a.agent_id,
            a.assigned_at,
            u2.full_name AS agent_name,
            (SELECT comment_text FROM comments WHERE request_id = sr.request_id AND comment_text LIKE 'Resolution: %' ORDER BY created_at DESC LIMIT 1) AS resolution
        FROM service_requests sr
        LEFT JOIN users u ON sr.user_id = u.user_id
        LEFT JOIN categories c ON sr.category_id = c.category_id
        LEFT JOIN priorities p ON sr.priority_id = p.priority_id
        LEFT JOIN request_assets ra ON sr.request_id = ra.request_id
        LEFT JOIN assets ast ON ra.asset_id = ast.asset_id
        LEFT JOIN assignments a ON sr.request_id = a.request_id
        LEFT JOIN agents ag ON a.agent_id = ag.agent_id
        LEFT JOIN users u2 ON ag.user_id = u2.user_id
        """;

    /**
     * Creates a new service request in the database
     * 
     * @param userId The ID of the user creating the request
     * @param assetId The ID of the asset related to the request
     * @param categoryId The ID of the category
     * @param title The title of the request
     * @param description The description of the request
     * @param priority The priority level (LOW, MEDIUM, HIGH, CRITICAL)
     * @return true if request created successfully, false otherwise
     */
    public boolean createRequest(int userId, int assetId, int categoryId, String title, 
                                  String description, String priority) {
        
        int priorityId = mapPriorityToId(priority);
        int slaId = priorityId; // Align sla_id with priority_id as per sla_policies

        String insertRequestSql = """
            INSERT INTO service_requests 
            (user_id, category_id, priority_id, sla_id, title, description, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 'OPEN', NOW())
            """;

        String insertAssetSql = """
            INSERT INTO request_assets (request_id, asset_id)
            VALUES (?, ?)
            """;

        Connection conn = null;
        PreparedStatement psReq = null;
        PreparedStatement psAsset = null;
        ResultSet rs = null;

        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false); // Begin transaction

            psReq = conn.prepareStatement(insertRequestSql, Statement.RETURN_GENERATED_KEYS);
            psReq.setInt(1, userId);
            psReq.setInt(2, categoryId);
            psReq.setInt(3, priorityId);
            psReq.setInt(4, slaId);
            psReq.setString(5, title);
            psReq.setString(6, description);

            int rowsAffected = psReq.executeUpdate();
            if (rowsAffected > 0) {
                rs = psReq.getGeneratedKeys();
                if (rs.next()) {
                    int requestId = rs.getInt(1);

                    // Insert into request_assets map table
                    psAsset = conn.prepareStatement(insertAssetSql);
                    psAsset.setInt(1, requestId);
                    psAsset.setInt(2, assetId);
                    psAsset.executeUpdate();

                    conn.commit(); // Commit transaction
                    System.out.println("Service request created successfully with ID: " + requestId);
                    return true;
                }
            }
            conn.rollback();

        } catch (Exception e) {
            System.out.println("Error creating service request: " + e.getMessage());
            e.printStackTrace();
            if (conn != null) {
                try { conn.rollback(); } catch (Exception ex) {}
            }
        } finally {
            try { if (rs != null) rs.close(); } catch (Exception e) {}
            try { if (psReq != null) psReq.close(); } catch (Exception e) {}
            try { if (psAsset != null) psAsset.close(); } catch (Exception e) {}
            try { if (conn != null) conn.close(); } catch (Exception e) {}
        }

        return false;
    }

    /**
     * Updates an existing service request basic info
     * 
     * @param requestId The ID of the request to update
     * @param title Updated title
     * @param description Updated description
     * @param priority Updated priority
     * @return true if update successful, false otherwise
     */
    public boolean updateRequest(int requestId, String title, 
                                  String description, String priority) {
        
        int priorityId = mapPriorityToId(priority);
        String sql = """
            UPDATE service_requests 
            SET title = ?, description = ?, priority_id = ?, sla_id = ?
            WHERE request_id = ?
            """;

        try (
            Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement(sql)
        ) {
            ps.setString(1, title);
            ps.setString(2, description);
            ps.setInt(3, priorityId);
            ps.setInt(4, priorityId); // Update SLA accordingly
            ps.setInt(5, requestId);

            int rowsAffected = ps.executeUpdate();
            if (rowsAffected > 0) {
                System.out.println("Service request updated successfully");
                return true;
            }

        } catch (Exception e) {
            System.out.println("Error updating service request: " + e.getMessage());
            e.printStackTrace();
        }

        return false;
    }

    /**
     * Closes a service request
     * 
     * @param requestId The ID of the request to close
     * @param resolution The resolution/closing notes
     * @return true if close successful, false otherwise
     */
    public boolean closeRequest(int requestId, String resolution) {
        
        String updateRequestSql = """
            UPDATE service_requests 
            SET status = 'CLOSED', resolved_at = NOW()
            WHERE request_id = ?
            """;

        Connection conn = null;
        PreparedStatement psUpdate = null;
        PreparedStatement psComment = null;
        PreparedStatement psWorkload = null;

        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            // 1. Update Request
            psUpdate = conn.prepareStatement(updateRequestSql);
            psUpdate.setInt(1, requestId);
            psUpdate.executeUpdate();

            // 2. Get Resolver User ID (Agent's User ID) from assignments
            int agentUserId = 4; // Default to admin's ID if no agent is assigned
            int agentId = 0;
            String getAgentSql = "SELECT ag.user_id, a.agent_id FROM assignments a JOIN agents ag ON a.agent_id = ag.agent_id WHERE a.request_id = ? LIMIT 1";
            try (PreparedStatement psGet = conn.prepareStatement(getAgentSql)) {
                psGet.setInt(1, requestId);
                try (ResultSet rs = psGet.executeQuery()) {
                    if (rs.next()) {
                        agentUserId = rs.getInt("user_id");
                        agentId = rs.getInt("agent_id");
                    }
                }
            }

            // 3. Add Resolution Comment
            String insertCommentSql = "INSERT INTO comments (request_id, user_id, comment_text, created_at) VALUES (?, ?, ?, NOW())";
            psComment = conn.prepareStatement(insertCommentSql);
            psComment.setInt(1, requestId);
            psComment.setInt(2, agentUserId);
            psComment.setString(3, "Resolution: " + resolution);
            psComment.executeUpdate();

            // 4. Decrement workload if an agent was assigned
            if (agentId > 0) {
                String updateWorkloadSql = "UPDATE agents SET workload = GREATEST(0, workload - 1) WHERE agent_id = ?";
                psWorkload = conn.prepareStatement(updateWorkloadSql);
                psWorkload.setInt(1, agentId);
                psWorkload.executeUpdate();
            }

            conn.commit();
            System.out.println("Service request closed successfully");
            return true;

        } catch (Exception e) {
            System.out.println("Error closing service request: " + e.getMessage());
            e.printStackTrace();
            if (conn != null) {
                try { conn.rollback(); } catch (Exception ex) {}
            }
        } finally {
            try { if (psUpdate != null) psUpdate.close(); } catch (Exception e) {}
            try { if (psComment != null) psComment.close(); } catch (Exception e) {}
            try { if (psWorkload != null) psWorkload.close(); } catch (Exception e) {}
            try { if (conn != null) conn.close(); } catch (Exception e) {}
        }

        return false;
    }

    /**
     * Assigns a service request to an agent
     * 
     * @param requestId The ID of the request
     * @param agentId The ID of the agent to assign
     * @return true if assignment successful, false otherwise
     */
    public boolean assignRequest(int requestId, int agentId) {
        
        String insertAssignmentSql = """
            INSERT INTO assignments (request_id, agent_id, assigned_at)
            VALUES (?, ?, NOW())
            ON DUPLICATE KEY UPDATE agent_id = ?, assigned_at = NOW()
            """;

        String updateRequestSql = """
            UPDATE service_requests 
            SET status = 'ASSIGNED'
            WHERE request_id = ?
            """;

        String incrementWorkloadSql = """
            UPDATE agents 
            SET workload = workload + 1 
            WHERE agent_id = ?
            """;

        Connection conn = null;
        PreparedStatement psAssign = null;
        PreparedStatement psUpdate = null;
        PreparedStatement psWorkload = null;

        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            // 1. Insert/Update Assignment mapping
            psAssign = conn.prepareStatement(insertAssignmentSql);
            psAssign.setInt(1, requestId);
            psAssign.setInt(2, agentId);
            psAssign.setInt(3, agentId);
            psAssign.executeUpdate();

            // 2. Update Request Status
            psUpdate = conn.prepareStatement(updateRequestSql);
            psUpdate.setInt(1, requestId);
            psUpdate.executeUpdate();

            // 3. Increment workload of the assigned agent
            psWorkload = conn.prepareStatement(incrementWorkloadSql);
            psWorkload.setInt(1, agentId);
            psWorkload.executeUpdate();

            conn.commit();
            System.out.println("Service request assigned successfully");
            return true;

        } catch (Exception e) {
            System.out.println("Error assigning service request: " + e.getMessage());
            e.printStackTrace();
            if (conn != null) {
                try { conn.rollback(); } catch (Exception ex) {}
            }
        } finally {
            try { if (psAssign != null) psAssign.close(); } catch (Exception e) {}
            try { if (psUpdate != null) psUpdate.close(); } catch (Exception e) {}
            try { if (psWorkload != null) psWorkload.close(); } catch (Exception e) {}
            try { if (conn != null) conn.close(); } catch (Exception e) {}
        }

        return false;
    }

    /**
     * Marks a service request as resolved
     * 
     * @param requestId The ID of the request
     * @param resolution The resolution details
     * @return true if resolve successful, false otherwise
     */
    public boolean resolveRequest(int requestId, String resolution) {
        
        String updateRequestSql = """
            UPDATE service_requests 
            SET status = 'RESOLVED', resolved_at = NOW()
            WHERE request_id = ?
            """;

        Connection conn = null;
        PreparedStatement psUpdate = null;
        PreparedStatement psComment = null;
        PreparedStatement psWorkload = null;

        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            // 1. Update status
            psUpdate = conn.prepareStatement(updateRequestSql);
            psUpdate.setInt(1, requestId);
            psUpdate.executeUpdate();

            // 2. Find Agent User ID
            int agentUserId = 4;
            int agentId = 0;
            String getAgentSql = "SELECT ag.user_id, a.agent_id FROM assignments a JOIN agents ag ON a.agent_id = ag.agent_id WHERE a.request_id = ? LIMIT 1";
            try (PreparedStatement psGet = conn.prepareStatement(getAgentSql)) {
                psGet.setInt(1, requestId);
                try (ResultSet rs = psGet.executeQuery()) {
                    if (rs.next()) {
                        agentUserId = rs.getInt("user_id");
                        agentId = rs.getInt("agent_id");
                    }
                }
            }

            // 3. Add Resolution Comment
            String insertCommentSql = "INSERT INTO comments (request_id, user_id, comment_text, created_at) VALUES (?, ?, ?, NOW())";
            psComment = conn.prepareStatement(insertCommentSql);
            psComment.setInt(1, requestId);
            psComment.setInt(2, agentUserId);
            psComment.setString(3, "Resolution: " + resolution);
            psComment.executeUpdate();

            // 4. Decrement workload
            if (agentId > 0) {
                String updateWorkloadSql = "UPDATE agents SET workload = GREATEST(0, workload - 1) WHERE agent_id = ?";
                psWorkload = conn.prepareStatement(updateWorkloadSql);
                psWorkload.setInt(1, agentId);
                psWorkload.executeUpdate();
            }

            conn.commit();
            System.out.println("Service request resolved successfully");
            return true;

        } catch (Exception e) {
            System.out.println("Error resolving service request: " + e.getMessage());
            e.printStackTrace();
            if (conn != null) {
                try { conn.rollback(); } catch (Exception ex) {}
            }
        } finally {
            try { if (psUpdate != null) psUpdate.close(); } catch (Exception e) {}
            try { if (psComment != null) psComment.close(); } catch (Exception e) {}
            try { if (psWorkload != null) psWorkload.close(); } catch (Exception e) {}
            try { if (conn != null) conn.close(); } catch (Exception e) {}
        }

        return false;
    }

    /**
     * Escalates a service request to higher priority
     * 
     * @param requestId The ID of the request to escalate
     * @return true if escalation successful, false otherwise
     */
    public boolean escalateRequest(int requestId) {
        
        String sql = """
            UPDATE service_requests 
            SET status = 'ESCALATED', priority_id = 4, sla_id = 4
            WHERE request_id = ?
            """;

        try (
            Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement(sql)
        ) {
            ps.setInt(1, requestId);

            int rowsAffected = ps.executeUpdate();
            if (rowsAffected > 0) {
                System.out.println("Service request escalated successfully");
                return true;
            }

        } catch (Exception e) {
            System.out.println("Error escalating service request: " + e.getMessage());
            e.printStackTrace();
        }

        return false;
    }

    /**
     * Retrieves all service requests from the database
     * 
     * @return List of all ServiceRequest objects
     */
    public List<ServiceRequest> getAllRequests() {
        
        List<ServiceRequest> requests = new ArrayList<>();
        String sql = BASE_SELECT_SQL + " ORDER BY sr.created_at DESC";

        try (
            Connection conn = DBConnection.getConnection();
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(sql)
        ) {
            while (rs.next()) {
                ServiceRequest request = mapResultSetToServiceRequest(rs);
                requests.add(request);
            }

        } catch (Exception e) {
            System.out.println("Error retrieving all requests: " + e.getMessage());
            e.printStackTrace();
        }

        return requests;
    }

    /**
     * Retrieves service requests created by a specific user
     * 
     * @param userId The ID of the user
     * @return List of ServiceRequest objects created by the user
     */
    public List<ServiceRequest> getRequestsByUser(int userId) {
        
        List<ServiceRequest> requests = new ArrayList<>();
        String sql = BASE_SELECT_SQL + " WHERE sr.user_id = ? ORDER BY sr.created_at DESC";

        try (
            Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement(sql)
        ) {
            ps.setInt(1, userId);
            
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                ServiceRequest request = mapResultSetToServiceRequest(rs);
                requests.add(request);
            }

        } catch (Exception e) {
            System.out.println("Error retrieving requests by user: " + e.getMessage());
            e.printStackTrace();
        }

        return requests;
    }

    /**
     * Retrieves service requests assigned to a specific agent
     * 
     * @param agentId The ID of the agent
     * @return List of ServiceRequest objects assigned to the agent
     */
    public List<ServiceRequest> getRequestsByAgent(int agentId) {
        
        List<ServiceRequest> requests = new ArrayList<>();
        String sql = BASE_SELECT_SQL + " WHERE a.agent_id = ? ORDER BY sr.created_at DESC";

        try (
            Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement(sql)
        ) {
            ps.setInt(1, agentId);
            
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                ServiceRequest request = mapResultSetToServiceRequest(rs);
                requests.add(request);
            }

        } catch (Exception e) {
            System.out.println("Error retrieving requests by agent: " + e.getMessage());
            e.printStackTrace();
        }

        return requests;
    }

    /**
     * Retrieves a specific service request by ID
     * 
     * @param requestId The ID of the request
     * @return ServiceRequest object or null if not found
     */
    public ServiceRequest getRequestById(int requestId) {
        
        String sql = BASE_SELECT_SQL + " WHERE sr.request_id = ?";

        try (
            Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement(sql)
        ) {
            ps.setInt(1, requestId);
            
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return mapResultSetToServiceRequest(rs);
            }

        } catch (Exception e) {
            System.out.println("Error retrieving request by ID: " + e.getMessage());
            e.printStackTrace();
        }

        return null;
    }

    /**
     * Retrieves service requests filtered by status
     * 
     * @param status The status to filter by
     * @return List of ServiceRequest objects with matching status
     */
    public List<ServiceRequest> getRequestsByStatus(String status) {
        
        List<ServiceRequest> requests = new ArrayList<>();
        String sql = BASE_SELECT_SQL + " WHERE sr.status = ? ORDER BY sr.created_at DESC";

        try (
            Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement(sql)
        ) {
            ps.setString(1, status);
            
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                ServiceRequest request = mapResultSetToServiceRequest(rs);
                requests.add(request);
            }

        } catch (Exception e) {
            System.out.println("Error retrieving requests by status: " + e.getMessage());
            e.printStackTrace();
        }

        return requests;
    }

    /**
     * Deletes a service request
     * 
     * @param requestId The ID of the request to delete
     * @return true if deletion successful, false otherwise
     */
    public boolean deleteRequest(int requestId) {
        
        String deleteReqSql = "DELETE FROM service_requests WHERE request_id = ?";
        String deleteAssetSql = "DELETE FROM request_assets WHERE request_id = ?";
        String deleteAssignmentSql = "DELETE FROM assignments WHERE request_id = ?";

        Connection conn = null;
        PreparedStatement psReq = null;
        PreparedStatement psAsset = null;
        PreparedStatement psAssign = null;

        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false);

            // Delete assignments mapping
            psAssign = conn.prepareStatement(deleteAssignmentSql);
            psAssign.setInt(1, requestId);
            psAssign.executeUpdate();

            // Delete assets mapping
            psAsset = conn.prepareStatement(deleteAssetSql);
            psAsset.setInt(1, requestId);
            psAsset.executeUpdate();

            // Delete main request
            psReq = conn.prepareStatement(deleteReqSql);
            psReq.setInt(1, requestId);
            int rowsAffected = psReq.executeUpdate();

            conn.commit();
            return rowsAffected > 0;

        } catch (Exception e) {
            System.out.println("Error deleting request: " + e.getMessage());
            e.printStackTrace();
            if (conn != null) {
                try { conn.rollback(); } catch (Exception ex) {}
            }
        } finally {
            try { if (psReq != null) psReq.close(); } catch (Exception e) {}
            try { if (psAsset != null) psAsset.close(); } catch (Exception e) {}
            try { if (psAssign != null) psAssign.close(); } catch (Exception e) {}
            try { if (conn != null) conn.close(); } catch (Exception e) {}
        }

        return false;
    }

    /**
     * Helper method to map ResultSet to ServiceRequest object
     */
    private ServiceRequest mapResultSetToServiceRequest(ResultSet rs) throws Exception {
        
        ServiceRequest request = new ServiceRequest();
        
        request.setRequestId(rs.getInt("request_id"));
        request.setUserId(rs.getInt("user_id"));
        request.setCategoryId(rs.getInt("category_id"));
        request.setCategoryName(rs.getString("category_name"));
        request.setPriority(rs.getString("priority"));
        request.setTitle(rs.getString("title"));
        request.setDescription(rs.getString("description"));
        request.setStatus(rs.getString("status").trim()); // trim status CHAR column
        
        String rawResolution = rs.getString("resolution");
        if (rawResolution != null && rawResolution.startsWith("Resolution: ")) {
            request.setResolution(rawResolution.substring(12));
        } else {
            request.setResolution(rawResolution);
        }

        request.setAssetId(rs.getInt("asset_id"));
        request.setAssetName(rs.getString("asset_name"));

        request.setAgentId(rs.getInt("agent_id"));
        request.setAgentName(rs.getString("agent_name"));

        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            request.setCreatedAt(createdAt.toLocalDateTime());
        }
        
        Timestamp resolvedAt = rs.getTimestamp("resolved_at");
        if (resolvedAt != null) {
            request.setResolvedAt(resolvedAt.toLocalDateTime());
        }

        Timestamp assignedAt = rs.getTimestamp("assigned_at");
        if (assignedAt != null) {
            request.setAssignedAt(assignedAt.toLocalDateTime());
        }
        
        return request;
    }

    private int mapPriorityToId(String priority) {
        if (priority == null) return 2; // Default to MEDIUM
        return switch (priority.toUpperCase()) {
            case "LOW" -> 1;
            case "MEDIUM" -> 2;
            case "HIGH" -> 3;
            case "CRITICAL" -> 4;
            default -> 2;
        };
    }
}
