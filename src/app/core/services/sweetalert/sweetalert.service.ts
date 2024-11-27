import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SweetalertService {

  constructor() { }
  showReload(mensaje:string) {
    return Swal.fire({
      title: mensaje,
      preConfirm: () => {
          window.location.reload();
      }
    })
  }
  showNoReload(mensaje:string) {
    return Swal.fire({
      title: mensaje,
      preConfirm: () => {}
    })
  }
}
