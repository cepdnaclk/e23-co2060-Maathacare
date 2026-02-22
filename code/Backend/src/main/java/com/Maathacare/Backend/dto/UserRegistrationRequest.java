package com.Maathacare.Backend.dto;

import com.Maathacare.Backend.model.enums.Role;

public class UserRegistrationRequest {
    private String phoneNumber;
    private String password;
    private Role role;

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
