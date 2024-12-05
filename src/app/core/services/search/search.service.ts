import Swal from 'sweetalert2';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  showSearchModal() {
    return Swal.fire({
      title: '¿Qué libro estás buscando?',
      input: 'text',
      inputPlaceholder: 'Título, Autor, Género o palabra clave...',
      showCancelButton: true,
      confirmButtonText: 'Buscar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3598D9',
      cancelButtonColor: '#d33',
      reverseButtons: true,
      preConfirm: (bookName) => {
        if (!bookName) {
          Swal.showValidationMessage('Debes escribir un valor válido');
        }
        return bookName;
      },
    });
  }
}
