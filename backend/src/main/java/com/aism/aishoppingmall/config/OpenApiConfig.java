package com.aism.aishoppingmall.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI mallOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("AI Shopping Mall API")
                        .version("v1")
                        .description("AI Shopping Mall backend REST API documentation")
                        .contact(new Contact().name("AI Shopping Mall Team")));
    }
}