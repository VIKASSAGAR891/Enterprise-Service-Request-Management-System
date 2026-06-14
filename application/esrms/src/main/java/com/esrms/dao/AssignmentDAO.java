package com.esrms.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import com.esrms.database.DBConnection;
import com.esrms.model.Assignment;

public class AssignmentDAO {

    public List<Assignment> getAllAssignments() {
        List<Assignment> list = new ArrayList<>();
        String sql = "SELECT * FROM assignments ORDER BY assignment_id";
        try (
            Connection conn = DBConnection.getConnection();
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(sql)
        ) {
            while (rs.next()) {
                Assignment a = new Assignment();
                a.setAssignmentId(rs.getInt("assignment_id"));
                a.setRequestId(rs.getInt("request_id"));
                a.setAgentId(rs.getInt("agent_id"));
                a.setAssignedAt(rs.getTimestamp("assigned_at"));
                list.add(a);
            }
        } catch (Exception e) {
            System.out.println("Error loading assignments: " + e.getMessage());
            e.printStackTrace();
        }
        return list;
    }
}
