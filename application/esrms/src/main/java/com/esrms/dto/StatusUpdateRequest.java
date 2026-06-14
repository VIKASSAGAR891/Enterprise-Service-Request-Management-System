package com.esrms.dto;

public class StatusUpdateRequest {
    private String status;
    private String resolution;

    public StatusUpdateRequest() {}

    public StatusUpdateRequest(String status, String resolution) {
        this.status = status;
        this.resolution = resolution;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getResolution() {
        return resolution;
    }

    public void setResolution(String resolution) {
        this.resolution = resolution;
    }
}
