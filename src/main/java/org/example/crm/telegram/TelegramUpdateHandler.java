package org.example.crm.telegram;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.crm.telegram.dto.TelegramMessage;
import org.example.crm.telegram.dto.TelegramUpdate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class TelegramUpdateHandler {

    private final TelegramApiClient telegramApiClient;

    public void handle(TelegramUpdate update) {
        TelegramMessage message = update.message();
        if (message == null || message.chat() == null) {
            log.debug("Received update without a message, ignoring: {}", update);
            return;
        }

        Long chatId = message.chat().id();
        String text = message.text();
        log.info("Received message from chat {}: {}", chatId, text);

        // TODO: replace this echo stub with real business logic
        // (e.g. link chat to a Customer, route commands, persist conversation state)
        telegramApiClient.sendMessage(chatId, "Received: " + text);
    }
}
