package org.example.crm.telegram;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "telegram.bot")
public record TelegramProperties(
        String token,
        String username,
        String webhookSecret
) {
}
