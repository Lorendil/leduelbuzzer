import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { BuzzerService } from './services/buzzer.service';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, PasswordModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class AppComponent {
  password: string = '';
  playerName: string = '';
  joined: boolean = false;
  isAdmin: boolean = false;
  players: string[] = [];
  winner: string | null = null;

  constructor(private buzzerService: BuzzerService) {
    // écoute les joueurs
    this.buzzerService.onPlayers((msg: string[]) => (this.players = msg));

    // écoute les buzz
    this.buzzerService.onBuzz((msg: string) => (this.winner = msg));

    // écoute le reset
    this.buzzerService.onReset(() => (this.winner = null));

    // écoute les modifications de joueurs
    this.buzzerService.onCurrentPlayers((players: string[]) => {
      this.players = players;

      // Si le joueur courant n'est plus dans la liste, on le déconnecte
      if (this.joined && !players.includes(this.playerName)) {
        this.joined = false;
      }
    });
  }

  join() {
    if (this.playerName.trim()) {
      this.joined = true;
      this.buzzerService.join(this.playerName);
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
    this.password = ''; // efface le password
  }

  clearAllPlayers() {
    this.buzzerService.updatePlayers('clearAllPlayers');
  }

  removePlayer(name: string) {
    this.buzzerService.updatePlayers(name);
  }
}
