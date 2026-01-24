import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private config!: any;

  constructor(private http: HttpClient) {}

  load(): Promise<void> {
    return firstValueFrom(
      this.http.get<any>('/assets/config/config.json')
    ).then(cfg => {
      this.config = cfg;
    });
  }

  get<T = any>(key: string): T {
    return this.config[key];
  }
}
