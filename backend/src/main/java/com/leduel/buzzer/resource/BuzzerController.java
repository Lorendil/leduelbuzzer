package com.leduel.buzzer.resource;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.stream.Collectors;

@Controller
public class BuzzerController {

    private boolean buzzerPressed = false;

    private ArrayList<String> joueurs = new ArrayList<>();

    @MessageMapping("/join")
    @SendTo("/topic/players")
    public ArrayList<String> join(String player) {
        joueurs.add(player);
        return joueurs;
    }

    @MessageMapping("/updateCurrentPlayers")
    @SendTo("/topic/currentPlayers")
    public ArrayList<String> currentPlayers(String rule) {
        if (rule.equalsIgnoreCase("clearAllPlayers")) {
            joueurs = new ArrayList<>();
        } else {
            joueurs = joueurs.stream().filter(p -> !p.equalsIgnoreCase(rule)).collect(Collectors.toCollection(ArrayList::new));
        }
        return joueurs;
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

