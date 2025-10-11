import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// Définition du type correspondant à ton DTO Java
export interface PlayerInfo {
  playerName: string;
  buzzLocked: boolean;
  soundBuzzer: string;
}

@Injectable({ providedIn: 'root' })
export class BuzzerService {
  private client: Client;
  private connected = false;
  private pendingSubscriptions: (() => void)[] = [];

  constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('✅ WebSocket connecté !');
        this.connected = true;
        this.pendingSubscriptions.forEach((fn) => fn());
        this.pendingSubscriptions = [];
      },
      onStompError: (frame) => {
        console.error('❌ STOMP error:', frame);
      },
    });

    this.client.activate();
  }

  // --- Envoi ---
  join(player: PlayerInfo) {
    this.client.publish({ destination: '/app/join', body: JSON.stringify(player) });
  }

  buzz(playerName: string) {
    this.client.publish({ destination: '/app/buzz', body: playerName });
  }

  reset() {
    this.client.publish({ destination: '/app/reset' });
  }

  updatePlayers(rule: string) {
    this.client.publish({ destination: '/app/updateCurrentPlayers', body: rule });
  }

  // --- Réception ---
  onReset(callback: (msg: string) => void) {
    const subscribeFn = () => {
      this.client.subscribe('/topic/reset', (message) => callback(message.body));
    };
    this.connected ? subscribeFn() : this.pendingSubscriptions.push(subscribeFn);
  }

  onBuzz(callback: (msg: string) => void) {
    const subscribeFn = () => {
      this.client.subscribe('/topic/buzz', (message) => callback(message.body));
    };
    this.connected ? subscribeFn() : this.pendingSubscriptions.push(subscribeFn);
  }

  onPlayers(callback: (players: PlayerInfo[]) => void) {
    const subscribeFn = () => {
      this.client.subscribe('/topic/players', (message) => {
        try {
          const players = JSON.parse(message.body) as PlayerInfo[];
          callback(players);
        } catch (e) {
          console.error('Erreur parsing onPlayers:', e, message.body);
        }
      });
    };
    this.connected ? subscribeFn() : this.pendingSubscriptions.push(subscribeFn);
  }

  onCurrentPlayers(callback: (players: PlayerInfo[]) => void) {
    const subscribeFn = () => {
      this.client.subscribe('/topic/currentPlayers', (message) => {
        try {
          const players = JSON.parse(message.body) as PlayerInfo[];
          callback(players);
        } catch (e) {
          console.error('Erreur parsing currentPlayers:', e, message.body);
        }
      });
    };
    this.connected ? subscribeFn() : this.pendingSubscriptions.push(subscribeFn);
  }

  subscribePlayers(callback: (players: PlayerInfo[]) => void) {
    const subscribeFn = () => {
      this.client.subscribe('/topic/players', (message) => {
        try {
          const players = JSON.parse(message.body) as PlayerInfo[];
          callback(players);
        } catch (e) {
          console.error('Erreur parsing subscribePlayers:', e, message.body);
        }
      });

      // Demander la liste initiale
      this.client.publish({ destination: '/app/subscribePlayers', body: '' });
    };

    this.connected ? subscribeFn() : this.pendingSubscriptions.push(subscribeFn);
  }

  updatePlayer(player: PlayerInfo) {
    this.client.publish({
      destination: '/app/updatePlayer',
      body: JSON.stringify(player),
    });
  }
}
