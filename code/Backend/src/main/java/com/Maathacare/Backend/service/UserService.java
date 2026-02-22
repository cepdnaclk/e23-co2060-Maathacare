package com.Maathacare.Backend.service;

import com.Maathacare.Backend.model.entity.User;
import com.Maathacare.Backend.model.enums.Role;
import com.Maathacare.Backend.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;
    public UserService(UserRepository userRepository) {
                 this.userRepository = userRepository;
             }

         public User registerNewUser(String phoneNumber, String password, Role role) {
                 if (userRepository.findByPhoneNumber(phoneNumber).isPresent()) {
                         throw new RuntimeException("This phone number is already registered!");
                     }

                 User newUser = new User();
                 newUser.setPhoneNumber(phoneNumber);
                 newUser.setPasswordHash(password);
                 newUser.setRole(role);
                 newUser.setActive(true);

                 return userRepository.save(newUser);
             }
}
