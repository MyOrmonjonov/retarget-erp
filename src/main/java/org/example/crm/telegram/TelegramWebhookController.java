package org.example.crm.telegram;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.crm.telegram.dto.TelegramUpdate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/telegram")
@RequiredArgsConstructor
public class TelegramWebhookController {

    private final TelegramProperties telegramProperties;
    private final TelegramUpdateHandler telegramUpdateHandler;

    @PostMapping("/webhook/{secret}")
    public ResponseEntity<Void> receiveUpdate(@PathVariable String secret, @RequestBody TelegramUpdate update) {
        if (!telegramProperties.webhookSecret().equals(secret)) {
            log.warn("Rejected Telegram webhook call with invalid secret");
            return ResponseEntity.notFound().build();
        }
        telegramUpdateHandler.handle(update);
        return ResponseEntity.ok().build();
    }
}
