package cl.duoc.smartlogix.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(authorize -> authorize
                        // Health is public so the team can validate that the gateway is running.
                        .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Gateway routes remain open temporarily for MVP development and initial demos.
                        .requestMatchers("/api/**").permitAll()
                        // Avoid blocking early academic tests before real authentication is implemented.
                        .anyRequest().permitAll()
                );

        // JWT/OAuth2 Resource Server validation will be enabled here when the MVP adds real tokens.
        return http.build();
    }
}
