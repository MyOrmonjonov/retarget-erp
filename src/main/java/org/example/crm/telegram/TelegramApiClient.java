package org.example.crm.telegram;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Slf4j
@Component
@RequiredArgsConstructor
public class TelegramApiClient {

    private final RestClient telegramRestClient;
    private final TelegramProperties telegramProperties;

    public void sendMessage(Long chatId, String text) {
        if (telegramProperties.token() == null || telegramProperties.token().isBlank()) {
            log.warn("TELEGRAM_BOT_TOKEN is not configured, skipping sendMessage to chat {}", chatId);
            return;
        }
        telegramRestClient.post()
                .uri("/bot{token}/sendMessage", telegramProperties.token())
                .body(new SendMessageRequest(chatId, text))
                .retrieve()
                .toBodilessEntity();
    }

    private record SendMessageRequest(@JsonProperty("chat_id") Long chatId, String text) {
    }
}
