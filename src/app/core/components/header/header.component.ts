import { Component, ViewChild } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { ImageLoadingDirective } from '../../../shared/directives/image-loading.directive';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink,ImageLoadingDirective],
  templateUrl: './header.component.html',
  styleUrls: ['../../../../styles.css','../../../../normalize.css','../../../../icon-zmdi.css','header.component.css']
})
export class HeaderComponent {
  tipou:string|null='';
  Nombre:string|null='';
  Imagen:any='';
  isDropdownOpen = false;
  cantidadCarrito: number = 0;
  mostrarCarrito: boolean = true;
  url:string=''
  constructor(private router:Router,private SearchService: SearchService, private userService: UsersService) {
    document.addEventListener('click', (event) => {
      const dropdown = document.querySelector('.user-dropdown');
      if (dropdown && !dropdown.contains(event.target as Node)) {
        this.isDropdownOpen = false;
      }
    });

    // Suscribirse a los cambios de ruta
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.mostrarCarrito = !event.url.includes('/carrito');
        // Actualizar cantidad del carrito al cambiar de ruta
        this.actualizarCantidadCarrito();
      }
    });
  }
  ngOnInit(){
    this.url = this.router.url;
    console.log(this.url)
    this.tipou = sessionStorage.getItem('tipoUss')||null;
    this.Nombre = sessionStorage.getItem('Nombre')||null;
    this.Imagen = sessionStorage.getItem('Imagen')||'null';
    
    // Obtener cantidad inicial
    this.actualizarCantidadCarrito();

    // Suscribirse a cambios en el carrito
    this.userService.carritoActualizado.subscribe(() => {
      this.actualizarCantidadCarrito();
    });
  }
  actualizarCantidadCarrito() {
    if (this.tipou === 'Cliente' || this.tipou === 'Prestamos' || this.tipou === 'Inventario') {
      this.cantidadCarrito = 0;
      this.userService.getCarrito().subscribe({
        next: (carrito) => {
          carrito.forEach((item:any) => {
            this.cantidadCarrito += item.Cantidad;
          });
        },
        error: (error) => {
          console.error('Error al obtener cantidad del carrito:', error);
        }
      });
    }
  }
  toggleDropdown() {
    event?.stopPropagation(); // Prevenir que el evento llegue al document
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  openSearchModal() {
    this.SearchService.showSearchModal().then((result) => {
      if (result.isConfirmed) {
        this.buscar(result.value);
        console.log(result.value);
      }
    });
  }

  buscar(bookName: string) {
    // console.log('Buscando libro:', bookName);
    sessionStorage.setItem('busqueda',bookName);
    this.router.navigate(['catalogo']);
    // Aquí puedes implementar la lógica de búsqueda, por ejemplo, haciendo una llamada a una API.
  }
  salir(){
    sessionStorage.clear();
    this.router.navigate(['/login'])
  }
  openNotifications() {
    // Aquí va la lógica para manejar las notificaciones
  }
  irAlCarrito(): void {
    this.router.navigate(['/carrito']);
  }
}
