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
        console.log("✅ WebSocket connecté !");
        this.connected = true;
        // Enregistre toutes les subscriptions en attente
        this.pendingSubscriptions.forEach(fn => fn());
        this.pendingSubscriptions = [];
      },
      onStompError: (frame) => {
        console.error("❌ STOMP error:", frame);
      }
    });

    this.client.activate();
  }

  join(player: string) {
    this.client.publish({ destination: '/app/join', body: player });
  }

  buzz(player: string) {
    this.client.publish({ destination: '/app/buzz', body: player });
  }

  onBuzz(callback: (msg: string) => void) {
    const subscribeFn = () => {
      this.client.subscribe('/topic/buzz', (message) => {
        callback(message.body);
      });
    };
    this.connected ? subscribeFn() : this.pendingSubscriptions.push(subscribeFn);
  }

  onPlayers(callback: (msg: string) => void) {
    const subscribeFn = () => {
      this.client.subscribe('/topic/players', (message) => {
        callback(message.body);
      });
    };
    this.connected ? subscribeFn() : this.pendingSubscriptions.push(subscribeFn);
  }
}
