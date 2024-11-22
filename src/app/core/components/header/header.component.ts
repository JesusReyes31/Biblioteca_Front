import { Component, ViewChild } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['../../../../styles.css','../../../../normalize.css','../../../../icon-zmdi.css','header.component.css']
})
export class HeaderComponent {
  tipou:string|null='';
  Nombre:string|null='';
  Imagen:string|null='';
  isDropdownOpen = false;
  constructor(private router:Router,private SearchService: SearchService) {
    document.addEventListener('click', (event) => {
      const dropdown = document.querySelector('.user-dropdown');
      if (dropdown && !dropdown.contains(event.target as Node)) {
        this.isDropdownOpen = false;
      }
    });
  }
  ngOnInit(){
    this.tipou = sessionStorage.getItem('tipoUss')||null;
    this.Nombre = sessionStorage.getItem('Nombre')||null;
    this.Imagen = sessionStorage.getItem('Imagen')||null;
  }
  toggleDropdown() {
    event?.stopPropagation(); // Prevenir que el evento llegue al document
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  openSearchModal() {
    this.SearchService.showSearchModal().then((result) => {
      if (result.isConfirmed) {
        this.buscar(result.value);
      }
    });
  }

  buscar(bookName: string) {
    console.log('Buscando libro:', bookName);
    // Aquí puedes implementar la lógica de búsqueda, por ejemplo, haciendo una llamada a una API.
  }
  salir(){
    sessionStorage.clear();
    this.router.navigate(['/login'])
  }
  openNotifications() {
    // Aquí va la lógica para manejar las notificaciones
  }
}
