package org.example.crm.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Bean
    public RestClient telegramRestClient() {
        return RestClient.builder()
                .baseUrl("https://api.telegram.org")
                .build();
    }
}
