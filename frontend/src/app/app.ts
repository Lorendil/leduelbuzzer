import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { BuzzerService, PlayerInfo } from './services/buzzer.service';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { SelectButtonModule } from 'primeng/selectbutton';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    PasswordModule,
    CheckboxModule,
    TableModule,
    SelectButtonModule,
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class AppComponent {
  password: string = '';
  playerName: string = '';
  joined: boolean = false;
  isAdmin: boolean = false;
  players: PlayerInfo[] = [];
  winner: string | null = null;

  private sounds: { [key: string]: HTMLAudioElement } = {};
  soundKeys = Object.keys(this.sounds);

  constructor(private buzzerService: BuzzerService) {
    // --- Écoute les joueurs ---
    this.buzzerService.onPlayers((msg: PlayerInfo[]) => {
      this.players = msg.map((p) => ({ ...p })); // nouvelle référence pour Angular
    });

    // --- Écoute le reset ---
    this.buzzerService.onReset(() => (this.winner = null));
  }

  ngOnInit() {
    // Précharger les sons
    this.sounds = {
      cow: new Audio('sounds/cow.wav'),
      cricket: new Audio('sounds/cricket.wav'),
      horse: new Audio('sounds/horse.wav'),
      klaxon: new Audio('sounds/klaxon.wav'),
      siren: new Audio('sounds/siren.wav'),
      sheep: new Audio('sounds/sheep.wav'),
    };
    this.soundKeys = Object.keys(this.sounds);

    // Écoute les buzz
    this.buzzerService.onBuzz((msg: string) => {
      this.winner = msg;
      const player = this.players.find((p) => p.playerName === msg);
      const soundKey = player?.soundBuzzer || 'cow';
      const sound = this.sounds[soundKey];
      if (sound) {
        sound.currentTime = 0;
        sound.play().catch((err) => console.error('Erreur lecture son :', err));
      }
    });
  }

  get currentPlayer(): PlayerInfo | undefined {
    return this.players.find((p) => p.playerName === this.playerName);
  }

  join() {
    if (this.playerName.trim()) {
      const soundKey = this.chooseRandomSound();
      const player: PlayerInfo = {
        playerName: this.playerName,
        buzzLocked: false,
        soundBuzzer: soundKey,
      };
      this.joined = true;
      this.buzzerService.join(player);
    }
  }

  buzz() {
    if (!this.winner) {
      this.buzzerService.buzz(this.playerName);
    }
  }

  reset() {
    this.buzzerService.reset();
  }

  connectToAdmin() {
    this.isAdmin = this.password === 'choucroute';
    this.password = '';
    if (this.isAdmin) {
      this.subscribeAdminPlayers();
    }
  }

  subscribeAdminPlayers() {
    this.buzzerService.subscribePlayers((players) => {
      this.players = players.map((p) => ({ ...p })); // nouvelle référence
    });
  }

  clearAllPlayers() {
    this.buzzerService.updatePlayers('clearAllPlayers');
  }

  removePlayer(name: string) {
    this.buzzerService.updatePlayers(name);
  }

  updatePlayerBuzzLock(player: PlayerInfo) {
    this.buzzerService.updatePlayer(player);
  }

  onSoundChange(player: PlayerInfo, newSound: string) {
    player.soundBuzzer = newSound; // met à jour la valeur localement
    this.updatePlayerBuzzLock(player); // ou une autre méthode pour notifier le backend
  }

  togglePlayerLock(player: PlayerInfo) {
    player.buzzLocked = !player.buzzLocked;
    this.updatePlayerBuzzLock(player);
  }

  private chooseRandomSound(): string {
    const keys = Object.keys(this.sounds);
    return keys[Math.floor(Math.random() * keys.length)];
  }
}
