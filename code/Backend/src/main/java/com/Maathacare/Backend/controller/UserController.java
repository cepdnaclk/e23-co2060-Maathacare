package com.Maathacare.Backend.controller;

import com.Maathacare.Backend.dto.UserRegistrationRequest;
import com.Maathacare.Backend.model.entity.User;
import com.Maathacare.Backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
             this.userService = userService;
         }

     @PostMapping("/register")
     public ResponseEntity registerUser(@RequestBody UserRegistrationRequest request) {
             try {
                     User newUser = userService.registerNewUser(
                                     request.getPhoneNumber(),
                                     request.getPassword(),
                                     request.getRole()
                             );
                     return ResponseEntity.ok("Success! User registered: " + newUser.getId());
                 } catch (RuntimeException e) {
                     return ResponseEntity.badRequest().body(e.getMessage());
                 }
         }

}
