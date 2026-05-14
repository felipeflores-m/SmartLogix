package cl.duoc.smartlogix.identity.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "smartlogix.jwt")
public class JwtProperties {

    private String issuer;
    private long expirationSeconds;
    private String secret;
}
