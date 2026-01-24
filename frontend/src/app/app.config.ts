import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { ConfigService } from './core/services/config/config.service';

import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    // HTTP
    provideHttpClient(),

    // Global error handling
    provideBrowserGlobalErrorListeners(),

    // Zone optimisations
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Router
    provideRouter(routes),

    // ✅ Initialisation de la config AVANT bootstrap
    provideAppInitializer(() => {
      const configService = inject(ConfigService);
      return configService.load(); // Promise<void>
    }),

    // PrimeNG
    providePrimeNG({
      theme: {
        preset: Aura
      }
    })
  ]
};
