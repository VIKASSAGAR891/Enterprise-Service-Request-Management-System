package com.esrms.model;

public class Agent {

    private int agentId;
    private int userId;
    private int deptId;
    private int workload;
    
    // Helper fields populated by joining users table
    private String fullName;
    private String email;

    public Agent() {}

    public Agent(int agentId, int userId, int deptId, int workload) {
        this.agentId = agentId;
        this.userId = userId;
        this.deptId = deptId;
        this.workload = workload;
    }

    public int getAgentId() {
        return agentId;
    }

    public void setAgentId(int agentId) {
        this.agentId = agentId;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public int getDeptId() {
        return deptId;
    }

    public void setDeptId(int deptId) {
        this.deptId = deptId;
    }

    public int getWorkload() {
        return workload;
    }

    public void setWorkload(int workload) {
        this.workload = workload;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}