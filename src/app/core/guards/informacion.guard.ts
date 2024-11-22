import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const informacionGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  if(sessionStorage.getItem('selectedLibro')){
    return true;
  }else{

    return router.parseUrl('/catalogo');
  }
};
