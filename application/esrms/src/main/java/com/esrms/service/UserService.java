package com.esrms.service;

import java.util.List;
import com.esrms.dao.UserDAO;
import com.esrms.model.User;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserDAO userDAO = new UserDAO();

    public User login(String email, String password) {
        return userDAO.login(email, password);
    }

    public boolean addUser(User user) {
        return userDAO.addUser(user.getFullName(), user.getEmail(), user.getPasswordHash(), user.getRole());
    }

    public boolean updateUser(int id, User user) {
        return userDAO.updateUser(id, user.getFullName(), user.getEmail(), user.getRole());
    }

    public boolean deleteUser(int id) {
        return userDAO.deleteUser(id);
    }

    public List<User> getAllUsers() {
        return userDAO.getAllUsers();
    }

    public User getUserById(int id) {
        return userDAO.getUserById(id);
    }

    public User getUserByEmail(String email) {
        return userDAO.getUserByEmail(email);
    }

    public List<User> getUsersByRole(String role) {
        return userDAO.getUsersByRole(role);
    }
}
