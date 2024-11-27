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
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Buscar',
      confirmButtonColor: '#3598D9',
      cancelButtonColor: '#d33',
      preConfirm: (bookName) => {
        if (!bookName) {
          Swal.showValidationMessage('Debes escribir un valor válido');
        }
        return bookName;
      },
    });
  }
}
