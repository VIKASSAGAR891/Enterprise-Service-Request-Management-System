# Enterprise Service Request Management System (ESRMS) - Project Details

This document outlines the technical stack, database and API connections, and directory structure of the migrated ESRMS project.

---

## 1. Complete Tech Stack

The system is split into a **Spring Boot REST API** backend and a **React single-page application** frontend.

### Backend Stack
- **Language**: Java 26 (Runtime)
- **Framework**: Spring Boot 3.4.3 (Starter Web)
- **Build Tool**: Maven 3.9
- **Database Access**: Vanilla JDBC (PreparedStatement patterns)
- **Driver**: MySQL Connector/J 9.3.0
- **Bytecode Compatibility**: Java 21 compiler target (enables compatibility with Spring component scan/ASM reader)

### Frontend Stack
- **Runtime**: Node.js
- **Build System**: Vite 8.0
- **UI Framework**: React 19.2
- **Routing**: React Router 7.1
- **API Client**: Axios 1.17 (handles calls to REST API)
- **Styling & Widgets**: 
  - Material UI (MUI 9.0)
  - Material Icons
  - Recharts 3.8 (renders dashboard metrics graphs)

### Database
- **Engine**: MySQL 8+
- **Features**: Stored procedures, update triggers (automatic status tracking), and audit logging.

---

## 2. Connection Details

### Database Connections (JDBC)
- **Connection Host**: `localhost:3306`
- **Database Name**: `esrms`
- **Connection URL**: `jdbc:mysql://localhost:3306/esrms`
- **Username**: `root`
- **Password**: `root123`
- **Class Implementation**: `com.esrms.database.DBConnection`

### Server Connections
- **Backend API Server**: Runs on `http://localhost:8080` (endpoints prefixed with `/api`)
- **Frontend Portal**: Runs on `http://localhost:5173`
- **CORS Allow-List**: Allowed origins config in backend: `http://localhost:5173`, `http://localhost:3000`

---

## 3. Folder Hierarchy Details

```text
Enterprise-Service-Request-Management-System/   <-- Workspace Root
│
├── database/                                   <-- SQL Schema & Setup
│   ├── 01_schema.sql
│   ├── 02_triggers.sql                         <-- Triggers for status history/logs
│   ├── 03_procedures.sql
│   ├── 04_views.sql
│   └── 05_sample_data.sql
│
├── application/
│   └── esrms/                                  <-- Maven Java Backend
│       ├── pom.xml                             <-- Project dependencies & JVM config
│       └── src/main/java/com/esrms/
│           ├── App.java                        <-- Spring Boot Application entrypoint
│           ├── config/
│           │   └── CorsConfig.java             <-- Servlet CorsFilter configuration
│           ├── controller/                     <-- REST Controller endpoint mappings
│           │   ├── AuthController.java
│           │   ├── UserController.java
│           │   ├── AgentController.java
│           │   ├── AssetController.java
│           │   ├── ServiceRequestController.java
│           │   ├── AssignmentController.java
│           │   └── ReportController.java
│           ├── service/                        <-- Service layer (business logic)
│           │   ├── UserService.java
│           │   ├── AgentService.java
│           │   ├── AssetService.java
│           │   ├── ServiceRequestService.java
│           │   ├── AssignmentService.java
│           │   └── ReportService.java
│           ├── dao/                            <-- DAO Layer (Prepared SQL queries)
│           │   ├── UserDAO.java
│           │   ├── AgentDAO.java
│           │   ├── AssetDAO.java
│           │   ├── ServiceRequestDAO.java
│           │   └── AssignmentDAO.java
│           ├── model/                          <-- Java POJOs (DB entity mapping)
│           │   ├── User.java
│           │   ├── Agent.java
│           │   ├── Asset.java
│           │   ├── ServiceRequest.java
│           │   └── Assignment.java
│           ├── dto/                            <-- Data Transfer Objects
│           │   ├── LoginRequest.java
│           │   ├── StatusUpdateRequest.java
│           │   └── AssignmentRequest.java
│           └── database/
│               └── DBConnection.java           <-- MySQL JDBC Connection provider
│
└── frontend/                                   <-- React Single Page Application
    ├── package.json                            <-- Node packages configuration
    ├── vite.config.js                          <-- Vite configuration
    ├── index.html                              <-- Main html template with SEO tags
    └── src/
        ├── main.jsx                            <-- React bootstrapper
        ├── App.jsx                             <-- Routes & Protected Route guards
        ├── App.css                             <-- Custom style layout overrides
        ├── index.css                           <-- Global theme/scrollbar styling
        ├── services/
        │   └── api.js                          <-- Axios REST API client methods
        ├── context/
        │   └── AuthContext.jsx                 <-- Persisted login session context
        ├── layouts/
        │   └── DashboardLayout.jsx             <-- Responsive dashboard sidebar/navbar
        └── pages/                              <-- Role-based visual dashboards
            ├── Login.jsx
            ├── employee/
            │   ├── EmployeeDashboard.jsx
            │   ├── CreateRequest.jsx
            │   └── TrackRequest.jsx
            ├── agent/
            │   └── AgentDashboard.jsx
            └── admin/
                ├── AdminDashboard.jsx
                ├── ManageUsers.jsx
                ├── ManageAgents.jsx
                ├── ManageAssets.jsx
                ├── ViewRequests.jsx
                └── Reports.jsx
```

---

## 4. Default Accounts for Testing

Use the following user credentials to test different system views:

| Role | Full Name | Email Address | Password |
| :--- | :--- | :--- | :--- |
| **Admin** | Admin User | `admin@company.com` | `123` |
| **Employee** | Vikas Sagar | `vikas@company.com` | `123` |
| **Agent** | Manjoth Singh | `manjoth@company.com` | `123` |
| **Team Lead** | Shruti | `shruti@company.com` | `123` |
