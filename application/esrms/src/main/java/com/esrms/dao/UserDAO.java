package com.esrms.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import com.esrms.database.DBConnection;
import com.esrms.model.User;

/**
 * UserDAO.java
 * 
 * Data Access Object for managing users in the database.
 * Provides CRUD operations and authentication for user management.
 * 
 * Methods:
 * - login() - Authenticate user with email and password
 * - addUser() - Create a new user
 * - updateUser() - Update user information
 * - deleteUser() - Delete a user
 * - getAllUsers() - Get all users
 * - getUserById() - Get specific user by ID
 * - getUserByEmail() - Get user by email
 * - getUsersByRole() - Get users filtered by role
 */
public class UserDAO {

    /**
     * Authenticates a user with email and password
     * 
     * @param email The user's email
     * @param password The user's password
     * @return User object if authentication successful, null otherwise
     */
    public User login(String email, String password) {

        User user = null;

        String sql = """
                SELECT *
                FROM users
                WHERE email = ?
                AND password_hash = ?
                """;

        try (
                Connection conn = DBConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)
        ) {

            ps.setString(1, email);
            ps.setString(2, password);

            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                user = mapResultSetToUser(rs);
            }

        } catch (Exception e) {
            System.out.println("Error during login: " + e.getMessage());
            e.printStackTrace();
        }

        return user;
    }

    /**
     * Adds a new user to the database
     * 
     * @param fullName The user's full name
     * @param email The user's email address
     * @param passwordHash The hashed password
     * @param role The user's role (ADMIN, AGENT, EMPLOYEE)
     * @return true if user added successfully, false otherwise
     */
    public boolean addUser(String fullName, String email, String passwordHash, String role) {
        
        String sql = """
            INSERT INTO users (full_name, email, password_hash, role)
            VALUES (?, ?, ?, ?)
            """;

        try (
            Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement(sql)
        ) {
            ps.setString(1, fullName);
            ps.setString(2, email);
            ps.setString(3, passwordHash);
            ps.setString(4, role);

            int rowsAffected = ps.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("User added successfully");
                return true;
            }

        } catch (Exception e) {
            System.out.println("Error adding user: " + e.getMessage());
            e.printStackTrace();
        }

        return false;
    }

    /**
     * Updates an existing user's information
     * 
     * @param userId The ID of the user to update
     * @param fullName Updated full name
     * @param email Updated email address
     * @param role Updated role
     * @return true if update successful, false otherwise
     */
    public boolean updateUser(int userId, String fullName, String email, String role) {
        
        String sql = """
            UPDATE users 
            SET full_name = ?, email = ?, role = ?
            WHERE user_id = ?
            """;

        try (
            Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement(sql)
        ) {
            ps.setString(1, fullName);
            ps.setString(2, email);
            ps.setString(3, role);
            ps.setInt(4, userId);

            int rowsAffected = ps.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("User updated successfully");
                return true;
            }

        } catch (Exception e) {
            System.out.println("Error updating user: " + e.getMessage());
            e.printStackTrace();
        }

        return false;
    }

    /**
     * Deletes a user from the database
     * 
     * @param userId The ID of the user to delete
     * @return true if deletion successful, false otherwise
     */
    public boolean deleteUser(int userId) {
        
        String sql = """
            DELETE FROM users
            WHERE user_id = ?
            """;

        try (
            Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement(sql)
        ) {
            ps.setInt(1, userId);

            int rowsAffected = ps.executeUpdate();
            
            if (rowsAffected > 0) {
                System.out.println("User deleted successfully");
                return true;
            }

        } catch (Exception e) {
            System.out.println("Error deleting user: " + e.getMessage());
            e.printStackTrace();
        }

        return false;
    }

    /**
     * Retrieves all users from the database
     * 
     * @return List of all User objects
     */
    public List<User> getAllUsers() {
        
        List<User> users = new ArrayList<>();
        String sql = """
            SELECT * FROM users
            ORDER BY user_id
            """;

        try (
            Connection conn = DBConnection.getConnection();
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(sql)
        ) {
            while (rs.next()) {
                User user = mapResultSetToUser(rs);
                users.add(user);
            }

        } catch (Exception e) {
            System.out.println("Error retrieving all users: " + e.getMessage());
            e.printStackTrace();
        }

        return users;
    }

    /**
     * Retrieves a specific user by ID
     * 
     * @param userId The ID of the user
     * @return User object or null if not found
     */
    public User getUserById(int userId) {
        
        String sql = """
            SELECT * FROM users
            WHERE user_id = ?
            """;

        try (
            Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement(sql)
        ) {
            ps.setInt(1, userId);
            
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return mapResultSetToUser(rs);
            }

        } catch (Exception e) {
            System.out.println("Error retrieving user by ID: " + e.getMessage());
            e.printStackTrace();
        }

        return null;
    }

    /**
     * Retrieves a user by email address
     * 
     * @param email The email address to search for
     * @return User object or null if not found
     */
    public User getUserByEmail(String email) {
        
        String sql = """
            SELECT * FROM users
            WHERE email = ?
            """;

        try (
            Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement(sql)
        ) {
            ps.setString(1, email);
            
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                return mapResultSetToUser(rs);
            }

        } catch (Exception e) {
            System.out.println("Error retrieving user by email: " + e.getMessage());
            e.printStackTrace();
        }

        return null;
    }

    /**
     * Retrieves users filtered by role
     * 
     * @param role The role to filter by (ADMIN, AGENT, EMPLOYEE)
     * @return List of User objects with matching role
     */
    public List<User> getUsersByRole(String role) {
        
        List<User> users = new ArrayList<>();
        String sql = """
            SELECT * FROM users
            WHERE role = ?
            ORDER BY user_id
            """;

        try (
            Connection conn = DBConnection.getConnection();
            PreparedStatement ps = conn.prepareStatement(sql)
        ) {
            ps.setString(1, role);
            
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                User user = mapResultSetToUser(rs);
                users.add(user);
            }

        } catch (Exception e) {
            System.out.println("Error retrieving users by role: " + e.getMessage());
            e.printStackTrace();
        }

        return users;
    }

    /**
     * Helper method to map ResultSet to User object
     * 
     * @param rs The ResultSet containing user data
     * @return User object populated with data from ResultSet
     */
    private User mapResultSetToUser(ResultSet rs) throws Exception {
        
        User user = new User();
        
        user.setUserId(rs.getInt("user_id"));
        user.setFullName(rs.getString("full_name"));
        user.setEmail(rs.getString("email"));
        user.setPasswordHash(rs.getString("password_hash"));
        user.setRole(rs.getString("role"));
        
        return user;
    }
}