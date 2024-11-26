import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from '../services/loading.service';
import { finalize } from 'rxjs';
import { timer, switchMap } from 'rxjs';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  const LOADING_MINIMUM_TIME = 100; // 1 segundo de tiempo mínimo
  
  loadingService.show();
  
  // Creamos un timer con el tiempo mínimo
  const timer$ = timer(LOADING_MINIMUM_TIME);
  
  return next(req).pipe(
    // Esperamos a que tanto la petición como el timer terminen
    switchMap(response => {
      return timer$.pipe(
        switchMap(() => [response])
      );
    }),
    finalize(() => {
      loadingService.hide();
    })
  );
};
