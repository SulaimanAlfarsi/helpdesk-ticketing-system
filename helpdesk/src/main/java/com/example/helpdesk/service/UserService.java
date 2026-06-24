package com.example.helpdesk.service;

import com.example.helpdesk.dto.CreateUserRequest;
import com.example.helpdesk.dto.UserResponse;
import com.example.helpdesk.entity.User;
import com.example.helpdesk.exception.BusinessRuleException;
import com.example.helpdesk.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        if (!request.email().matches("^[\\w.+\\-]+@[\\w.\\-]+\\.[a-zA-Z]{2,3}$")) {
            throw new BusinessRuleException("Email must have a valid domain (e.g. .com or .om)");
        }

        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessRuleException("User email already exists");
        }

        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setCreatedAt(LocalDateTime.now());

        return toResponse(userRepository.save(user));
    }

    public UserResponse toResponse(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getCreatedAt());
    }
}
