package com.leduel.buzzer.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PlayerInfo {
    String playerName;
    boolean buzzLocked;
    String soundBuzzer;

    public String getPlayerName() {
        return playerName;
    }

    public void setPlayerName(String playerName) {
        this.playerName = playerName;
    }

    public boolean isBuzzLocked() {
        return buzzLocked;
    }

    public void setBuzzLocked(boolean buzzLocked) {
        this.buzzLocked = buzzLocked;
    }

    public String getSoundBuzzer() {
        return soundBuzzer;
    }

    public void setSoundBuzzer(String soundBuzzer) {
        this.soundBuzzer = soundBuzzer;
    }
}
