package cl.duoc.smartlogix.identity.infrastructure.persistence.repository;

import cl.duoc.smartlogix.identity.infrastructure.persistence.entity.UserEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findByEmail(String email);

    boolean existsByEmail(String email);

    List<UserEntity> findByActiveTrue();
}
