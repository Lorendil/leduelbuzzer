package com.leduel.buzzer.resource;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class BuzzerController {

    private boolean buzzerPressed = false;

    @MessageMapping("/join")
    @SendTo("/topic/players")
    public String join(String player) {
        return player + " a rejoint la partie !";
    }

    @MessageMapping("/buzz")
    @SendTo("/topic/buzz")
    public String buzz(String player) {
        if (!buzzerPressed) {
            buzzerPressed = true;
            return player + " a buzzé en premier !";
        }
        return player + " a essayé de buzzer mais trop tard 😅";
    }

    @MessageMapping("/reset")
    @SendTo("/topic/reset")
    public String reset() {
        buzzerPressed = false;
        return "La partie est réinitialisée";
    }
}

