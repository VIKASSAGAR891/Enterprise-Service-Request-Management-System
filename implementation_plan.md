# Implementation Plan - ESRMS Migration

We will migrate the **Enterprise Service Request Management System (ESRMS)** from a Java Swing desktop application into a modern web application consisting of a **Spring Boot REST API** backend and a **React + Vite + Material UI** frontend.

---

## User Review Required

We have inspected the existing MySQL database schema and found that **the existing Java DAO implementation is incompatible with the database tables**. Specifically:
1. `assets` table has `purchase_date` instead of `serial_number`.
2. `agents` table has `dept_id` and `workload` instead of `specialization`.
3. `service_requests` table does not have `asset_id` or `agent_id` or `priority` or `resolution`. Instead:
   - Request-Asset associations are stored in `request_assets` (`request_id`, `asset_id`).
   - Request-Agent assignments are stored in `assignments` (`request_id`, `agent_id`).
   - Priority is referenced via `priority_id` linking to the `priorities` table.
   - Resolution text is stored as comments in the `comments` table.

> [!IMPORTANT]
> To comply with the requirement of **NOT changing or recreating the database**, we will update the Java DAO classes to perform relational joins and mappings matching this exact schema. For example, creating a request will insert into both `service_requests` and `request_assets`, and assigning a request will update the request status and insert into `assignments`.

---

## Proposed Changes

### 1. Backend: Refactoring & Spring Boot Setup

We will modify `pom.xml` to set up Spring Boot 3.4.x (compatible with Java 26) and add the necessary starter packages. We will remove the `com.esrms.ui` package and create controllers and services.

#### [MODIFY] [pom.xml](file:///c:/Users/Vikas/Desktop/Enterprise-Service-Request-Management-System/application/esrms/pom.xml)
- Add Spring Boot parent POM and `spring-boot-starter-web` dependency.
- Keep the MySQL connector dependency.
- Add Spring Boot Maven plugin to build a runnable JAR.

#### [NEW] [EsrmsApplication.java](file:///c:/Users/Vikas/Desktop/Enterprise-Service-Request-Management-System/application/esrms/src/main/java/com/esrms/EsrmsApplication.java)
- Main application bootstrap class with `@SpringBootApplication`.

#### [NEW] [CorsConfig.java](file:///c:/Users/Vikas/Desktop/Enterprise-Service-Request-Management-System/application/esrms/src/main/java/com/esrms/config/CorsConfig.java)
- Expose global CORS configuration to allow cross-origin requests from the React frontend running on `http://localhost:5173`.

#### [MODIFY] [Asset.java](file:///c:/Users/Vikas/Desktop/Enterprise-Service-Request-Management-System/application/esrms/src/main/java/com/esrms/model/Asset.java)
- Replace `serialNumber` field with `purchaseDate` (java.sql.Date) to align with the database.

#### [MODIFY] [AssetDAO.java](file:///c:/Users/Vikas/Desktop/Enterprise-Service-Request-Management-System/application/esrms/src/main/java/com/esrms/dao/AssetDAO.java)
- Update query mappings to read and write `purchase_date` instead of `serial_number`.

#### [MODIFY] [Agent.java](file:///c:/Users/Vikas/Desktop/Enterprise-Service-Request-Management-System/application/esrms/src/main/java/com/esrms/model/Agent.java)
- Replace `specialization` with `deptId` (int) and `workload` (int) fields, plus helper fields for user details (full name, email) to enrich API responses.

#### [MODIFY] [AgentDAO.java](file:///c:/Users/Vikas/Desktop/Enterprise-Service-Request-Management-System/application/esrms/src/main/java/com/esrms/dao/AgentDAO.java)
- Update mappings to read and write `dept_id` and `workload` instead of `specialization`.

#### [MODIFY] [ServiceRequestDAO.java](file:///c:/Users/Vikas/Desktop/Enterprise-Service-Request-Management-System/application/esrms/src/main/java/com/esrms/dao/ServiceRequestDAO.java)
- Modify `getAllRequests`, `getRequestById`, `getRequestsByUser`, and `getRequestsByAgent` queries to perform a SQL `LEFT JOIN` on:
  - `priorities` to retrieve string representation of priority.
  - `categories` to retrieve category name.
  - `request_assets` to retrieve `asset_id`.
  - `assignments` to retrieve `agent_id` and `assigned_at`.
- Update `createRequest` to insert into `service_requests` and then `request_assets`.
- Update `assignRequest` to update status, insert into `assignments` table, and increment workload.
- Update `resolveRequest` to update status, insert the resolution text as a comment in the `comments` table, and decrement workload.

#### [NEW] [Services](file:///c:/Users/Vikas/Desktop/Enterprise-Service-Request-Management-System/application/esrms/src/main/java/com/esrms/service)
- `UserService.java`: Authenticate, list, add, update, delete users.
- `AgentService.java`: Manage agents and fetch workload stats.
- `AssetService.java`: Manage assets.
- `ServiceRequestService.java`: Create requests, filter by user/agent/status, resolve, and close.
- `AssignmentService.java`: Handle assignments.
- `ReportService.java`: Generate reporting metrics (SLA Violations, counts by status, agent performance metrics).

#### [NEW] [Controllers](file:///c:/Users/Vikas/Desktop/Enterprise-Service-Request-Management-System/application/esrms/src/main/java/com/esrms/controller)
- `AuthController.java`: Login endpoint (`POST /api/auth/login`).
- `UserController.java`: CRUD for users (`/api/users`).
- `AgentController.java`: CRUD for agents (`/api/agents`).
- `AssetController.java`: CRUD for assets (`/api/assets`).
- `ServiceRequestController.java`: CRUD + status updates for service requests (`/api/service-requests`).
- `AssignmentController.java`: Fetch/create assignments (`/api/assignments`).
- `ReportController.java`: Fetch system reports (`/api/reports`).

#### [DELETE] [UI Package](file:///c:/Users/Vikas/Desktop/Enterprise-Service-Request-Management-System/application/esrms/src/main/java/com/esrms/ui)
- Delete `AdminDashboard.java`, `AgentDashboard.java`, `EmployeeDashboard.java`, `LoginFrame.java`, `CreateRequestFrame.java`.

---

### 2. Frontend: React Application

We will initialize a new React app in the `frontend` folder using Vite, styled with **Material UI** following a professional blue/white enterprise theme (similar to Jira/ServiceNow).

#### File Structure
```
frontend/
  src/
    components/
      Sidebar.jsx
      Navbar.jsx
      StatCard.jsx
    context/
      AuthContext.jsx
    layouts/
      DashboardLayout.jsx
    pages/
      Login.jsx
      employee/
        EmployeeDashboard.jsx
        CreateRequest.jsx
        MyRequests.jsx
        TrackRequest.jsx
      agent/
        AgentDashboard.jsx
      admin/
        AdminDashboard.jsx
        ManageUsers.jsx
        ManageAgents.jsx
        ManageAssets.jsx
        Reports.jsx
    services/
      api.js
    App.css
    App.jsx
    main.jsx
```

---

## Verification Plan

### Automated Tests
1. Run `mvn clean compile` to check that the Java source compiles successfully without error.
2. Run Spring Boot and call `POST /api/auth/login` to verify login authentication.
3. Test CRUD endpoints using Axios calls or manual curl commands.

### Manual Verification
1. Boot the Spring Boot application (defaulting to port `8080`).
2. Boot the React development server (`npm run dev`, running on port `5173`).
3. Open the browser and test the login flow for:
   - Employee (`vikas@company.com`)
   - Agent (`manjoth@company.com`)
   - Admin (`admin@company.com`)
4. Verify that each dashboard lists the correct data and features.
5. Create a service request as an Employee, assign it to an Agent as Admin, update and resolve it as the Agent, and confirm the reports update correctly.
