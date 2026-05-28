package cl.duoc.smartlogix.identity.application.service.impl;

import cl.duoc.smartlogix.identity.application.mapper.UserMapper;
import cl.duoc.smartlogix.identity.application.service.AuthService;
import cl.duoc.smartlogix.identity.config.JwtProperties;
import cl.duoc.smartlogix.identity.domain.exception.InvalidCredentialsException;
import cl.duoc.smartlogix.identity.domain.exception.ResourceNotFoundException;
import cl.duoc.smartlogix.identity.infrastructure.persistence.entity.UserEntity;
import cl.duoc.smartlogix.identity.infrastructure.persistence.repository.UserRepository;
import cl.duoc.smartlogix.identity.infrastructure.security.JwtTokenService;
import cl.duoc.smartlogix.identity.presentation.dto.request.LoginRequest;
import cl.duoc.smartlogix.identity.presentation.dto.response.LoginResponse;
import cl.duoc.smartlogix.identity.presentation.dto.response.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;
    private final JwtProperties jwtProperties;

    @Override
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        UserEntity user = userRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!Boolean.TRUE.equals(user.getActive()) || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        return LoginResponse.builder()
                .accessToken(jwtTokenService.generateToken(user))
                .tokenType("Bearer")
                .expiresIn(jwtProperties.getExpirationSeconds())
                .user(UserMapper.toResponse(user))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse findAuthenticatedUser(String email) {
        UserEntity user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
        return UserMapper.toResponse(user);
    }
}
