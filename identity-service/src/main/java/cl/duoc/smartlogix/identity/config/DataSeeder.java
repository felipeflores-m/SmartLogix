package cl.duoc.smartlogix.identity.config;

import cl.duoc.smartlogix.identity.domain.enums.RoleName;
import cl.duoc.smartlogix.identity.infrastructure.persistence.entity.RoleEntity;
import cl.duoc.smartlogix.identity.infrastructure.persistence.entity.UserEntity;
import cl.duoc.smartlogix.identity.infrastructure.persistence.repository.RoleRepository;
import cl.duoc.smartlogix.identity.infrastructure.persistence.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    @ConditionalOnProperty(name = "smartlogix.seed.enabled", havingValue = "true", matchIfMissing = true)
    CommandLineRunner seedIdentityData() {
        return args -> {
            RoleEntity admin = seedRole(RoleName.ADMIN, "Administrador del sistema");
            RoleEntity operator = seedRole(RoleName.OPERATOR, "Operador logistico");
            RoleEntity viewer = seedRole(RoleName.VIEWER, "Usuario solo lectura");

            seedUser("admin@smartlogix.cl", "admin123", "Administrador SmartLogix", admin);
            seedUser("operator@smartlogix.cl", "operator123", "Operador SmartLogix", operator);
            seedUser("viewer@smartlogix.cl", "viewer123", "Visualizador SmartLogix", viewer);
        };
    }

    private RoleEntity seedRole(RoleName name, String description) {
        return roleRepository.findByName(name)
                .orElseGet(() -> roleRepository.save(RoleEntity.builder()
                        .name(name)
                        .description(description)
                        .build()));
    }

    private void seedUser(String email, String password, String fullName, RoleEntity role) {
        if (userRepository.existsByEmail(email)) {
            return;
        }

        userRepository.save(UserEntity.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .fullName(fullName)
                .role(role)
                .active(true)
                .build());
    }
}
