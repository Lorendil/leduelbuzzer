import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

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
        // Enregistre toutes les subscriptions en attente
        this.pendingSubscriptions.forEach((fn) => fn());
        this.pendingSubscriptions = [];
      },
      onStompError: (frame) => {
        console.error('❌ STOMP error:', frame);
      },
    });

    this.client.activate();
  }

  join(player: string) {
    this.client.publish({ destination: '/app/join', body: player });
  }

  buzz(player: string) {
    this.client.publish({ destination: '/app/buzz', body: player });
  }

  reset() {
    this.client.publish({ destination: '/app/reset' });
  }
  onReset(callback: (msg: string) => void) {
    const subscribeFn = () => {
      this.client.subscribe('/topic/reset', (message) => {
        callback(message.body);
      });
    };
    this.connected ? subscribeFn() : this.pendingSubscriptions.push(subscribeFn);
  }

  onBuzz(callback: (msg: string) => void) {
    const subscribeFn = () => {
      this.client.subscribe('/topic/buzz', (message) => {
        callback(message.body);
      });
    };
    this.connected ? subscribeFn() : this.pendingSubscriptions.push(subscribeFn);
  }

  onPlayers(callback: (players: string[]) => void) {
    const subscribeFn = () => {
      this.client.subscribe('/topic/players', (message) => {
        try {
          const players = JSON.parse(message.body) as string[];
          callback(players);
        } catch (e) {
          console.error("Erreur parsing onPlayers:", e, message.body);
        }
      });
    };
    this.connected ? subscribeFn() : this.pendingSubscriptions.push(subscribeFn);
  }

  updatePlayers(rule: string) {
    // Envoie la commande (clearAllPlayers ou nom du joueur à retirer)
    this.client.publish({ destination: '/app/updateCurrentPlayers', body: rule });
  }

  onCurrentPlayers(callback: (players: string[]) => void) {
    const subscribeFn = () => {
      this.client.subscribe('/topic/currentPlayers', (message) => {
        try {
          const players = JSON.parse(message.body) as string[];
          callback(players);
        } catch (e) {
          console.error('Erreur de parsing currentPlayers:', e, message.body);
        }
      });
    };
    this.connected ? subscribeFn() : this.pendingSubscriptions.push(subscribeFn);
  }
}
