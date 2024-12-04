import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withFetch(),withInterceptors([loadingInterceptor])),
    provideAnimations(),
    provideToastr({
      timeOut:3000, preventDuplicates:true
    }),
  ]
};
