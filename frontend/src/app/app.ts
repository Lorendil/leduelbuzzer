import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { BuzzerService } from './services/buzzer.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  playerName: string = '';
  joined: boolean = false;
  players: string[] = [];
  winner: string | null = null;

  constructor(private buzzerService: BuzzerService) {
    // écoute les nouveaux joueurs
    this.buzzerService.onPlayers((msg: string) => {
      this.players.push(msg); // ici tu pourrais parser JSON si tu veux plus de structure
    });

    // écoute les buzz
    this.buzzerService.onBuzz((msg: string) => {
      this.winner = msg;
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
    this.winner = null;
    // (optionnel : publier un /reset côté service si tu l’as implémenté)
  }
}
