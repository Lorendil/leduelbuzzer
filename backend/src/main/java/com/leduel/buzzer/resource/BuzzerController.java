package com.leduel.buzzer.resource;

import com.leduel.buzzer.dto.PlayerInfo;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.stream.Collectors;

@Controller
public class BuzzerController {

    private boolean buzzerPressed = false;

    private ArrayList<PlayerInfo> joueurs = new ArrayList<>();

    @MessageMapping("/join")
    @SendTo("/topic/players")
    public ArrayList<PlayerInfo> join(PlayerInfo player) {
        if (joueurs.stream().anyMatch(p -> p.getPlayerName().equalsIgnoreCase(player.getPlayerName()))) {
            return joueurs;
        }
        joueurs.add(player);
        return joueurs;
    }
    @MessageMapping("/subscribePlayers")
    @SendTo("/topic/players")
    public ArrayList<PlayerInfo> subscribePlayers() {
        return joueurs;
    }

    @MessageMapping("/updateCurrentPlayers")
    @SendTo("/topic/players")
    public ArrayList<PlayerInfo> currentPlayers(String rule) {
        if (rule.equalsIgnoreCase("clearAllPlayers")) {
            joueurs = new ArrayList<>();
        } else {
            joueurs = joueurs.stream().filter(p -> !p.getPlayerName().equalsIgnoreCase(rule)).collect(Collectors.toCollection(ArrayList::new));
        }
        return joueurs;
    }
    @MessageMapping("/updatePlayer")
    @SendTo("/topic/players") // <-- changer ici
    public ArrayList<PlayerInfo> updatePlayer(PlayerInfo updatedPlayer) {
        joueurs = joueurs.stream()
                .map(p -> {
                    if (p.getPlayerName().equalsIgnoreCase(updatedPlayer.getPlayerName())) {
                        p.setBuzzLocked(updatedPlayer.isBuzzLocked());
                        p.setSoundBuzzer(updatedPlayer.getSoundBuzzer());
                    }
                    return p;
                })
                .collect(Collectors.toCollection(ArrayList::new));
        return joueurs;
    }

    @MessageMapping("/buzz")
    @SendTo("/topic/buzz")
    public String buzz(String player) {
        if (!buzzerPressed) {
            buzzerPressed = true;
            return player;
        }
        return player;
    }

    @MessageMapping("/reset")
    @SendTo("/topic/reset")
    public String reset() {
        buzzerPressed = false;
        return "La partie est réinitialisée";
    }
}

