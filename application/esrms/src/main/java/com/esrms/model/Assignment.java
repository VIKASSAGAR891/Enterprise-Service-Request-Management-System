package com.esrms.model;

import java.sql.Timestamp;

public class Assignment {

    private int assignmentId;
    private int requestId;
    private int agentId;
    private Timestamp assignedAt;

    public Assignment() {}

    public Assignment(int assignmentId,
                      int requestId,
                      int agentId,
                      Timestamp assignedAt) {

        this.assignmentId = assignmentId;
        this.requestId = requestId;
        this.agentId = agentId;
        this.assignedAt = assignedAt;
    }

    public int getAssignmentId() {
        return assignmentId;
    }

    public void setAssignmentId(int assignmentId) {
        this.assignmentId = assignmentId;
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

    public Timestamp getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(Timestamp assignedAt) {
        this.assignedAt = assignedAt;
    }
}