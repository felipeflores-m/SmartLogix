package cl.duoc.smartlogix.identity.infrastructure.persistence.repository;

import cl.duoc.smartlogix.identity.infrastructure.persistence.entity.UserEntity;
import cl.duoc.smartlogix.identity.domain.enums.RoleName;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findByEmail(String email);

    Optional<UserEntity> findByEmailIgnoreCase(String email);

    boolean existsByEmail(String email);

    boolean existsByEmailIgnoreCase(String email);

    long countByActiveTrueAndRole_Name(RoleName roleName);

    List<UserEntity> findByActiveTrue();
}
