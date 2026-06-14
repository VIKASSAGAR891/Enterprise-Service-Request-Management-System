package com.esrms.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import com.esrms.database.DBConnection;
import com.esrms.model.Agent;

/**
 * AgentDAO.java
 * 
 * Data Access Object for managing agents in the database.
 * Provides CRUD operations for agent management.
 */
public class AgentDAO {

    /**
     * Adds a new agent to the database
     * 
     * @param userId The ID of the user associated with this agent
     * @param deptId The department ID of the agent
     * @return true if agent added successfully, false otherwise
     */
    public boolean addAgent(int userId, int deptId) {
        
        String sql = """
            INSERT INTO agents (user_id, dept_id, workload)
            VALUES (?, ?, 0)
            """;

        try (
            Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement(sql)
        ) {
            ps.setInt(1, userId);
            ps.setInt(2, deptId);

            int rowsAffected = ps.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("Agent added successfully");
                return true;
            }

        } catch (Exception e) {
            System.out.println("Error adding agent: " + e.getMessage());
            e.printStackTrace();
        }

        return false;
    }

    /**
     * Updates an existing agent's information
     * 
     * @param agentId The ID of the agent to update
     * @param deptId Updated department ID
     * @param workload Updated workload
     * @return true if update successful, false otherwise
     */
    public boolean updateAgent(int agentId, int deptId, int workload) {
        
        String sql = """
            UPDATE agents 
            SET dept_id = ?, workload = ?
            WHERE agent_id = ?
            """;

        try (
            Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement(sql)
        ) {
            ps.setInt(1, deptId);
            ps.setInt(2, workload);
            ps.setInt(3, agentId);

            int rowsAffected = ps.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("Agent updated successfully");
                return true;
            }

        } catch (Exception e) {
            System.out.println("Error updating agent: " + e.getMessage());
            e.printStackTrace();
        }

        return false;
    }

    /**
     * Deletes an agent from the database
     * 
     * @param agentId The ID of the agent to delete
     * @return true if deletion successful, false otherwise
     */
    public boolean deleteAgent(int agentId) {
        
        String sql = """
            DELETE FROM agents
            WHERE agent_id = ?
            """;

        try (
            Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement(sql)
        ) {
            ps.setInt(1, agentId);

            int rowsAffected = ps.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("Agent deleted successfully");
                return true;
            }

        } catch (Exception e) {
            System.out.println("Error deleting agent: " + e.getMessage());
            e.printStackTrace();
        }

        return false;
    }

    /**
     * Retrieves all agents from the database
     * 
     * @return List of all Agent objects
     */
    public List<Agent> getAllAgents() {
        
        List<Agent> agents = new ArrayList<>();
        String sql = """
            SELECT a.*, u.full_name, u.email 
            FROM agents a
            JOIN users u ON a.user_id = u.user_id
            ORDER BY a.agent_id
            """;

        try (
            Connection conn = DBConnection.getConnection();
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(sql)
        ) {
            while (rs.next()) {
                Agent agent = mapResultSetToAgent(rs);
                agents.add(agent);
            }

        } catch (Exception e) {
            System.out.println("Error retrieving all agents: " + e.getMessage());
            e.printStackTrace();
        }

        return agents;
    }

    /**
     * Retrieves a specific agent by ID
     * 
     * @param agentId The ID of the agent
     * @return Agent object or null if not found
     */
    public Agent getAgentById(int agentId) {
        
        String sql = """
            SELECT a.*, u.full_name, u.email 
            FROM agents a
            JOIN users u ON a.user_id = u.user_id
            WHERE a.agent_id = ?
            """;

        try (
            Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement(sql)
        ) {
            ps.setInt(1, agentId);
            
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return mapResultSetToAgent(rs);
            }

        } catch (Exception e) {
            System.out.println("Error retrieving agent by ID: " + e.getMessage());
            e.printStackTrace();
        }

        return null;
    }

    /**
     * Retrieves an agent associated with a specific user
     * 
     * @param userId The ID of the user
     * @return Agent object or null if not found
     */
    public Agent getAgentByUserId(int userId) {
        
        String sql = """
            SELECT a.*, u.full_name, u.email 
            FROM agents a
            JOIN users u ON a.user_id = u.user_id
            WHERE a.user_id = ?
            """;

        try (
            Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement(sql)
        ) {
            ps.setInt(1, userId);
            
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return mapResultSetToAgent(rs);
            }

        } catch (Exception e) {
            System.out.println("Error retrieving agent by user ID: " + e.getMessage());
            e.printStackTrace();
        }

        return null;
    }

    /**
     * Gets the count of assigned requests for an agent
     * 
     * @param agentId The ID of the agent
     * @return Number of assigned requests
     */
    public int getAssignedRequestCount(int agentId) {
        
        String sql = """
            SELECT COUNT(*) as request_count
            FROM assignments a
            JOIN service_requests sr ON a.request_id = sr.request_id
            WHERE a.agent_id = ? AND sr.status IN ('ASSIGNED', 'ESCALATED')
            """;

        try (
            Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement(sql)
        ) {
            ps.setInt(1, agentId);
            
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return rs.getInt("request_count");
            }

        } catch (Exception e) {
            System.out.println("Error getting assigned request count: " + e.getMessage());
            e.printStackTrace();
        }

        return 0;
    }

    /**
     * Helper method to map ResultSet to Agent object
     * 
     * @param rs The ResultSet containing agent data
     * @return Agent object populated with data from ResultSet
     */
    private Agent mapResultSetToAgent(ResultSet rs) throws Exception {
        
        Agent agent = new Agent();
        
        agent.setAgentId(rs.getInt("agent_id"));
        agent.setUserId(rs.getInt("user_id"));
        agent.setDeptId(rs.getInt("dept_id"));
        agent.setWorkload(rs.getInt("workload"));
        
        // Populate joined user details if available
        try {
            agent.setFullName(rs.getString("full_name"));
            agent.setEmail(rs.getString("email"));
        } catch (Exception e) {
            // Fields might not be in result set if joined table wasn't included
        }
        
        return agent;
    }
}
