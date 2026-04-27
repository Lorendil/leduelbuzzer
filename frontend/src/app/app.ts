import { Component, HostListener } from '@angular/core';
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
  isAlreadyPicked: boolean = false;
  players: PlayerInfo[] = [];
  winner: string | null = null;
  volume: number = 0.5;
  listenToReset: boolean = true;

  private resetSound: HTMLAudioElement = new Audio('sounds/Reset.wav');
  private sounds: { [key: string]: HTMLAudioElement } = {};
  private lastResetTime = 0;
  soundKeys = Object.keys(this.sounds);

  constructor(private buzzerService: BuzzerService) {
    // --- Écoute les joueurs ---
    this.buzzerService.onPlayers((msg: PlayerInfo[]) => {
      this.players = msg.map((p) => ({ ...p })); // nouvelle référence pour Angular
    });

    // --- Écoute le reset ---
    this.buzzerService.onReset(() => {
      const now = Date.now();
      if (now - this.lastResetTime < 3000) return;
      this.lastResetTime = now;

      this.winner = null;

      if (this.listenToReset) {
        this.resetSound.volume = this.volume;
        this.resetSound.currentTime = 0;
        this.resetSound.play().catch(() => {});
      }
    });
  }

  ngOnInit() {
    this.subscribeAdminPlayers();
    // Précharger les sons
    this.sounds = {
      anneau: new Audio('sounds/Anneau.wav'),
      baston: new Audio('sounds/Baston.wav'),
      canard: new Audio('sounds/Canard.wav'),
      champignon: new Audio('sounds/Champignon.wav'),
      chat: new Audio('sounds/Chat.wav'),
      chaussette: new Audio('sounds/Chaussette.wav'),
      cheval: new Audio('sounds/Cheval.wav'),
      chien: new Audio('sounds/Chien.wav'),
      cri_wilhelm: new Audio('sounds/Cri Wilhelm.wav'),
      dauphin: new Audio('sounds/Dauphin.wav'),
      fee_du_duel: new Audio('sounds/Fée du Duel.wav'),
      fee_navi: new Audio('sounds/Fée Navi.wav'),
      fessee: new Audio('sounds/Fessée.wav'),
      holala_1: new Audio('sounds/Holala 1.wav'),
      holala_2: new Audio('sounds/Holala 2.wav'),
      keuwa: new Audio('sounds/Keuwa.wav'),
      koopa_troopa: new Audio('sounds/Koopa Troopa.wav'),
      mario: new Audio('sounds/Mario.wav'),
      mouton: new Audio('sounds/Mouton.wav'),
      murloc: new Audio('sounds/Murloc.wav'),
      objection: new Audio('sounds/Objection.wav'),
      philippe: new Audio('sounds/Philippe.wav'),
      pognon: new Audio('sounds/Pognon.wav'),
      poule: new Audio('sounds/Poule.wav'),
      pour_lhonneur: new Audio("sounds/Pour l'honneur.wav"),
      prends_ca: new Audio('sounds/Prends ça.wav'),
      r2d2: new Audio('sounds/R2D2.wav'),
      tigre: new Audio('sounds/Tigre.wav'),
      vache: new Audio('sounds/Vache.wav'),
      waow: new Audio('sounds/Waow.wav'),
      wololo: new Audio('sounds/Wololo.wav'),
      wookie: new Audio('sounds/Wookie.wav'),
    };
    this.soundKeys = Object.keys(this.sounds);

    // Écoute les buzz
    this.buzzerService.onBuzz((msg: string) => {
      this.winner = msg;
      const player = this.players.find((p) => p.playerName === msg);
      const soundKey = player?.soundBuzzer || 'cow';
      const sound = this.sounds[soundKey];
      if (sound) {
        sound.volume = this.volume;
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
      this.isAlreadyPicked = false;
      console.log(this.players);
      for (let i = 0; i < this.players.length; i++) {
        if (this.players[i].playerName == this.playerName) {
          this.isAlreadyPicked = true;
          break;
        }
      }
      if (!this.isAlreadyPicked) {
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
  }

  onVolumeChange() {
    const previewKey = this.currentPlayer?.soundBuzzer || this.soundKeys[0];
    const sound = this.sounds[previewKey];

    if (sound) {
      sound.volume = this.volume;
      sound.currentTime = 0;

      sound.play().catch(() => {});
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
    const sound = this.sounds[newSound];

    if (sound) {
      sound.volume = this.volume;
      sound.currentTime = 0;

      sound.play().catch(() => {});
    }
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

  @HostListener('window:keydown.space', ['$event'])
  handleSpace(event: Event) {
    const keyboardEvent = event as KeyboardEvent;

    const target = keyboardEvent.target as HTMLElement;

    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    keyboardEvent.preventDefault();

    if (this.joined && !this.winner && !this.currentPlayer?.buzzLocked) {
      this.buzz();
    }
  }
}
