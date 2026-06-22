package com.esrms.database;

import java.sql.Connection;
import java.sql.DriverManager;

public class DBConnection 
{
    public static String getUrlForDebug() {
        String dbUrl = System.getenv("DB_URL");
        return dbUrl != null ? maskUrl(dbUrl) : "jdbc:mysql://localhost:3306/esrms";
    }

    private static String maskUrl(String url) {
        if (url == null) return "null";
        // Mask passwords in URL for safety
        return url.replaceAll("(?i)(password=)[^&]*", "$1******")
                  .replaceAll("(?i)(//[^:]+:)[^@]+(@)", "$1******$2");
    }

    public static Connection getConnection() {
        String dbUrl = System.getenv("DB_URL");
        String dbUser = System.getenv("DB_USER");
        String dbPassword = System.getenv("DB_PASSWORD");

        System.out.println("[DB CONNECTION DEBUG] Attempting database connection...");
        System.out.println("[DB CONNECTION DEBUG] Configured URL: " + getUrlForDebug());
        System.out.println("[DB CONNECTION DEBUG] DB_USER env var is set: " + (dbUser != null));
        System.out.println("[DB CONNECTION DEBUG] DB_PASSWORD env var is set: " + (dbPassword != null));

        try {
            // Explicitly load MySQL driver to ensure registration in container environments
            Class.forName("com.mysql.cj.jdbc.Driver");

            Connection connection;
            if (dbUrl != null) {
                // If the URL starts with mysql:// (e.g. Render MySQL addon), prefix with jdbc:
                if (dbUrl.startsWith("mysql://")) {
                    dbUrl = "jdbc:" + dbUrl;
                    System.out.println("[DB CONNECTION DEBUG] Adjusted URL to include jdbc: prefix");
                }

                if (dbUser != null && !dbUser.trim().isEmpty() && dbPassword != null) {
                    connection = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
                } else {
                    // Use unified connection URL directly if user/password environment variables are not separately set
                    connection = DriverManager.getConnection(dbUrl);
                }
            } else {
                // Fallback to local development default
                connection = DriverManager.getConnection(
                        "jdbc:mysql://localhost:3306/esrms",
                        "root",
                        "root123"
                );
            }

            System.out.println("[DB CONNECTION DEBUG] Database Connected Successfully!");
            return connection;

        } catch (Exception e) {
            System.out.println("[DB CONNECTION DEBUG] Database Connection Failed! Error: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
}