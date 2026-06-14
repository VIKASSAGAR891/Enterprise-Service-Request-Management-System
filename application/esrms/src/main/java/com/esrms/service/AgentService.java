package com.esrms.service;

import java.util.List;
import com.esrms.dao.AgentDAO;
import com.esrms.model.Agent;
import org.springframework.stereotype.Service;

@Service
public class AgentService {

    private final AgentDAO agentDAO = new AgentDAO();

    public boolean addAgent(Agent agent) {
        return agentDAO.addAgent(agent.getUserId(), agent.getDeptId());
    }

    public boolean updateAgent(int id, Agent agent) {
        return agentDAO.updateAgent(id, agent.getDeptId(), agent.getWorkload());
    }

    public boolean deleteAgent(int id) {
        return agentDAO.deleteAgent(id);
    }

    public List<Agent> getAllAgents() {
        return agentDAO.getAllAgents();
    }

    public Agent getAgentById(int id) {
        return agentDAO.getAgentById(id);
    }

    public Agent getAgentByUserId(int userId) {
        return agentDAO.getAgentByUserId(userId);
    }
}
