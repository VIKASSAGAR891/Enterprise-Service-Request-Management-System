package com.esrms.database;

import java.sql.Connection;
import java.sql.DriverManager;

public class DBConnection 
{

    private static final String URL =
            "jdbc:mysql://localhost:3306/esrms";

    private static final String USERNAME =
            "root";

    private static final String PASSWORD =
            "root123";

    public static Connection getConnection() {

        try {

            Connection connection =
                    DriverManager.getConnection(
                            URL,
                            USERNAME,
                            PASSWORD
                    );

            System.out.println(
                    "Database Connected Successfully!"
            );

            return connection;

        } catch (Exception e) {

            System.out.println(
                    "Database Connection Failed!"
            );

            e.printStackTrace();

            return null;
        }
    }
}