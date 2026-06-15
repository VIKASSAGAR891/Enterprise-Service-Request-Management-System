# Run Instructions - ESRMS

Follow the steps below in separate terminal windows to launch the Spring Boot backend server and Vite React frontend portal.

---

## Prerequisites
* **Java JDK 21** or **JDK 26**
* **Maven** (v3.9+)
* **Node.js** (v18+)
* **MySQL Server** (listening on `localhost:3306` with database `esrms`, username `root`, password `root123`)

---

## 1. Start the Spring Boot Backend Server
Open your first terminal window, navigate to the backend subdirectory, and build and launch the API server:

```bash
# Navigate to the backend directory
cd application/esrms

# Clean compile the Java classes
mvn clean compile

# Run the Spring Boot application
mvn exec:java "-Dexec.mainClass=com.esrms.App"
```

* **Backend Listening Endpoint**: `http://localhost:8080`
* **Configuration File**: [pom.xml](file:///c:/Users/Vikas/Desktop/Enterprise-Service-Request-Management-System/application/esrms/pom.xml)

---

## 2. Start the Vite React Frontend Portal
Open your second terminal window, navigate to the frontend subdirectory, install dependencies, and launch the development server:

```bash
# Navigate to the frontend directory
cd frontend

# Install node dependencies (run this once on initial setup)
npm install

# Start the Vite React development server
npm run dev
```

* **Frontend Listening Endpoint**: `http://localhost:5173` (Open this in your browser)
* **Configuration File**: [package.json](file:///c:/Users/Vikas/Desktop/Enterprise-Service-Request-Management-System/frontend/package.json)
