# Enterprise Service Request Management System (ESRMS)

ESRMS is a modern web-based IT Service Management (ITSM) system designed to streamline the lifecycle of corporate service tickets. It provides customized dashboard interfaces for **Employees**, **Support Agents**, and **Administrators** to submit, categorize, prioritize, assign, track, resolve, and audit service requests.

---

## Architecture Overview

The system uses a 3-tier enterprise architecture:

```
[ React Frontend ] ──(REST APIs/JSON)──> [ Spring Boot REST API ] ──(JDBC)──> [ MySQL Database ]
```

1. **Frontend**: Built using React 19, Vite, Material UI (MUI 9), and Recharts for premium stats visualizations.
2. **Backend**: Spring Boot 3.4.3 exposing REST APIs, executing relational SQL mappings through JDBC.
3. **Database**: MySQL 8.0+ storing tickets, lookups, trigger histories, assignments, and audit logs.

---

## Prerequisites

Ensure you have the following installed on your machine:
- **Java JDK 21** or **Java JDK 26**
- **Node.js** (v18+)
- **Maven** (v3.9+)
- **MySQL Server** (v8.0+)

---

## Getting Started

### 1. Database Configuration
Confirm that your local MySQL server is running and database configuration matches `application/esrms/src/main/java/com/esrms/database/DBConnection.java`:
- **Database Name**: `esrms`
- **Username**: `root`
- **Password**: `root123`

*(Note: The database tables, triggers, and sample data are already initialized on the MySQL instance).*

### 2. Set Up & Run the Spring Boot Backend

Open your terminal, navigate to the backend folder, and run a clean compile:

```bash
cd application/esrms
mvn clean compile
```

Start the Spring Boot REST API server:

```bash
mvn exec:java "-Dexec.mainClass=com.esrms.App"
```

The REST API will boot up and listen on **`http://localhost:8080`**.

### 3. Set Up & Run the React Frontend

Open a new terminal window, navigate to the frontend folder, and install the npm dependencies:

```bash
cd frontend
npm install
```

Launch the Vite development server:

```bash
npm run dev
```

The portal will boot up on **`http://localhost:5173/`**. Open this URL in your web browser.

---

## Default Accounts for Testing

Log in using any of the following credentials to test the various dashboards:

| Role | Email Address | Password | Features / Responsibilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@company.com` | `123` | Directory management, asset registry, ticket assignment, Recharts analytics |
| **Employee** | `vikas@company.com` | `123` | Request ticket creation, track status, edit details, confirm closures |
| **Agent** | `manjoth@company.com` | `123` | Workload inbox, ticket resolution, resolution details comments, escalations |
| **Team Lead** | `shruti@company.com` | `123` | Assigned workspace operations |

---

## Directory Layout

```text
├── database/                   # DB triggers & SQL scripts (MySQL)
├── application/
│   └── esrms/                  # Maven Java Spring Boot project
│       ├── pom.xml             # Backend dependencies & Java build config
│       └── src/main/java/      # REST Controllers, Services, DAOs, DTOs & Models
└── frontend/                   # React Single-Page Application (Vite)
    ├── package.json            # Node packages list (Axios, Material UI, Recharts)
    ├── index.html              # HTML entry with custom SEO meta tags
    └── src/                    # Router configuration, Auth context, Pages & Layouts
```

For more internal details regarding the schema corrections and file structure, refer to the [PROJECT_DETAILS.md](PROJECT_DETAILS.md) file.
