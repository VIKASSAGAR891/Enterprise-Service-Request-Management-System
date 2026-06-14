package com.esrms.dto;

public class AssignmentRequest {
    private int requestId;
    private int agentId;

    public AssignmentRequest() {}

    public AssignmentRequest(int requestId, int agentId) {
        this.requestId = requestId;
        this.agentId = agentId;
    }

    public int getRequestId() {
        return requestId;
    }

    public void setRequestId(int requestId) {
        this.requestId = requestId;
    }

    public int getAgentId() {
        return agentId;
    }

    public void setAgentId(int agentId) {
        this.agentId = agentId;
    }
}
