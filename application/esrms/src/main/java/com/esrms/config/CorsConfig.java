package com.esrms.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Support credentials
        config.setAllowCredentials(true);
        
        // Allowed origins / origin patterns
        String allowedOriginsEnv = System.getenv("ALLOWED_ORIGINS");
        if (allowedOriginsEnv != null && !allowedOriginsEnv.isEmpty()) {
            config.setAllowedOriginPatterns(List.of(allowedOriginsEnv.split(",")));
        } else {
            config.setAllowedOriginPatterns(List.of(
                "http://localhost:5173", 
                "http://localhost:3000", 
                "https://enterprise-service-request-management-system-lf9e-o2h1fxr9j.vercel.app",
                "https://*.vercel.app"
            ));
        }
        
        // Allow specific headers
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        
        // Allow specific methods
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
