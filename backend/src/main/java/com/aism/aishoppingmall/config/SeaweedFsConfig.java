package com.aism.aishoppingmall.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class SeaweedFsConfig {

    @Bean
    WebClient seaweedFsWebClient(@Value("${app.seaweedfs.server.addr}") String serverAddr) {
        return WebClient.builder()
                .baseUrl(serverAddr)
                .build();
    }
}
