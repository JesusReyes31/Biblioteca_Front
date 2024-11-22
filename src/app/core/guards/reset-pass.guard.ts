import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const resetPassGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = route.paramMap.get('token');

  if (token) {
    // Permitir el acceso si el token está presente
    return true;
  } else {
    // Redirigir si no hay token
    return router.parseUrl('/'); // Cambia '/' a la ruta de redirección deseada
  }
};
