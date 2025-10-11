export class PlayerInfo {
  playerName: string;
  buzzLocked: boolean;
  soundBuzzer: string;

  constructor(name: string, sound: string, locked = false) {
    this.playerName = name;
    this.soundBuzzer = sound;
    this.buzzLocked = locked;
  }
}
